// Markdown -> HTML (marked) -> DOCX (html-to-docx)
// Usage: npm run export:docx
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import HTMLtoDOCX from 'html-to-docx';

const root = path.resolve(process.cwd());
const mdPath = path.join(root, 'docs', 'VR_Marketplace_Report.md');
const outPath = path.join(root, 'docs', 'VR_Marketplace_Report.docx');

async function main() {
  const md = await fs.readFile(mdPath, 'utf8');
  marked.setOptions({ gfm: true, headerIds: true, mangle: false });
  let body = marked.parse(md);

  // Sanitize HTML for better DOCX compatibility:
  // 1) Replace <pre> blocks with paragraph code blocks using <br/> for newlines.
  body = body.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, (_m, codeInner) => {
    // Remove wrapping <code> tags if present
    const stripped = String(codeInner)
      .replace(/^<code[^>]*>/, '')
      .replace(/<\/code>$/, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    const escaped = stripped
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');
    return `<p><code>${escaped}</code></p>`;
  });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  body { font-family: Arial, sans-serif; color: #111827; }
  h1 { font-size: 24pt; margin: 0 0 8pt; }
  h2 { font-size: 18pt; margin: 18pt 0 6pt; }
  h3 { font-size: 14pt; margin: 14pt 0 6pt; }
  p { font-size: 11pt; line-height: 1.4; margin: 6pt 0; }
  ul, ol { margin: 6pt 0 6pt 18pt; }
  code { font-family: 'Courier New', monospace; background:#f3f4f6; padding: 0 2px; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0; }
  th, td { border: 1px solid #e5e7eb; padding: 6pt; font-size: 10pt; }
  th { background: #f9fafb; }
  img { max-width: 100%; height: auto; }
</style>
</head>
<body>
${body}
</body>
</html>`;

  const fileBuffer = await HTMLtoDOCX(html, null, {
    table: { row: { cantSplit: true } },
    footer: false,
    pageNumber: false,
    // You can tune margins and page size as necessary
    margins: { top: 720, right: 720, bottom: 720, left: 720 } // twips (1/20 pt)
  }, {
    // Default font options
    footer: false
  });

  await fs.writeFile(outPath, fileBuffer);
  console.log(`Exported: ${path.relative(root, outPath)}`);
}

main().catch(err => { console.error(err); process.exit(1); });
