# Recuperação e consolidação da main

Data: 2026-09-06

A antiga `main` será preservada integralmente em `archive/intentV1/` como referência histórica e não deverá ser usada pelo frontend, backend, Docker, migrations, scripts de deploy ou CI.

Base da consolidação: `codex/mvp-backend-base` no commit `b20862e74008b9735a314b75369cad93eb649d76`.
Antiga `main`: commit `8db7ddd3abd61ba6ce9c890f0498366126481067`.
Commit operacional validado anteriormente: `09add9f0e257b2df5a877b37eb4a59ae76b80709`.

Antes de promover para `main`, validar frontend, backend, migrations, Docker e health checks. O conteúdo de `archive/intentV1/` é somente referência e deve permanecer fora do caminho de execução da aplicação.
