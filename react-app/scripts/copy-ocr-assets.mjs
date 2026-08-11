import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, '../public/react/tesseract');
const langDir = path.join(outDir, 'lang');

fs.mkdirSync(langDir, { recursive: true });

const copies = [
  ['node_modules/tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
];

for (const [relSrc, destName] of copies) {
  const src = path.join(root, relSrc);
  if (!fs.existsSync(src)) {
    console.error('Missing OCR asset:', src);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(outDir, destName));
  console.log('Copied', destName);
}

const trainedGz = path.join(langDir, 'eng.traineddata.gz');
if (!fs.existsSync(trainedGz)) {
  const url = 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0/eng.traineddata.gz';
  console.log('Downloading eng.traineddata.gz…');
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Download failed:', res.status);
    process.exit(1);
  }
  fs.writeFileSync(trainedGz, Buffer.from(await res.arrayBuffer()));
  console.log('Saved eng.traineddata.gz');
} else {
  console.log('eng.traineddata.gz already present');
}

console.log('OCR assets ready in public/react/tesseract/');
