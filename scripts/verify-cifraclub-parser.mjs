#!/usr/bin/env node

/**
 * Script utilitário para validar rapidamente o parser do CifraClub contra um HTML local ou URL.
 * Uso:
 *   node scripts/verify-cifraclub-parser.mjs <url-ou-caminho-html>
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadParserModule() {
  const parserPath = resolve(__dirname, '../supabase/functions/process-cifraclub/parser.ts');
  const source = await readFile(parserPath, 'utf8');

  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2020,
      target: ts.ScriptTarget.ES2020,
    },
  });

  const dataUrl = `data:text/javascript;base64,${Buffer.from(output.outputText).toString('base64')}`;
  return import(dataUrl);
}

async function getHtml(target) {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    const response = await fetch(target, {
      headers: {
        'User-Agent': 'MMGParserTest/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao buscar URL (${response.status})`);
    }

    const html = await response.text();
    return { html, sourceUrl: target };
  }

  const filePath = resolve(process.cwd(), target);
  const html = await readFile(filePath, 'utf8');
  return { html };
}

async function main() {
  const target = process.argv[2];

  if (!target) {
    console.error('Uso: node scripts/verify-cifraclub-parser.mjs <url-ou-arquivo.html>');
    process.exit(1);
  }

  const parser = await loadParserModule();
  const { html, sourceUrl } = await getHtml(target);

  const version = parser.parseVersion(html, sourceUrl);
  const content = parser.parseCifraClubContent(html);
  const keyFromPage = parser.parseKey(html);
  const relativeMajor = parser.parseKey('Tom: <span>Em</span>');

  const result = {
    version,
    keyFromPage,
    relativeMajor,
    removedDedilhado: !content.includes('Dedilhado'),
    removedTabSections: !content.includes('[Tab'),
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error('Erro ao executar verificação:', error);
  process.exit(1);
});
