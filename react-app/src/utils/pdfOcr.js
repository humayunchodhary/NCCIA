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
  let min = 255;
  let max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const range = Math.max(max - min, 1);
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = ((g - min) / range) * 255;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
}

function canvasHasInk(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const step = Math.max(4, Math.floor(Math.min(width, height) / 200));
  const data = ctx.getImageData(0, 0, width, height).data;
  let dark = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      if (data[i] < 210 || data[i + 1] < 210 || data[i + 2] < 210) dark += 1;
    }
  }
  return dark > 80;
}

function imgDataToCanvas(imgData) {
  if (!imgData?.width || !imgData?.height) return null;
  const { width, height, bitmap, data } = imgData;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (bitmap) {
    ctx.drawImage(bitmap, 0, 0);
    return canvas;
  }

  if (data) {
    const imageData = ctx.createImageData(width, height);
    if (data.length === width * height * 4) {
      imageData.data.set(data);
    } else if (data.length === width * height * 3) {
      for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
        imageData.data[j] = data[i];
        imageData.data[j + 1] = data[i + 1];
        imageData.data[j + 2] = data[i + 2];
        imageData.data[j + 3] = 255;
      }
    } else {
      return null;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  return null;
}

function collectEmbeddedImageCanvases(page) {
  const canvases = [];
  try {
    if (page.objs && typeof page.objs[Symbol.iterator] === 'function') {
      for (const [, imgData] of page.objs) {
        const canvas = imgDataToCanvas(imgData);
        if (canvas && canvas.width > 200 && canvas.height > 200) {
          enhanceForOcr(canvas);
          canvases.push(canvas);
        }
      }
    }
  } catch (err) {
    console.warn('Embedded image extraction failed', err);
  }
  return canvases.sort((a, b) => (b.width * b.height) - (a.width * a.height));
}

function cropCanvasTop(canvas, ratio = 0.6) {
  const h = Math.max(1, Math.floor(canvas.height * ratio));
  const cropped = document.createElement('canvas');
  cropped.width = canvas.width;
  cropped.height = h;
  const ctx = cropped.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cropped.width, cropped.height);
  ctx.drawImage(canvas, 0, 0, canvas.width, h, 0, 0, canvas.width, h);
  return cropped;
}

async function dataUrlToCanvas(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      enhanceForOcr(canvas);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error('Server page image could not be loaded'));
    img.src = dataUrl;
  });
}

async function renderPageToCanvas(page, scale) {
  const viewport = page.getViewport({ scale });
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
  return canvas;
}

async function extractPageText(page) {
  const content = await page.getTextContent();
  return content.items.map((item) => item.str).join(' ').trim();
}

async function ocrCanvas(worker, canvas, onStatus) {
  const targets = [canvas, cropCanvasTop(canvas, 0.7), cropCanvasTop(canvas, 0.45)];
  const modes = [PSM.AUTO, PSM.SPARSE_TEXT, PSM.SINGLE_BLOCK];
  let best = '';

  for (const target of targets) {
    for (const psm of modes) {
      onStatus?.('Recognizing text…');
      await worker.setParameters({ tessedit_pageseg_mode: psm });
      const result = await worker.recognize(target);
      const text = (result.data.text || '').trim();
      if (text.length > best.length) best = text;
    }
  }
  return best;
}

function looksLikeVerificationReport(text) {
  const t = text.toLowerCase();
  return t.includes('cnic') || t.includes('complainant') || t.includes('verification')
    || t.includes('tracking') || t.includes('ccw-') || /\d{13}/.test(text);
}

async function ocrFromCanvas(worker, canvas, onStatus) {
  if (!canvasHasInk(canvas)) return '';
  return ocrCanvas(worker, canvas, onStatus);
}

async function ocrPageWithPdfJs(page, worker, onStatus) {
  let best = '';
  for (const scale of RENDER_SCALES) {
    const viewport = page.getViewport({ scale });
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

    const embedded = collectEmbeddedImageCanvases(page);
    for (const embeddedCanvas of embedded) {
      onStatus?.('OCR embedded scan…');
      const text = await ocrFromCanvas(worker, embeddedCanvas, onStatus);
      if (text.length > best.length) best = text;
    }

    enhanceForOcr(canvas);
    const text = await ocrFromCanvas(worker, canvas, onStatus);
    if (text.length > best.length) best = text;
    if (best.length > 400 && looksLikeVerificationReport(best)) break;
  }
  return best;
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
