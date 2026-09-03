#!/bin/sh

set -eu

attempt=1
max_attempts=12

while ! ./node_modules/.bin/prisma migrate deploy; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Não foi possível aplicar as migrações após ${max_attempts} tentativas."
    exit 1
  fi

  echo "PostgreSQL ainda indisponível. Nova tentativa em 5 segundos (${attempt}/${max_attempts})."
  attempt=$((attempt + 1))
  sleep 5
done

exec node dist/src/server.js
