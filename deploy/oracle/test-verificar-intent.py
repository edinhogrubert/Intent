"""Regressão isolada: nenhum comando alcança Docker, rede ou banco reais."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).with_name('21-verificar-intent-completo.sh')
SHIM = r'''#!/usr/bin/env bash
case "${0##*/}" in
  sudo) shift 2; exec "$@" ;;
  git)
    case "$3" in
      rev-parse) echo "${TEST_HEAD:-79f169e89a03631e13eae9b913d79bdf2a953eb4}" ;;
      ls-remote) [[ "${CASE:-}" != remote_failure ]] || exit 1
        printf '%s\trefs/heads/main\n' "${TEST_REMOTE:-79f169e89a03631e13eae9b913d79bdf2a953eb4}" ;;
      status) [[ "${CASE:-}" != status_failure ]] || exit 1
        [[ "${CASE:-}" != dirty ]] || echo ' M src/App.tsx' ;;
      *) echo 'Unexpected Git write/command' >&2; exit 90 ;;
    esac ;;
  docker)
    case "$1" in
      inspect)
        if [[ "$2" == *Running* ]]; then echo true
        elif [[ "${CASE:-}" == unhealthy ]]; then echo unhealthy
        else echo healthy; fi ;;
      port)
        if [[ "${CASE:-}" == public_port ]]; then echo 0.0.0.0:8080
        elif [[ "$2" == intent-api ]]; then echo 127.0.0.1:8080
        else echo 127.0.0.1:3000; fi ;;
      exec)
        [[ "${CASE:-}" != cors || "$*" != *CORS_ORIGINS* ]] || exit 1
        [[ "${CASE:-}" != firebase || "$*" != *FIREBASE_PROJECT_ID* ]] || exit 1
        [[ "${CASE:-}" != privacy || "$*" != *'visível somente'* ]] || exit 1
        [[ "${CASE:-}" != ui || "$*" != *'Escolher feed'* ]] || exit 1
        [[ "$2" != intent-redis ]] || echo PONG ;;
      *) exit 90 ;;
    esac ;;
  curl)
    if [[ "$*" == *scope=following* ]]; then
      if [[ "${CASE:-}" == following_open ]]; then echo 200; else echo 401; fi
    elif [[ "$*" == *scope=public* ]]; then echo 200
    elif [[ "$*" == *-sSI* ]]; then
      [[ "${CASE:-}" == coop ]] || echo 'Cross-Origin-Opener-Policy: same-origin-allow-popups'
    elif [[ "${CASE:-}" == health ]]; then exit 1; fi ;;
  find) [[ "${CASE:-}" == backup ]] || echo '123 /fixture/backup.dump' ;;
esac
exit 0
'''


class VerifierTests(unittest.TestCase):
    def test_scenarios(self):
        cases = {'release': {}, 'new_main': {'TEST_HEAD': 'a' * 40, 'TEST_REMOTE': 'a' * 40},
                 'different_head': {'TEST_HEAD': 'b' * 40}}
        for name in ('dirty', 'remote_failure', 'status_failure', 'unhealthy',
                     'public_port', 'cors', 'firebase', 'privacy', 'ui',
                     'following_open', 'coop', 'health', 'backup'):
            cases[name] = {'CASE': name}
        with tempfile.TemporaryDirectory(prefix='intent-verifier-') as tmp:
            # Apenas a guarda root é substituída na cópia de teste. Todos os
            # acessos privilegiados são shims; não há serviços reais envolvidos.
            fixture = Path(tmp, 'verifier.sh')
            fixture.write_text(SCRIPT.read_text().replace(
                'if [[ "${EUID}" -ne 0 ]]; then', 'if false; then'))
            for name in ('git', 'sudo', 'docker', 'curl', 'find'):
                path = Path(tmp, name)
                path.write_text(SHIM)
                path.chmod(0o755)
            for name, overrides in cases.items():
                with self.subTest(name=name):
                    env = dict(os.environ, PATH=tmp + ':/usr/bin:/bin', **overrides)
                    result = subprocess.run(['bash', str(fixture)], env=env,
                                            capture_output=True, text=True, timeout=10)
                    expected = 0 if name in ('release', 'new_main') else 1
                    self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
                    print(name + ': PASS')


if __name__ == '__main__':
    unittest.main()
