#!/usr/bin/env python3
"""Auditoria estática, somente leitura, de caminhos antigos e links Markdown locais.

Execução: python3 scripts/auditar-referencias-gestao.py
Não modifica arquivos, não instala executores e não acessa a rede.
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {'.git', 'node_modules', 'dist', 'build', 'coverage', '.venv', '__pycache__'}
TEXT_SUFFIXES = {'.md', '.sh', '.yml', '.yaml', '.json', '.ts', '.tsx', '.js', '.jsx', '.py', '.txt'}
LEGACY = re.compile(r'(?<![\w/])(?:docs/ai-handoff/|docs/|contratos/|Nova pasta/|(?<![\w/])(?:JIRA|ProximasFuncionalidades|projatual|projetocompleto|revisar|visaodedoisenior)\.md)')
LINK = re.compile(r'(?<!!)\[[^\]\n]+\]\((<[^>]+>|[^)\s]+)(?:\s+"[^"]*")?\)')


def source_files():
    for path in ROOT.rglob('*'):
        if path.is_file() and not any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts) and path.suffix.lower() in TEXT_SUFFIXES:
            yield path


def main():
    hits = []
    broken = []
    checked = 0
    for path in source_files():
        rel = path.relative_to(ROOT).as_posix()
        try:
            text = path.read_text(encoding='utf-8')
        except (UnicodeError, OSError):
            continue
        checked += 1
        historical = rel.startswith(('gestao/historico/', 'archive/')) or rel == 'gestao/auditoria/MATRIZ_DEPENDENCIAS_v1PC.md'
        for num, line in enumerate(text.splitlines(), 1):
            if LEGACY.search(line):
                hits.append({'file': rel, 'line': num, 'classification': 'historical' if historical else 'requires_review', 'text': line[:220]})
            if path.suffix.lower() != '.md':
                continue
            for m in LINK.finditer(line):
                raw = m.group(1).strip('<>')
                if raw.startswith(('#', 'mailto:', 'data:', '//')) or urlsplit(raw).scheme:
                    continue
                local = unquote(urlsplit(raw).path)
                if not local or local.startswith('/'):
                    continue
                target = (path.parent / local).resolve()
                if not target.is_relative_to(ROOT.resolve()) or not target.exists():
                    broken.append({'file': rel, 'line': num, 'link': raw})
    report = {'files_scanned': checked, 'legacy_references': hits, 'missing_markdown_targets': broken,
              'note': 'Referencias historicas sao preservadas; mencoes em arquivos ativos exigem revisao humana. Regex nao substitui analise semantica.'}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"RESUMO: arquivos={checked}, referencias_antigas={len(hits)}, links_ausentes={len(broken)}")
    return 0  # inventario informativo; nao bloquear CI antes de classificar achados


if __name__ == '__main__':
    raise SystemExit(main())
