import type { SessionStore, UserSession } from './types.js';

/**
 * Pure JavaScript in-memory session store using Map.
 * No native dependencies - works everywhere including Render free tier.
 */
export class MemorySessionStore implements SessionStore {
  private sessions: Map<string, UserSession> = new Map();

  async get(phoneNumber: string): Promise<UserSession | null> {
    return this.sessions.get(phoneNumber) || null;
  }

  async create(phoneNumber: string): Promise<UserSession> {
    const now = new Date();
    const session: UserSession = {
      id: this.generateId(),
      phoneNumber,
      activeAgent: null,
      context: {},
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(phoneNumber, session);
    return session;
  }

  async update(phoneNumber: string, updates: Partial<UserSession>): Promise<UserSession> {
    let session = await this.get(phoneNumber);
    if (!session) {
      session = await this.create(phoneNumber);
    }

    const updatedSession: UserSession = {
      ...session,
      activeAgent: updates.activeAgent !== undefined ? updates.activeAgent : session.activeAgent,
      context: updates.context !== undefined ? updates.context : session.context,
      updatedAt: new Date(),
    };

    this.sessions.set(phoneNumber, updatedSession);
    return updatedSession;
  }

  async setActiveAgent(phoneNumber: string, agentId: string | null): Promise<void> {
    await this.update(phoneNumber, { activeAgent: agentId });
  }

  async setContext(phoneNumber: string, context: Record<string, unknown>): Promise<void> {
    await this.update(phoneNumber, { context });
  }

  async reset(phoneNumber: string): Promise<void> {
    const session = await this.get(phoneNumber);
    if (session) {
      session.activeAgent = null;
      session.context = {};
      session.updatedAt = new Date();
      this.sessions.set(phoneNumber, session);
    }
  }

  private generateId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * SQLite-based session store for persistent storage.
 * Requires better-sqlite3 native module - use only when persistence is needed.
 */
export class SQLiteSessionStore implements SessionStore {
  private db: import('better-sqlite3').Database;

  constructor(dbPath: string = ':memory:') {
    // Dynamic import to avoid loading native module unless needed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    this.db = new Database(dbPath);
    this.db.exec(SQLITE_SCHEMA);
  }

  async get(phoneNumber: string): Promise<UserSession | null> {
    const row = this.db.prepare(
      'SELECT * FROM sessions WHERE phone_number = ?'
    ).get(phoneNumber) as SessionRow | undefined;

    if (!row) return null;

    return this.rowToSession(row);
  }

  async create(phoneNumber: string): Promise<UserSession> {
    const id = this.generateId();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO sessions (id, phone_number, active_agent, context, created_at, updated_at)
      VALUES (?, ?, NULL, '{}', ?, ?)
    `).run(id, phoneNumber, now, now);

    return {
      id,
      phoneNumber,
      activeAgent: null,
      context: {},
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  async update(phoneNumber: string, updates: Partial<UserSession>): Promise<UserSession> {
    let session = await this.get(phoneNumber);
    if (!session) {
      session = await this.create(phoneNumber);
    }

    const now = new Date().toISOString();
    const newContext = updates.context !== undefined 
      ? JSON.stringify(updates.context) 
      : JSON.stringify(session.context);
    const newActiveAgent = updates.activeAgent !== undefined 
      ? updates.activeAgent 
      : session.activeAgent;

    this.db.prepare(`
      UPDATE sessions 
      SET active_agent = ?, context = ?, updated_at = ?
      WHERE phone_number = ?
    `).run(newActiveAgent, newContext, now, phoneNumber);

    return {
      ...session,
      activeAgent: newActiveAgent,
      context: updates.context ?? session.context,
      updatedAt: new Date(now),
    };
  }

  async setActiveAgent(phoneNumber: string, agentId: string | null): Promise<void> {
    await this.update(phoneNumber, { activeAgent: agentId });
  }

  async setContext(phoneNumber: string, context: Record<string, unknown>): Promise<void> {
    await this.update(phoneNumber, { context });
  }

  async reset(phoneNumber: string): Promise<void> {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE sessions 
      SET active_agent = NULL, context = '{}', updated_at = ?
      WHERE phone_number = ?
    `).run(now, phoneNumber);
  }

  close(): void {
    this.db.close();
  }

  private generateId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private rowToSession(row: SessionRow): UserSession {
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      activeAgent: row.active_agent,
      context: JSON.parse(row.context || '{}'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

const SQLITE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    active_agent TEXT,
    context TEXT DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_phone ON sessions(phone_number);
`;

interface SessionRow {
  id: string;
  phone_number: string;
  active_agent: string | null;
  context: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a session store.
 * 
 * @param dbPath - Path to SQLite database file, ':memory:' for in-memory, or undefined
 * 
 * Behavior:
 * - If SESSION_STORE=memory env var is set, always uses MemorySessionStore
 * - If dbPath is ':memory:' or undefined, uses MemorySessionStore (no native deps)
 * - If dbPath is a file path, attempts SQLiteSessionStore, falls back to MemorySessionStore
 */
export function createSessionStore(dbPath?: string): SessionStore {
  // Always use memory store if explicitly requested
  if (process.env.SESSION_STORE === 'memory') {
    return new MemorySessionStore();
  }

  // For :memory: or no path, use pure JS MemorySessionStore (no native deps needed)
  if (!dbPath || dbPath === ':memory:') {
    return new MemorySessionStore();
  }

  // For file-based storage, try SQLite but fall back to memory if native module fails
  try {
    return new SQLiteSessionStore(dbPath);
  } catch (error) {
    console.warn(
      `Failed to initialize SQLite session store: ${error instanceof Error ? error.message : error}. ` +
      'Falling back to in-memory store (sessions will not persist across restarts).'
    );
    return new MemorySessionStore();
  }
}
