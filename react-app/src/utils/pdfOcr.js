import * as pdfjsLib from 'pdfjs-dist';
import { createWorker, OEM } from 'tesseract.js';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const TESS_BASE = `${BASE}tesseract`;

let workerInstance = null;
let workerInitPromise = null;

function asError(err, fallback) {
  if (err instanceof Error && err.message) return err;
  if (typeof err === 'string' && err) return new Error(err);
  return new Error(fallback);
}

async function verifyOcrAssets(onStatus) {
  const checks = [
    `${TESS_BASE}/worker.min.js`,
    `${TESS_BASE}/tesseract-core-simd-lstm.wasm.js`,
    `${TESS_BASE}/lang/eng.traineddata.gz`,
  ];
  onStatus?.('Checking OCR files…');
  for (const url of checks) {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`OCR file not found (${res.status}): ${url}. Run git pull and hard-refresh.`);
    }
  }
}

async function initWorker(onStatus) {
  await verifyOcrAssets(onStatus);
  onStatus?.('Loading OCR engine…');

  const configs = [
    {
      label: 'default',
      opts: {
        workerPath: `${TESS_BASE}/worker.min.js`,
        corePath: `${TESS_BASE}`,
        langPath: `${TESS_BASE}/lang`,
        workerBlobURL: true,
        gzip: true,
      },
      oem: OEM.LSTM_ONLY,
    },
    {
      label: 'legacy',
      opts: {
        workerPath: `${TESS_BASE}/worker.min.js`,
        corePath: `${TESS_BASE}`,
        langPath: `${TESS_BASE}/lang`,
        workerBlobURL: true,
        gzip: true,
        legacyCore: true,
      },
      oem: OEM.TESSERACT_ONLY,
    },
  ];

  let lastErr = null;
  for (const cfg of configs) {
    try {
      onStatus?.(`Starting OCR (${cfg.label})…`);
      const worker = await createWorker('eng', cfg.oem, {
        ...cfg.opts,
        logger: (m) => {
          if (!onStatus) return;
          if (m.status === 'loading tesseract core') onStatus('Loading OCR core…');
          if (m.status === 'initializing tesseract') onStatus('Initializing OCR…');
          if (m.status === 'loading language traineddata') onStatus('Loading language data…');
          if (m.status === 'recognizing text') onStatus(`OCR ${Math.round((m.progress || 0) * 100)}%…`);
        },
        errorHandler: (e) => {
          console.error('Tesseract error:', e);
        },
      });
      return worker;
    } catch (err) {
      lastErr = err;
      console.warn(`OCR init failed (${cfg.label}):`, err);
    }
  }

  throw asError(lastErr, 'OCR engine failed to start. Check /react/tesseract/ files on server.');
}

async function getOcrWorker(onStatus) {
  if (workerInstance) return workerInstance;
  if (!workerInitPromise) {
    workerInitPromise = initWorker(onStatus)
      .then((worker) => {
        workerInstance = worker;
        return worker;
      })
      .catch((err) => {
        workerInitPromise = null;
        workerInstance = null;
        throw err;
      });
  }
  return workerInitPromise;
}

async function renderPageToDataUrl(page, scale = 2.5) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const renderTask = page.render({ canvas, viewport });
  await renderTask.promise;

  return canvas.toDataURL('image/png');
}

async function extractPageText(page) {
  const content = await page.getTextContent();
  return content.items.map((item) => item.str).join(' ').trim();
}

async function ocrImage(worker, dataUrl, onStatus) {
  onStatus?.('Recognizing text…');
  const result = await worker.recognize(dataUrl);
  return (result.data.text || '').trim();
}

/**
 * Extract text from a PDF using embedded text or browser OCR.
 */
export async function extractTextFromPdf(file, onStatus) {
  try {
    onStatus?.('Loading PDF…');
    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
    const pageCount = Math.min(pdf.numPages, 2);
    const parts = [];

    for (let i = 1; i <= pageCount; i += 1) {
      onStatus?.(`Reading page ${i}/${pageCount}…`);
      const page = await pdf.getPage(i);

      let embedded = '';
      try {
        embedded = await extractPageText(page);
      } catch {
        embedded = '';
      }

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

    const combined = parts.join('\n\n').trim();
    if (!combined) {
      throw new Error('OCR returned empty text. PDF scan quality check karein ya Re-run OCR try karein.');
    }
    return combined;
  } catch (err) {
    throw asError(err, 'PDF OCR failed');
  }
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
