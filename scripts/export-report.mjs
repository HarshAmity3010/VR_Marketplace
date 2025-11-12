// Simple Markdown to HTML exporter for docs/VR_Marketplace_Report.md
// Usage: npm run export:report
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';

const root = path.resolve(process.cwd());
const mdPath = path.join(root, 'docs', 'VR_Marketplace_Report.md');
const outPath = path.join(root, 'docs', 'VR_Marketplace_Report.html');

async function main() {
  const md = await fs.readFile(mdPath, 'utf8');
  // Configure marked
  marked.setOptions({
    gfm: true,
    breaks: false,
    headerIds: true,
    mangle: false,
  });
  const body = marked.parse(md);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VR Marketplace Report</title>
  <style>
    :root { --fg: #1b1f23; --bg: #ffffff; --muted: #6a737d; --accent: #0ea5e9; }
    html, body { padding: 0; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif; color: var(--fg); background: var(--bg); }
    .container { max-width: 960px; margin: 2rem auto; padding: 0 1rem 4rem; }
    h1, h2, h3, h4 { color: #0f172a; }
    h1 { font-size: 2rem; margin-top: 1.5rem; }
    h2 { font-size: 1.6rem; margin-top: 1.6rem; border-bottom: 2px solid #e2e8f0; padding-bottom: .25rem; }
    h3 { font-size: 1.25rem; margin-top: 1.25rem; }
    p { line-height: 1.6; }
    code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
    pre { background: #0b1020; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow: auto; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #e2e8f0; padding: .5rem .6rem; text-align: left; }
    th { background: #f8fafc; }
    blockquote { color: #334155; border-left: 4px solid #cbd5e1; padding-left: .75rem; margin-left: 0; }
    img { max-width: 100%; height: auto; border-radius: 6px; }
    .title { font-size: 2.25rem; font-weight: 700; margin-bottom: .25rem; }
    .meta { color: var(--muted); margin-bottom: 1.5rem; }
    @media print {
      .container { max-width: 100%; margin: 0; padding: 0; }
      a { color: #000; }
      pre { white-space: pre-wrap; word-wrap: break-word; }
    }
  </style>
</head>
<body>
  <main class="container">
    ${body}
  </main>
</body>
</html>`;
  await fs.writeFile(outPath, html, 'utf8');
  console.log(`Exported: ${path.relative(root, outPath)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
