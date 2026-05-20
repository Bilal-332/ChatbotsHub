FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for canvas (and node-gyp)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev

# Install all deps (including dev dependencies)
COPY package*.json ./
RUN npm ci

COPY . .

# Build TypeScript
RUN npm run build

# Prune dev dependencies so node_modules only contains production deps
RUN npm prune --omit=dev


# ─── Production stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Install runtime dependencies for canvas and fonts for PDF rendering
RUN apk add --no-cache \
    cairo \
    pango \
    libjpeg-turbo \
    giflib \
    ttf-freefont

COPY package*.json ./
# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /app/tmp/uploads /app/logs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
