"""Contratos em temporários; mocks impedem acesso a serviços/hosts reais."""
import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]

class Contracts(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='intent contratos ')
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.bin = self.base / 'bin'
        self.bin.mkdir()
        self.env = dict(os.environ, PATH=f'{self.bin}:{os.environ["PATH"]}',
                        HOME=str(self.base), INTENT_BASE=str(self.base / 'tools'),
                        INTENT_REPO=str(self.base / 'repo'),
                        INTENT_POSTGRES_BACKUP_DIR=str(self.base / 'dumps'))
        (self.base / 'dumps').mkdir()
        (self.base / 'repo').mkdir()
        self.mock('id', 'echo grubert')
        self.mock('hostname', 'echo lubuntu')
        for command in ('ssh', 'scp', 'docker', 'curl', 'sudo'):
            self.mock(command, 'exit 93')

    def mock(self, name, body):
        p = self.bin / name
        p.write_text('#!/usr/bin/env bash\n' + body + '\n')
        p.chmod(0o755)

    def vm(self):
        self.mock('id', 'echo ubuntu')
        self.mock('hostname', 'echo intent-app-01')

    def run_cli(self, *args, success=True):
        result = subprocess.run(['bash', str(ROOT/'script/intent.sh'), *args],
                                env=self.env, text=True, capture_output=True)
        self.assertEqual(result.returncode == 0, success, result.stdout+result.stderr)
        return result

    def module(self, body, success=True):
        result = subprocess.run(['bash', '-euo', 'pipefail', '-c',
            f'source "{ROOT}/script/lib/backup.sh"; ' + body],
            env=self.env, text=True, capture_output=True)
        self.assertEqual(result.returncode == 0, success, result.stdout+result.stderr)
        return result

    def dump(self, name='intent sample.dump'):
        p = self.base/'dumps'/name
        p.write_bytes(b'simulated dump')
        digest = hashlib.sha256(p.read_bytes()).hexdigest()
        p.with_name(p.name+'.sha256').write_text(f'{digest}  {p.name}\n')
        return p

    def test_listing_and_plan_have_no_filesystem_effects(self):
        for env in ('pc','vm'):
            self.run_cli(env, 'list')
            self.run_cli(env, '--plan', '12')
        self.assertFalse((self.base/'tools').exists())

    def test_invalid_ids_and_wrong_environment(self):
        self.run_cli('pc', '0', success=False)
        self.mock('hostname', 'echo wrong')
        self.run_cli('pc', '9', success=False)
        self.assertFalse((self.base/'tools').exists())

    def test_all_fifteen_functions_defined(self):
        for env in ('pc','vm'):
            result = subprocess.run(['bash','-c',f'source "{ROOT}/script/lib/git.sh"; source "{ROOT}/script/acoes/{env}.sh"; for i in {{1..15}}; do declare -F "task_$i" >/dev/null || exit 1; done'])
            self.assertEqual(result.returncode, 0)

    def test_fetch_failure_stops_sequence(self):
        self.mock('git', '[[ "$*" == *fetch* ]] && exit 42; exit 0')
        out = self.run_cli('pc','3','14', success=False)
        self.assertNotIn('OK 3', out.stdout)
        self.assertNotIn('OK 14', out.stdout)
        self.assertTrue(list((self.base/'tools/relatorios').glob('*.log')))

    def test_health_failure_is_failure(self):
        self.vm()
        self.mock('docker','exit 0')
        self.mock('curl','exit 22')
        for id in ('8','13'):
            out = self.run_cli('vm',id, success=False)
            self.assertNotIn(f'OK {id}',out.stdout)

    def test_health_success(self):
        self.vm()
        self.mock('docker','exit 0')
        self.mock('curl','exit 0')
        self.run_cli('vm','8','13')

    def test_catalog_failure_cannot_pass(self):
        p = self.dump()
        self.mock('pg_restore','exit 1')
        self.module(f'valid_pg_backup "{p}"',success=False)
        self.mock('pg_restore','exit 0')
        self.module(f'valid_pg_backup "{p}"')
        p.write_bytes(b'corruption')
        self.module(f'valid_pg_backup "{p}"',success=False)

    def test_inventory_and_spaces(self):
        p = self.dump()
        result = self.module('a="[]"; b="$(backup_inventory "$INTENT_POSTGRES_BACKUP_DIR" "*.dump")"; new_backup_paths "$a" "$b"')
        self.assertEqual(result.stdout, str(p)+'\0')

    def test_backup_no_new_file_fails(self):
        self.vm()
        self.mock('sudo','exit 0')
        self.mock('pg_restore','exit 0')
        p=self.dump()
        routine=self.base/'routine.sh'
        routine.write_text('#!/bin/sh\nexit 0\n')
        self.env['INTENT_POSTGRES_BACKUP_SCRIPT']=str(routine)
        self.run_cli('vm','6',success=False)
        self.assertTrue(p.exists())

    def test_backup_new_file_required_and_validated(self):
        self.vm()
        self.mock('pg_restore','exit 0')
        self.mock('sudo','[[ "${1:-}" != -n ]] || shift; exec "$@"')
        routine=self.base/'routine.sh'
        routine.write_text('''#!/bin/bash
set -e
p="$INTENT_POSTGRES_BACKUP_DIR/intent new.dump"
printf data > "$p"
(cd "$INTENT_POSTGRES_BACKUP_DIR"; sha256sum 'intent new.dump' > 'intent new.dump.sha256')
''')
        self.env['INTENT_POSTGRES_BACKUP_SCRIPT']=str(routine)
        self.run_cli('vm','6')

    def test_document_presence_including_manual(self):
        self.env['INTENT_REPO']=str(ROOT)
        self.run_cli('pc','9')
        self.env['INTENT_REPO']=str(self.base/'missing')
        self.run_cli('pc','9',success=False)

    def test_deploy_requires_explicit_inputs(self):
        self.vm()
        self.run_cli('vm','12',success=False)

    def test_every_document_is_required(self):
        repo=self.base/'repo'
        subprocess.run(['git','init','-q',str(repo)],check=True)
        docs=['Agents.md','script/MANUAL.md'] + [str(p.relative_to(ROOT)) for p in (ROOT/'documentos').glob('*.md')]
        for name in docs:
            path=repo/name
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_text('fixture')
        self.run_cli('pc','9')
        for name in docs:
            path=repo/name
            path.unlink()
            self.run_cli('pc','9',success=False)
            path.write_text('fixture')

    def test_pc8_stops_on_first_failed_validation(self):
        repo=self.base/'repo'
        subprocess.run(['git','init','-q',str(repo)],check=True)
        subprocess.run(['git','-C',str(repo),'remote','add','origin','https://github.com/edinhogrubert/Intent.git'],check=True)
        (repo/'file').write_text('fixture')
        subprocess.run(['git','-C',str(repo),'add','.'],check=True)
        subprocess.run(['git','-C',str(repo),'-c','user.name=Test','-c','user.email=test@example.invalid','commit','-qm','fixture'],check=True)
        calls=self.base/'bun-calls'
        self.mock('bun', f'echo "$*" >> "{calls}"; exit 27')
        self.run_cli('pc','8',success=False)
        self.assertEqual(calls.read_text().splitlines(), ['install --frozen-lockfile'])
        self.assertFalse((repo/'node_modules').exists())

    def test_explicit_exit_invokes_component_recovery(self):
        # Executa somente handler/traps extraídos, com Docker simulado e sem preflight real.
        self.mock('docker', '[[ "$*" != *--format* ]] || echo healthy; exit 0')
        for component in ('api','frontend'):
            text=(ROOT/f'script/acoes/deploy-{component}.sh').read_text()
            start=text.index('rollback_on_error()')
            end=text.index('[[ "${INTENT_AUTORIZO_DEPLOY')
            handler=text[start:end]
            fixture='set -Eeuo pipefail; DEPLOYMENT_STARTED=1; DATABASE_MAY_HAVE_CHANGED=0; ROLLBACK_IMAGE_TAG=old; COMPOSE_IMAGE=api; FRONTEND_IMAGE=front; COMPOSE_FILE=unused; API_CONTAINER=api; FRONTEND_CONTAINER=front; '+handler+'\nexit 37\n'
            result=subprocess.run(['bash','-c',fixture],env=self.env,text=True,capture_output=True)
            self.assertEqual(result.returncode,37,result.stdout+result.stderr)
            self.assertIn('Rollback',result.stdout)

    def test_wrappers_list(self):
        for env in ('PC','VM'):
            out=subprocess.run(['bash',str(ROOT/f'scripts/executores/intent-executor-{env}.sh'),'list'],env=self.env,capture_output=True)
            self.assertEqual(out.returncode,0)
        self.assertFalse((self.base/'tools').exists())

    def test_installer_extracts_commit_and_retains_current_on_failure(self):
        repo=self.base/'install source'
        repo.mkdir()
        shutil.copytree(ROOT/'script', repo/'script')
        def git(*args):
            return subprocess.check_output(['git','-C',str(repo),*args],text=True).strip()
        git('init','-q');git('remote','add','origin','https://github.com/edinhogrubert/Intent.git');git('add','script')
        git('-c','user.name=Test','-c','user.email=test@example.invalid','commit','-qm','fixture')
        sha=git('rev-parse','HEAD')
        result=subprocess.run(['bash',str(repo/'script/instalar.sh'),'pc',sha],env=self.env,capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stdout+result.stderr)
        current=self.base/'tools/current'
        before=current.readlink()
        installed=self.base/'tools/releases'/sha
        subprocess.run(['sha256sum','-c','SHA256SUMS'],cwd=installed,check=True,stdout=subprocess.DEVNULL)
        result=subprocess.run(['bash',str(repo/'script/instalar.sh'),'pc','0'*40],env=self.env,capture_output=True)
        self.assertNotEqual(result.returncode,0)
        self.assertEqual(current.readlink(),before)
        result=subprocess.run(['bash',str(current/'script/intent.sh'),'pc','list'],env=self.env,capture_output=True)
        self.assertEqual(result.returncode,0)

if __name__=='__main__':
    unittest.main(verbosity=2)
