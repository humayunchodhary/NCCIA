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
    const v = gray > 180 ? 255 : gray < 80 ? 0 : gray;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * OCR first page of a PDF in the browser (no server Python required).
 */
export async function extractTextFromPdf(file, onStatus) {
  onStatus?.('Loading PDF…');
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  const scale = 3;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  preprocessCanvas(canvas);

  onStatus?.('Running OCR (30–90 sec)…');
  const result = await Tesseract.recognize(canvas, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onStatus) {
        onStatus(`OCR ${Math.round((m.progress || 0) * 100)}%…`);
      }
    },
  });

  return result.data.text || '';
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
