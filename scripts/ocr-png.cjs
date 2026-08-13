'use strict';

const { createWorker } = require('tesseract.js');

(async () => {
  const img = process.argv[2];
  if (!img) {
    console.error('Usage: ocr-png.cjs <image.png>');
    process.exit(1);
  }

  const worker = createWorker({
    logger: () => {},
  });
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data } = await worker.recognize(img);
  await worker.terminate();
  process.stdout.write(data && data.text ? data.text : '');
})().catch((err) => {
  console.error(err && err.message ? err.message : String(err));
  process.exit(1);
});
