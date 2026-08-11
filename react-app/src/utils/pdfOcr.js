import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function preprocessCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = gray > 175 ? 255 : gray < 95 ? 0 : gray * 1.15;
    d[i] = d[i + 1] = d[i + 2] = Math.min(255, v);
  }
  ctx.putImageData(img, 0, 0);
}

async function ocrPage(page, onStatus) {
  const scale = 3.5;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  preprocessCanvas(canvas);

  const result = await Tesseract.recognize(canvas, 'eng', {
    tessedit_pageseg_mode: '6',
    logger: (m) => {
      if (m.status === 'recognizing text' && onStatus) {
        onStatus(`OCR ${Math.round((m.progress || 0) * 100)}%…`);
      }
    },
  });

  return result.data.text || '';
}

/**
 * OCR first pages of a PDF in the browser (no server Python required).
 */
export async function extractTextFromPdf(file, onStatus) {
  onStatus?.('Loading PDF…');
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pageCount = Math.min(pdf.numPages, 2);
  const parts = [];

  for (let i = 1; i <= pageCount; i += 1) {
    onStatus?.(`OCR page ${i}/${pageCount}…`);
    const page = await pdf.getPage(i);
    parts.push(await ocrPage(page, onStatus));
  }

  return parts.join('\n\n');
}

/** Prompt user to pick a PDF file (for re-process). */
export function pickPdfFile(expectedName) {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,application/pdf';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      if (expectedName && file.name !== expectedName) {
        reject(new Error(`Please select "${expectedName}" (you picked "${file.name}")`));
        return;
      }
      resolve(file);
    };
    input.click();
  });
}
