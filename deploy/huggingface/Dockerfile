# syntax=docker/dockerfile:1
# This template is made upload-ready by scripts/prepare-hf-space.py.
FROM node:24-bookworm-slim AS source
ADD https://github.com/ChaseHendrick/After-the-Sirens/archive/__SIRENS_SOURCE_COMMIT__.tar.gz /tmp/game.tar.gz
RUN mkdir /game && tar -xzf /tmp/game.tar.gz --strip-components=1 -C /game && rm /tmp/game.tar.gz

FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY --from=source /game/package.json /game/package-lock.json ./
RUN --mount=type=secret,id=proxy_ca \
    if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    npm ci --omit=dev --ignore-scripts --no-audit --no-fund

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=512 \
    PORT=7860 \
    SIRENS_HOST=0.0.0.0 \
    SIRENS_WORLD_FILE=/data/world.save.json \
    SIRENS_PUBLIC=true \
    SIRENS_NAME="Morrow Online Preview" \
    SIRENS_PRINT_SECRETS=false
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=source --chown=node:node /game/package.json /game/LICENSE /game/index.html ./
COPY --from=source --chown=node:node /game/src ./src
COPY --from=source --chown=node:node /game/server ./server
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 7860
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 7860) + '/ready', {signal: AbortSignal.timeout(4000)}).then(r => {if (!r.ok) process.exit(1)}).catch(() => process.exit(1))"
CMD ["node", "server/index.cjs"]
