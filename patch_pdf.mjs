import { readFileSync, writeFileSync } from 'fs';
import { PDFDocument, rgb, StandardFonts } from './node_modules/pdf-lib/es/index.js';

const jsContent = readFileSync('src/app/helpers/defaultPdfString.js', 'utf8');
const b64 = jsContent.match(/`\s*([\s\S]*?)\s*`/)[1].replace(/\s/g, '');
const buf = Buffer.from(b64, 'base64');

const pdfDoc = await PDFDocument.load(buf);
const pages = pdfDoc.getPages();
const page = pages[0];
const { height } = page.getSize();

// pdftotext bbox: xMin=352.747 yMin=750.045 xMax=382.279 yMax=756.428 (y from top)
// pdf-lib: y from bottom
const xMin = 352.747;
const yMax_top = 756.428;
const xMax = 382.279;
const yMin_top = 750.045;
const yFromBottom = height - yMax_top;
const textHeight = yMax_top - yMin_top;

console.log('Page height:', height, '| Text y from bottom:', yFromBottom, '| textHeight:', textHeight);

// Draw white rectangle to cover old text
page.drawRectangle({
  x: xMin - 1,
  y: yFromBottom - 1,
  width: (xMax - xMin) + 4,
  height: textHeight + 2,
  color: rgb(1, 1, 1),
});

// Draw new text
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
page.drawText('\u20AC15000,-)', {
  x: xMin,
  y: yFromBottom + 0.5,
  size: 6.38,
  font,
  color: rgb(0, 0, 0),
});

const pdfBytes = await pdfDoc.saveAsBase64();
const newContent = 'export default `\n' + pdfBytes + '\n`;\n';
writeFileSync('src/app/helpers/defaultPdfString.js', newContent);
console.log('Done! Updated defaultPdfString.js');
