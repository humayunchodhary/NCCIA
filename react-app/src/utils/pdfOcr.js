import * as pdfjsLib from 'pdfjs-dist';
import { createWorker, OEM } from 'tesseract.js';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const TESS_BASE = `${import.meta.env.BASE_URL}tesseract`;

let workerPromise = null;

async function getOcrWorker(onStatus) {
  if (!workerPromise) {
    onStatus?.('Loading OCR engine…');
    workerPromise = createWorker('eng', OEM.LSTM_ONLY, {
      workerPath: `${TESS_BASE}/worker.min.js`,
      corePath: `${TESS_BASE}`,
      langPath: `${TESS_BASE}/lang`,
      workerBlobURL: false,
      gzip: true,
      logger: (m) => {
        if (m.status === 'loading tesseract core' && onStatus) {
          onStatus('Loading OCR core…');
        }
        if (m.status === 'initializing tesseract' && onStatus) {
          onStatus('Initializing OCR…');
        }
        if (m.status === 'loading language traineddata' && onStatus) {
          onStatus('Loading English language data…');
        }
      },
    });
  }
  return workerPromise;
}

async function renderPageToDataUrl(page, scale = 2.5) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  return canvas.toDataURL('image/png');
}

async function extractPageText(page) {
  const content = await page.getTextContent();
  return content.items.map((item) => item.str).join(' ').trim();
}

async function ocrImage(worker, dataUrl, onStatus) {
  const result = await worker.recognize(dataUrl);
  onStatus?.('OCR complete');
  return (result.data.text || '').trim();
}

/**
 * Extract text from a PDF using embedded text or browser OCR.
 */
export async function extractTextFromPdf(file, onStatus) {
  onStatus?.('Loading PDF…');
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
  const pageCount = Math.min(pdf.numPages, 2);
  const parts = [];

  for (let i = 1; i <= pageCount; i += 1) {
    onStatus?.(`Reading page ${i}/${pageCount}…`);
    const page = await pdf.getPage(i);
    const embedded = await extractPageText(page);
    if (embedded.length > 40) {
      parts.push(embedded);
      continue;
    }

    onStatus?.(`OCR page ${i}/${pageCount}…`);
    const worker = await getOcrWorker(onStatus);
    const dataUrl = await renderPageToDataUrl(page);
    const ocrText = await ocrImage(worker, dataUrl, onStatus);
    if (ocrText) parts.push(ocrText);
  }

  return parts.join('\n\n').trim();
}

/** Prompt user to pick a PDF file (for re-process). */
export function pickPdfFile(expectedName) {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,application/pdf';
    input.onchange = () => {
      const picked = input.files?.[0];
      if (!picked) {
        reject(new Error('No file selected'));
        return;
      }
      if (expectedName && picked.name !== expectedName) {
        reject(new Error(`Please select "${expectedName}" (you picked "${picked.name}")`));
        return;
      }
      resolve(picked);
    };
    input.click();
  });
}
