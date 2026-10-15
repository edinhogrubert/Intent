#!/usr/bin/env bash
latest_file(){
  python3 - "$1" "$2" <<'PYS'
import pathlib,sys
p=list(pathlib.Path(sys.argv[1]).glob(sys.argv[2]))
p=[x for x in p if x.is_file()]
if p: print(max(p,key=lambda x:(x.stat().st_mtime_ns,str(x))))
PYS
}
latest_bundle(){ latest_file "$BACKUP_DIR" '*.bundle'; }
latest_pg_backup(){ latest_file "$POSTGRES_BACKUP_DIR" 'intent_*.dump'; }
valid_bundle(){ [[ -n "$1" && -s "$1" ]] && git -C "$REPO" bundle verify "$1" >/dev/null; }
valid_pg_backup(){
  local dump="$1"
  [[ -n "$dump" && -s "$dump" && -f "$dump.sha256" ]] || return 1
  (cd "$(dirname "$dump")" && sha256sum -c "$(basename "$dump").sha256") || return 1
  command -v pg_restore >/dev/null || { echo 'pg_restore obrigatório para validar catálogo'; return 1; }
  pg_restore --list "$dump" >/dev/null || return 1
}
backup_inventory(){
  python3 - "$1" "$2" <<'PYS'
import pathlib,sys,json
print(json.dumps(sorted(str(p) for p in pathlib.Path(sys.argv[1]).glob(sys.argv[2]) if p.is_file())))
PYS
}
new_backup_paths(){
  python3 - "$1" "$2" <<'PYS'
import sys,json
for p in sorted(set(json.loads(sys.argv[2]))-set(json.loads(sys.argv[1]))):
 sys.stdout.buffer.write(p.encode()+b'\0')
PYS
}
