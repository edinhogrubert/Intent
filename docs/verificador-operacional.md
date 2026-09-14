# Correção do verificador operacional

Versiona o script originalmente localizado em Downloads em
`deploy/oracle/21-verificar-intent-completo.sh`.

Exige HEAD igual à main remota consultada por `git ls-remote origin refs/heads/main`.
Remove referências históricas e o fetch que modificava referências locais.
Árvore suja, erro na consulta Git e qualquer divergência de HEAD falham.
`GIT_OPTIONAL_LOCKS=0` preserva o índice durante a consulta de status.

Substitui o texto antigo do frontend por `Escolher feed` e `following`.
Mantém privacidade, HTTP 401 do Seguindo, listas sociais, saúde, portas locais,
CORS, Firebase, COOP e backup. A inspeção do bundle é estática, não valida navegação.

Uso: `sudo bash deploy/oracle/21-verificar-intent-completo.sh`.
Padrões: SOURCE_DIR=/opt/intent/source e GIT_USER=ubuntu.
A aprovação da main permanece responsabilidade do processo de revisão/CI.

Validação local: bash -n PASS; 16 cenários simulados PASS; git diff --check PASS.
Inclui mvp-1.0.13/79f169e com HEAD alinhado, divergência, árvore suja e falhas
de saúde/segurança. O teste substitui comandos externos e desativa somente
a guarda root na cópia temporária. Nenhuma VM ou serviço real foi acessado.
As cópias originais em Downloads não foram alteradas.
