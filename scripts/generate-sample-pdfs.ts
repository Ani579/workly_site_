import fs from 'fs';
import path from 'path';

/**
 * Creates a valid standalone single-page or multi-page PDF from text lines.
 */
function createSimplePdf(lines: string[]): Buffer {
  // Format lines for PDF text stream
  const escapedLines = lines.map((line) =>
    line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
  );

  let streamContent = 'BT\n/F1 10 Tf\n14 TL\n50 750 Td\n';
  for (const line of escapedLines) {
    if (line.trim().length === 0) {
      streamContent += 'T*\n';
    } else {
      streamContent += `(${line}) Tj\nT*\n`;
    }
  }
  streamContent += 'ET\n';

  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  function addObj(content: string) {
    offsets.push(Buffer.byteLength(pdf, 'utf-8'));
    pdf += content;
  }

  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  addObj(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n'
  );
  addObj('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
  addObj(`5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}endstream\nendobj\n`);

  const startxref = Buffer.byteLength(pdf, 'utf-8');
  pdf += 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i++) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf-8');
}

function main() {
  const samplesDir = path.join(process.cwd(), 'samples');
  if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
  }

  const frontendText = fs.readFileSync(path.join(samplesDir, 'resume-frontend.txt'), 'utf-8');
  const backendText = fs.readFileSync(path.join(samplesDir, 'resume-backend.txt'), 'utf-8');

  fs.writeFileSync(
    path.join(samplesDir, 'resume-frontend.pdf'),
    createSimplePdf(frontendText.split('\n'))
  );
  fs.writeFileSync(
    path.join(samplesDir, 'resume-backend.pdf'),
    createSimplePdf(backendText.split('\n'))
  );

  console.log('Successfully generated samples/resume-frontend.pdf and samples/resume-backend.pdf');
}

main();

