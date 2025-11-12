// Render all Mermaid .mmd files in docs/figures using Kroki (no local Chrome required)
// Usage: npm run export:diagrams
import fs from 'fs/promises';
import path from 'path';

const root = path.resolve(process.cwd());
const figuresDir = path.join(root, 'docs', 'figures');
const endpoint = 'https://kroki.io/mermaid/png';

async function ensureFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  const mod = await import('node-fetch');
  return mod.default;
}

async function renderFile(fetchImpl, inPath, outPath) {
  const src = await fs.readFile(inPath, 'utf8');
  const res = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: src,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kroki render failed for ${path.basename(inPath)}: ${res.status} ${res.statusText} -> ${text}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outPath, buf);
  console.log(`Rendered: ${path.relative(root, outPath)}`);
}

async function main() {
  const fetchImpl = await ensureFetch();
  const entries = await fs.readdir(figuresDir);
  const mmdFiles = entries.filter((f) => f.endsWith('.mmd'));
  if (mmdFiles.length === 0) {
    console.log('No .mmd files found in docs/figures');
    return;
  }
  for (const file of mmdFiles) {
    const inPath = path.join(figuresDir, file);
    const outPath = path.join(figuresDir, file.replace(/\.mmd$/i, '.png'));
    await renderFile(fetchImpl, inPath, outPath);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
