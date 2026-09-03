FROM oven/bun:1.4.0-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run lint && bun run build

FROM nginx:1.28-alpine AS runtime

COPY deploy/oracle/frontend.nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --retries=8 --start-period=10s \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
