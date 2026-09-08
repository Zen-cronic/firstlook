# FirstLook production image: Next.js 15 UI + Remotion engine + uvx mcp-clickhouse
FROM ghcr.io/astral-sh/uv:latest AS uv-bin
FROM node:22-bookworm-slim

# Install uv and uvx for mcp-clickhouse
COPY --from=uv-bin /uv /uvx /bin/

# Install system runtime dependencies: python3, ffmpeg, Chromium libs, fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip \
    ffmpeg ca-certificates fonts-liberation \
    libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 libxrandr2 \
    libxkbcommon0 libxfixes3 libxcomposite1 libxdamage1 libatk-bridge2.0-0 \
    libpango-1.0-0 libcairo2 libcups2 libxcb1 libx11-6 libxext6 libxi6 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application
RUN npm run build

# Pre-download Remotion headless Chromium
RUN npx remotion browser ensure || true

# Pre-warm uvx mcp-clickhouse
RUN uvx mcp-clickhouse --version || true

ENV STORAGE_DIR=/app/storage
VOLUME /app/storage

EXPOSE 8080
ENV PORT=8080

CMD ["sh", "-c", "npm run start -- -p ${PORT:-8080}"]
