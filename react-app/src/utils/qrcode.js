import QRCode from 'qrcode';

/**
 * Generate SVG QR Code string
 * @param {string} text
 * @param {object} options
 * @returns {Promise<string>}
 */
export async function generateQrSvg(text, options = {}) {
  if (!text) return '';
  const size = options.size || 66;
  const margin = options.margin ?? 1;
  try {
    const svg = await QRCode.toString(String(text).trim(), {
      type: 'svg',
      width: size,
      margin,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return svg.replace('<svg ', '<svg style="display:inline-block;vertical-align:middle;max-width:' + size + 'px;height:auto;" ');
  } catch (e) {
    console.error('QR generation error:', e);
    return '';
  }
}

/**
 * Generate Base64 Data URL for QR Code
 * @param {string} text
 * @param {object} options
 * @returns {Promise<string>}
 */
export async function generateQrDataUrl(text, options = {}) {
  if (!text) return '';
  const size = options.size || 100;
  const margin = options.margin ?? 1;
  try {
    return await QRCode.toDataURL(String(text).trim(), {
      width: size,
      margin,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (e) {
    console.error('QR DataURL generation error:', e);
    return '';
  }
}
