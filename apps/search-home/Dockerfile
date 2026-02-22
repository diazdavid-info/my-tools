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

WORKDIR /app

COPY apps/search-home/package.json ./
RUN sed -i '/"mytools-tsconfig"/d' package.json \
    && sed -i '/"eslint-config-mytools"/d' package.json \
    && npm install --omit=dev \
    && npx playwright install --with-deps chromium

COPY --from=build /app/dist/ ./dist/

ENV NODE_ENV=production
ENV DB_PATH=/app/data/data.db

VOLUME ["/app/data"]

CMD ["node", "dist/index.js"]
