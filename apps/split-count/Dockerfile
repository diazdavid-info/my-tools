# --- Build stage ---
FROM node:24-slim AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# split-count has its own lockfile and no workspace dependencies.
COPY apps/split-count/package.json apps/split-count/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy only the files required to build split-count.
COPY apps/split-count/astro.config.mjs apps/split-count/tsconfig.json ./
COPY apps/split-count/src/ ./src/
COPY apps/split-count/public/ ./public/

RUN pnpm build

# --- Production stage ---
FROM node:24-slim

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

COPY apps/split-count/package.json apps/split-count/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/public/ ./public/

EXPOSE 4321

# Coolify must provide DB_PATH and mount its parent directory as persistent storage.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || '4321') + '/').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"]

CMD ["node", "dist/server/entry.mjs"]
