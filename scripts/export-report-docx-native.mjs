// Build a .docx directly (no HTML) from Markdown using 'docx' and 'marked' tokenization
// Usage: npm run export:docx:native
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
} from 'docx';
import { ImageRun } from 'docx';

const root = path.resolve(process.cwd());
const mdPath = path.join(root, 'docs', 'VR_Marketplace_Report.md');
const outPath = path.join(root, 'docs', 'VR_Marketplace_Report.docx');

function textRunsFromInline(tokens) {
  const runs = [];
  for (const t of tokens) {
    if (t.type === 'text') {
      runs.push(new TextRun({ text: t.text }));
    } else if (t.type === 'strong') {
      runs.push(new TextRun({ text: t.text, bold: true }));
    } else if (t.type === 'em') {
      runs.push(new TextRun({ text: t.text, italics: true }));
    } else if (t.type === 'codespan') {
      runs.push(new TextRun({ text: t.text, font: { name: 'Courier New' } }));
    } else if (t.type === 'link') {
      runs.push(new TextRun({ text: t.text || t.href, style: 'Hyperlink' }));
    } else if (t.type === 'space') {
      runs.push(new TextRun({ text: ' ' }));
    } else if (t.raw) {
      runs.push(new TextRun({ text: t.raw }));
    }
  }
  return runs;
}

async function createRunsAndImagesFromInline(tokens, baseDir) {
  const children = [];
  for (const t of tokens) {
    if (!t) continue;
    if (t.type === 'text') {
      children.push(new TextRun({ text: t.text }));
    } else if (t.type === 'image') {
      try {
        const href = t.href || t.src || t.raw;
        const imgPath = path.isAbsolute(href) ? href : path.join(baseDir, href);
        const data = await fs.readFile(imgPath);
        // Attempt to insert image with a reasonable size
        children.push(new ImageRun({ data, transformation: { width: 480, height: 320 } }));
      } catch (e) {
        children.push(new TextRun({ text: t.text || `[image:${t.href}]` }));
      }
    } else if (t.type === 'strong') {
      children.push(new TextRun({ text: t.text, bold: true }));
    } else if (t.type === 'em') {
      children.push(new TextRun({ text: t.text, italics: true }));
    } else if (t.type === 'codespan') {
      children.push(new TextRun({ text: t.text, font: { name: 'Courier New' } }));
    } else if (t.type === 'link') {
      children.push(new TextRun({ text: t.text || t.href, style: 'Hyperlink' }));
    } else if (t.raw) {
      children.push(new TextRun({ text: t.raw }));
    }
  }
  return children;
}

async function createImageParagraphsFromToken(t, baseDir) {
  // Return an array of Paragraphs: image centered, followed by a caption paragraph (italic, centered)
  try {
    const href = t.href || t.src || t.raw;
    const imgPath = path.isAbsolute(href) ? href : path.join(baseDir, href);
    const data = await fs.readFile(imgPath);
    const img = new ImageRun({ data, transformation: { width: 480, height: 320 } });
    const pImg = new Paragraph({ children: [img], alignment: AlignmentType.CENTER });
    const captionText = (t.text && t.text.trim()) ? t.text : path.basename(href || 'image');
    const pCaption = new Paragraph({ children: [new TextRun({ text: captionText, italics: true, size: 20 })], alignment: AlignmentType.CENTER });
    return [pImg, pCaption];
  } catch (e) {
    return [new Paragraph({ children: [new TextRun({ text: t.text || `[image:${t.href}]` })] })];
  }
}

function paragraphFromText(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text })],
    ...opts,
  });
}

async function main() {
  const md = await fs.readFile(mdPath, 'utf8');
  const tokens = marked.lexer(md);

  const docChildren = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const level = Math.min(3, token.depth);
        docChildren.push(
          new Paragraph({
            heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
            children: [new TextRun(token.text)],
          })
        );
        break;
      }
      case 'paragraph': {
        if (token.tokens && Array.isArray(token.tokens) && token.tokens.length > 0) {
          // If the paragraph contains image tokens, render each image as its own centered paragraph
          const hasImage = token.tokens.some((tt) => tt && tt.type === 'image');
          if (hasImage) {
            let pendingRuns = [];
            for (const tt of token.tokens) {
              if (!tt) continue;
              if (tt.type === 'image') {
                // flush pending runs as a paragraph
                if (pendingRuns.length > 0) {
                  docChildren.push(new Paragraph({ children: pendingRuns }));
                  pendingRuns = [];
                }
                const imgParas = await createImageParagraphsFromToken(tt, path.join(root, 'docs'));
                docChildren.push(...imgParas);
              } else {
                const runs = await createRunsAndImagesFromInline([tt], path.join(root, 'docs'));
                pendingRuns.push(...runs);
              }
            }
            if (pendingRuns.length > 0) {
              docChildren.push(new Paragraph({ children: pendingRuns }));
            }
          } else {
            const children = await createRunsAndImagesFromInline(token.tokens, path.join(root, 'docs'));
            docChildren.push(new Paragraph({ children }));
          }
        } else {
          docChildren.push(new Paragraph({ children: [new TextRun(token.text || '')] }));
        }
        break;
      }
      case 'list': {
        for (const item of token.items) {
          docChildren.push(new Paragraph({
            children: [new TextRun(item.text)],
            numbering: token.ordered ? { reference: 'ordered-list', level: 0 } : { reference: 'bulleted-list', level: 0 },
          }));
        }
        break;
      }
      case 'table': {
        const rows = [];
        // Header row
        if (token.header && token.align) {
          const headerCells = token.header.map((h) => new TableCell({ children: [paragraphFromText(h)] }));
          rows.push(new TableRow({ children: headerCells }));
        }
        // Body rows
        for (const row of token.rows || []) {
          const cells = row.map((c) => new TableCell({ children: [paragraphFromText(c)] }));
          rows.push(new TableRow({ children: cells }));
        }
        docChildren.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows,
        }));
        break;
      }
      case 'code': {
        const lines = token.text.split('\n');
        for (const line of lines) {
          docChildren.push(new Paragraph({
            children: [new TextRun({ text: line, font: { name: 'Courier New' } })],
          }));
        }
        break;
      }
      case 'blockquote': {
        docChildren.push(new Paragraph({ children: [new TextRun(token.text)], alignment: AlignmentType.LEFT }));
        break;
      }
      case 'hr': {
        docChildren.push(new Paragraph({}));
        break;
      }
      default: {
        // Skip tokens like html/raw; add as plain text if needed
        if (token.raw) {
          docChildren.push(paragraphFromText(token.raw));
        }
      }
    }
  }

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          basedOn: 'Normal',
          run: { size: 22 }, // 11pt
          paragraph: { spacing: { after: 120 } },
        },
      ],
      default: {
        document: {
          run: { size: 22, font: 'Arial' },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: 'bulleted-list',
          levels: [{ level: 0, format: 'bullet', text: '\u2022', alignment: AlignmentType.LEFT }],
        },
        {
          reference: 'ordered-list',
          levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.LEFT }],
        },
      ],
    },
    sections: [
      {
        children: docChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(outPath, buffer);
  console.log(`Exported (native): ${path.relative(root, outPath)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
