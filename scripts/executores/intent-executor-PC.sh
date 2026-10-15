#!/usr/bin/env bash
# Compatibilidade de checkout; instalar pacote completo para uso fora dele.
exec bash "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/../../script/intent.sh" pc "$@"
