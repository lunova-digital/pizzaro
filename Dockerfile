# ── Stage 1: install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ── Stage 2: build the Next.js app ────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Provide placeholder env vars so module-level checks pass during build.
# These are NOT used at runtime — real values come from docker-compose.
ENV MONGODB_URI=mongodb://placeholder:27017/pizzaro
ENV NEXTAUTH_SECRET=build-time-placeholder
ENV NEXTAUTH_URL=http://localhost:8336
ENV NODE_ENV=production

RUN npm run build

# ── Stage 3: seeder (runs seed/index.ts on first boot) ────────────────────────
FROM node:20-alpine AS seeder
WORKDIR /app

RUN npm install -g tsx --silent

COPY --from=deps /app/node_modules ./node_modules
COPY . .

CMD ["tsx", "seed/index.ts"]

# ── Stage 4: minimal production image ─────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js standalone server reads PORT and HOSTNAME
ENV PORT=8336
ENV HOSTNAME=0.0.0.0

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy the standalone server bundle
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets and public files
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Ensure the uploads directory exists and is writable
RUN mkdir -p public/uploads && chown nextjs:nodejs public/uploads

USER nextjs

EXPOSE 8336

# The standalone server.js honours the PORT env var
CMD ["node", "server.js"]
