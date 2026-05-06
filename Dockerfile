# ── Stage 1: Build React frontend ──
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production=false

COPY . .
RUN npm run build

# ── Stage 2: Production server ──
FROM node:20-alpine AS production

WORKDIR /app

# Only install production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy server + built frontend
COPY server.cjs ./
COPY --from=builder /app/dist ./dist

# Non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.cjs"]
