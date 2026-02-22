# --- Build stage ---
FROM node:24-slim AS build

WORKDIR /app

# Copy workspace tsconfig package
COPY packages/mytools-tsconfig/ ./packages/mytools-tsconfig/

# Copy app source and config
COPY apps/search-home/package.json apps/search-home/tsconfig.json ./
COPY apps/search-home/src/ ./src/

# Install deps, pointing workspace refs to local paths
RUN sed -i 's|"mytools-tsconfig": "workspace:\*"|"mytools-tsconfig": "file:./packages/mytools-tsconfig"|' package.json \
    && sed -i '/"eslint-config-mytools"/d' package.json \
    && npm install

# Build
RUN npx tsc

# --- Production stage ---
FROM node:24-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
    libpango-1.0-0 libcairo2 libasound2 libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY apps/search-home/package.json ./
RUN sed -i '/"mytools-tsconfig"/d' package.json \
    && sed -i '/"eslint-config-mytools"/d' package.json \
    && npm install --omit=dev \
    && npx playwright install chromium

COPY --from=build /app/dist/ ./dist/

ENV NODE_ENV=production
ENV DB_PATH=/app/data/data.db

VOLUME ["/app/data"]

CMD ["node", "dist/index.js"]
