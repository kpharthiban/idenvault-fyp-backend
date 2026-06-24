# ── Stage 1: Build ──────────────────────────────────────────
FROM node:24.15.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Production ──────────────────────────────────────
FROM node:24.15.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Only install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Adjust if your entry point differs (check tsconfig "outDir")
CMD ["node", "dist/index.js"]