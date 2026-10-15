#!/usr/bin/env bash
# Compatibilidade temporária: implementação única em script/.
exec bash "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/../../script/acoes/deploy-frontend.sh" "$@"
