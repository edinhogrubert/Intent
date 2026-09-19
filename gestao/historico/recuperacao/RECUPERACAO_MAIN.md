# Consolidação da main

Data: 2026-09-06

## Fonte válida do projeto

A versão válida do Intent é a base operacional construída em `codex/mvp-backend-base`, hoje usada como origem da consolidação.

Ela contém o frontend atual, backend, migrations, Docker, scripts Oracle, testes e documentação operacional.

## Papel da antiga main

A antiga `main`, no commit `8db7ddd3abd61ba6ce9c890f0498366126481067`, **não é uma versão estável para rollback e não deve ser tratada como versão recuperável da aplicação**.

Ela foi preservada integralmente em:

`archive/intentV1/`

Seu único objetivo é servir como referência histórica para consulta de:

- telas antigas;
- componentes reaproveitáveis;
- ideias de UX;
- modelos de dados;
- regras conceituais;
- exemplos de implementação.

Nada dentro de `archive/intentV1/` deve ser importado ou executado pelo frontend, backend, Docker, migrations, deploy ou CI.

## Nova main

A nova `main` deve representar exclusivamente a evolução do código operacional atual.

Base inicial da consolidação: `codex/mvp-backend-base`, commit `b20862e74008b9735a314b75369cad93eb649d76`.

Antes da promoção final, validar frontend, backend, migrations, Docker e health checks. Se houver problema no código atual, a correção deve ser feita sobre essa linha de desenvolvimento, e não retornando para a antiga `main`.
