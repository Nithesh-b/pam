import Database from 'better-sqlite3';
import type { SessionStore, UserSession } from './types.js';

const SCHEMA = `
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

export class SQLiteSessionStore implements SessionStore {
  private db: Database.Database;

  constructor(dbPath: string = ':memory:') {
    this.db = new Database(dbPath);
    this.db.exec(SCHEMA);
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

interface SessionRow {
  id: string;
  phone_number: string;
  active_agent: string | null;
  context: string;
  created_at: string;
  updated_at: string;
}

export function createSessionStore(dbPath?: string): SessionStore {
  return new SQLiteSessionStore(dbPath);
}
