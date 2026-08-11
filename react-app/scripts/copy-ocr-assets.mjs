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
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract-core-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core.wasm.js', 'tesseract-core.wasm.js'],
];

for (const [relSrc, destName] of copies) {
  const src = path.join(root, relSrc);
  if (!fs.existsSync(src)) {
    console.warn('Skip missing OCR asset:', relSrc);
    continue;
  }
  fs.copyFileSync(src, path.join(outDir, destName));
  console.log('Copied', destName);
}

async function download(url, dest) {
  if (fs.existsSync(dest)) {
    console.log('Already present:', path.basename(dest));
    return;
  }
  console.log('Downloading', path.basename(dest), '…');
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed ${url}: ${res.status}`);
  }
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log('Saved', path.basename(dest));
}

await download(
  'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0/eng.traineddata.gz',
  path.join(langDir, 'eng.traineddata.gz'),
);

const htaccess = `AddType application/javascript .js .mjs .wasm.js
AddType application/wasm .wasm
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
</IfModule>
`;
fs.writeFileSync(path.join(outDir, '.htaccess'), htaccess);

console.log('OCR assets ready in public/react/tesseract/');
