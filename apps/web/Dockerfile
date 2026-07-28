# APZHUB-OPS-002 A1 — Production image for @apzhub/web (Platform 1.2.0)
# Build from repository root:
#   docker build -f apps/web/Dockerfile -t apzhub/web:1.2.0 .

ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate
WORKDIR /app

FROM base AS builder
ARG PLATFORM_VERSION=1.2.0
ARG BUILD_NUMBER=local
# Build-time placeholders only (Next may evaluate env during page data collection).
# Runtime secrets MUST come from .env.production / compose — never bake production secrets into the image.
ARG BETTER_AUTH_SECRET=build-time-placeholder-not-for-production-use-min-32
ARG BETTER_AUTH_URL=http://localhost:3300
ARG DATABASE_URL=postgresql://apzhub:apzhub@127.0.0.1:54334/apzhub
ARG REDIS_URL=redis://127.0.0.1:6380
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PLATFORM_VERSION=${PLATFORM_VERSION}
ENV BUILD_NUMBER=${BUILD_NUMBER}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV DATABASE_URL=${DATABASE_URL}
ENV REDIS_URL=${REDIS_URL}
ENV ALLOW_DEV_REGISTRATION=false
ENV NEXT_PUBLIC_ALLOW_DEV_REGISTRATION=false
ENV AUTHORIZATION_PROVIDER_MODE=production
COPY . .
RUN pnpm install --frozen-lockfile \
  && pnpm --filter @apzhub/web build

FROM node:${NODE_VERSION}-bookworm-slim AS runner
ARG PLATFORM_VERSION=1.2.0
ARG BUILD_NUMBER=local
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3300
ENV HOSTNAME=0.0.0.0
ENV PLATFORM_VERSION=${PLATFORM_VERSION}
ENV BUILD_NUMBER=${BUILD_NUMBER}
WORKDIR /app

RUN groupadd --system --gid 1001 apzhub \
  && useradd --system --uid 1001 --gid apzhub apzhub

COPY --from=builder --chown=apzhub:apzhub /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=apzhub:apzhub /app/apps/web/.next/standalone ./
COPY --from=builder --chown=apzhub:apzhub /app/apps/web/.next/static ./apps/web/.next/static

USER apzhub
EXPOSE 3300

LABEL org.opencontainers.image.title="APZHUB Web" \
      org.opencontainers.image.description="APZHUB Platform web application" \
      org.opencontainers.image.version="${PLATFORM_VERSION}" \
      org.opencontainers.image.revision="${BUILD_NUMBER}" \
      apzhub.platform.version="${PLATFORM_VERSION}" \
      apzhub.package="@apzhub/web"

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3300/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/web/server.js"]
