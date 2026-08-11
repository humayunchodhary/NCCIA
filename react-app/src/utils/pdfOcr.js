import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Vite: load PDF.js worker from package
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * OCR first page of a PDF in the browser (works without server Python).
 * @param {File} file
 * @param {(msg: string) => void} [onStatus]
 * @returns {Promise<string>}
 */
export async function extractTextFromPdf(file, onStatus) {
  onStatus?.('Loading PDF…');
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  const scale = 2;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;

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
