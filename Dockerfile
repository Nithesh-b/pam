# PAM - Personal Agent Manager
# Multi-stage Docker build for production

# ============================================
# Stage 1: Base image with pnpm
# ============================================
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# ============================================
# Stage 2: Install dependencies
# ============================================
FROM base AS deps

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/core/package.json ./packages/core/
COPY packages/whatsapp/package.json ./packages/whatsapp/
COPY packages/agents/zomato/package.json ./packages/agents/zomato/
COPY packages/agents/uber/package.json ./packages/agents/uber/
COPY packages/agents/phonepe/package.json ./packages/agents/phonepe/
COPY packages/agents/flipkart/package.json ./packages/agents/flipkart/
COPY packages/agents/blinkit/package.json ./packages/agents/blinkit/
COPY packages/agents/jiohotstar/package.json ./packages/agents/jiohotstar/
COPY packages/agents/truecaller/package.json ./packages/agents/truecaller/
COPY packages/agents/makemytrip/package.json ./packages/agents/makemytrip/
COPY packages/agents/onemg/package.json ./packages/agents/onemg/
COPY packages/agents/airtel/package.json ./packages/agents/airtel/
COPY apps/gateway/package.json ./apps/gateway/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 3: Build
# ============================================
FROM base AS builder

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/packages/whatsapp/node_modules ./packages/whatsapp/node_modules
COPY --from=deps /app/packages/agents/zomato/node_modules ./packages/agents/zomato/node_modules
COPY --from=deps /app/packages/agents/uber/node_modules ./packages/agents/uber/node_modules
COPY --from=deps /app/apps/gateway/node_modules ./apps/gateway/node_modules

# Copy source code
COPY . .

# Build all packages
RUN pnpm build

# ============================================
# Stage 4: Production runner
# ============================================
FROM base AS runner

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 pam

# Copy built application
COPY --from=builder --chown=pam:nodejs /app/package.json ./
COPY --from=builder --chown=pam:nodejs /app/pnpm-workspace.yaml ./
COPY --from=builder --chown=pam:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=pam:nodejs /app/packages ./packages
COPY --from=builder --chown=pam:nodejs /app/apps ./apps

# Switch to non-root user
USER pam

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "apps/gateway/dist/index.js"]
