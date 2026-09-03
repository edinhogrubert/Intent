FROM node:22-alpine AS build

WORKDIR /app
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache openssl \
    && addgroup -S intent \
    && adduser -S -G intent intent

COPY --from=build --chown=intent:intent /app/node_modules ./node_modules
COPY --from=build --chown=intent:intent /app/dist ./dist
COPY --chown=intent:intent prisma ./prisma
COPY --chown=intent:intent package.json ./package.json
COPY --chown=intent:intent docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod 0755 ./docker-entrypoint.sh

USER intent
EXPOSE 8080

ENTRYPOINT ["./docker-entrypoint.sh"]
