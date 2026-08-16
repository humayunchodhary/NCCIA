import * as pdfjsLib from 'pdfjs-dist';
import { createWorker, OEM, PSM } from 'tesseract.js';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const TESS_BASE = `${BASE}tesseract`;
const MAX_OCR_PAGES = 12;
const RENDER_SCALES = [2, 2.5, 3.5];

let workerInstance = null;
let workerInitPromise = null;

function asError(err, fallback) {
  if (err instanceof Error && err.message) return err;
  if (typeof err === 'string' && err) return new Error(err);
  return new Error(fallback);
}

async function initWorker(onStatus) {
  onStatus?.('Loading OCR engine…');

  const logger = (m) => {
    if (!onStatus) return;
    if (m.status === 'loading tesseract core') onStatus('Loading OCR core…');
    if (m.status === 'initializing tesseract') onStatus('Initializing OCR…');
    if (m.status === 'loading language traineddata') onStatus('Loading language data…');
    if (m.status === 'recognizing text') onStatus(`OCR ${Math.round((m.progress || 0) * 100)}%…`);
  };

  try {
    // Try local assets first
    const worker = await createWorker('eng', OEM.LSTM_ONLY, {
      workerPath: `${TESS_BASE}/worker.min.js`,
      corePath: `${TESS_BASE}`,
      langPath: `${TESS_BASE}/lang`,
      workerBlobURL: true,
      gzip: true,
      logger,
      errorHandler: (e) => console.warn('Tesseract local warning:', e),
    });

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      preserve_interword_spaces: '1',
      user_defined_dpi: '300',
    });

    return worker;
  } catch (localErr) {
    console.warn('Local OCR worker init failed, attempting CDN fallback:', localErr);
    onStatus?.('Loading online OCR engine…');

    const worker = await createWorker('eng', OEM.LSTM_ONLY, {
      logger,
      errorHandler: (e) => console.error('Tesseract fallback error:', e),
    });

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      preserve_interword_spaces: '1',
      user_defined_dpi: '300',
    });

    return worker;
  }
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

function enhanceForOcr(canvas) {
  const ctx = canvas.getContext('2d');
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;

  // 1. Convert to grayscale & find min/max for contrast stretching
  let min = 255;
  let max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const g = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    d[i] = d[i + 1] = d[i + 2] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }

  // 2. High-contrast stretch + binarization for clean text background
  const range = Math.max(max - min, 1);
  const threshold = min + range * 0.55;
  for (let i = 0; i < d.length; i += 4) {
    const g = d[i];
    // Contrast stretched value
    const stretched = ((g - min) / range) * 255;
    // Sharpen text edges: slightly boost darks and clear off-white scanner noise
    const finalVal = stretched < threshold ? Math.max(0, stretched * 0.7) : Math.min(255, stretched * 1.15);
    d[i] = d[i + 1] = d[i + 2] = finalVal;
  }
  ctx.putImageData(img, 0, 0);
}

function canvasHasInk(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const step = Math.max(4, Math.floor(Math.min(width, height) / 150));
  const data = ctx.getImageData(0, 0, width, height).data;
  let dark = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      if (data[i] < 220 || data[i + 1] < 220 || data[i + 2] < 220) dark += 1;
    }
  }
  return dark > 40;
}

function looksLikeVerificationReport(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return t.includes('cnic') || t.includes('complainant') || t.includes('verification')
    || t.includes('tracking') || t.includes('ccw-') || t.includes('defrauded') || /\d{13}/.test(text);
}

async function ocrFromCanvas(worker, canvas, onStatus) {
  if (!canvasHasInk(canvas)) return '';
  onStatus?.('Recognizing text…');

  try {
    await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
    const result = await worker.recognize(canvas);
    let text = (result?.data?.text || '').trim();

    if (text.length >= 30) {
      return text;
    }

    // Fallback mode if AUTO produced very little text
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
    const retry = await worker.recognize(canvas);
    const retryText = (retry?.data?.text || '').trim();
    return retryText.length > text.length ? retryText : text;
  } catch (err) {
    console.warn('Canvas OCR recognition error:', err);
    return '';
  }
}

async function ocrPageWithPdfJs(page, worker, onStatus) {
  // Scale 2.0 provides ~200 DPI resolution, perfect for fast & accurate OCR
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    viewport,
    intent: 'print',
  }).promise;

  enhanceForOcr(canvas);
  return ocrFromCanvas(worker, canvas, onStatus);
}

/**
 * @param {File} file
 * @param {(msg: string) => void} [onStatus]
 * @param {{ serverRenderPage?: (pageIndex: number) => Promise<string|null>, maxPages?: number, stopWhenUseful?: boolean }} [options]
 */
export async function extractTextFromPdf(file, onStatus, options = {}) {
  const { serverRenderPage, maxPages = MAX_OCR_PAGES, stopWhenUseful = true } = options;

  try {
    onStatus?.('Loading PDF…');
    const worker = await getOcrWorker(onStatus);
    const parts = [];
    let renderedAny = false;

    let pageCount = maxPages;
    let pdf = null;

    try {
      const data = new Uint8Array(await file.arrayBuffer());
      pdf = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
      pageCount = Math.min(pdf.numPages, maxPages);
    } catch {
      pdf = null;
    }

    for (let i = 0; i < pageCount; i += 1) {
      onStatus?.(`Reading page ${i + 1}/${pageCount}…`);
      let ocrText = '';

      if (pdf) {
        try {
          const page = await pdf.getPage(i + 1);
          const embedded = await extractPageText(page).catch(() => '');
          if (embedded.length > 40) {
            parts.push(embedded);
            // Keep reading remaining pages — recommendations/justification often on page 2+
            continue;
          }
          ocrText = await ocrPageWithPdfJs(page, worker, onStatus);
        } catch {
          ocrText = '';
        }
      }

      if (!ocrText && serverRenderPage) {
        onStatus?.(`Server render page ${i + 1}…`);
        try {
          const dataUrl = await serverRenderPage(i);
          if (dataUrl) {
            renderedAny = true;
            const canvas = await dataUrlToCanvas(dataUrl);
            ocrText = await ocrFromCanvas(worker, canvas, onStatus);
          }
        } catch (err) {
          console.warn('Server page render failed', err);
        }
      }

      if (ocrText) {
        parts.push(ocrText);
      }

      const combinedSoFar = parts.join('\n\n');
      if (stopWhenUseful && looksLikeVerificationReport(combinedSoFar) && /\d{5}[-\s]?\d{7}[-\s]?\d/.test(combinedSoFar)) {
        break;
      }
    }

    const combined = parts.join('\n\n').trim();
    if (!combined) {
      throw new Error(
        renderedAny || pdf
          ? 'OCR ne text nahi parha. Re-run OCR try karein ya PDF quality check karein.'
          : 'PDF load nahi hui. File check karein.',
      );
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
