#!/usr/bin/env bash
task_2(){
  need_repo || return 1
  local state
  git -C "$REPO" remote get-url origin || return 1
  git -C "$REPO" symbolic-ref --short -q HEAD || echo 'HEAD destacado'
  git -C "$REPO" rev-parse HEAD || return 1
  state="$(git -C "$REPO" status --porcelain)" || return 1
  [[ -z "$state" ]] || { printf '%s\n' "$state"; fail 2 'árvore suja'; return 1; }
  ok 2 'Git inspecionado; imagem e remoto vigente não certificados'
}

task_3(){
  need_repo || { fail 3 'repo inválido'; return 1; }
  git -C "$REPO" fetch --tags --quiet origin || { fail 3 'fetch tags falhou'; return 1; }
  echo "tag-no-head: $(git -C "$REPO" describe --tags --exact-match 2>/dev/null || echo nenhuma)"
  git -C "$REPO" tag --list 'mvp-*' --sort=-version:refname | head -n 10 || true
  ok 3 'release/tag verificada'
}

task_9(){
  need_repo || { fail 9 'repo inválido'; return 1; }
  local files=(Agents.md documentos/00_VISAO.md documentos/01_CASOS_DE_USO.md documentos/02_REGRAS.md documentos/03_ARQUITETURA.md documentos/04_STATUS.md documentos/05_DECISOES.md documentos/06_TESTES.md documentos/07_HISTORICO.md documentos/8_Novas_funcionalidades.md documentos/9_scripts.md script/MANUAL.md)
  local miss=0; for f in "${files[@]}"; do [[ -f "$REPO/$f" ]] || { echo "ausente: $f"; miss=1; }; done
  [[ $miss -eq 0 ]] || { fail 9 'continuidade incompleta'; return 1; }
  ok 9 'estrutura documental presente; vigência exige conferência das fontes'
}
