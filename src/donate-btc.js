/**
 * Donate Bitcoin standalone page
 */
import { config } from './config.js';

const address = config.BITCOIN_ADDRESS || 'bc1q... (add to .env)';
const addressEl = document.getElementById('btcAddress');
const qrImage = document.getElementById('qrImage');
const copyBtn = document.getElementById('copyBtn');
const qrContainer = document.getElementById('qrContainer');

if (addressEl) addressEl.textContent = address;

if (qrImage && address && !address.includes('...')) {
  qrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent('bitcoin:' + address);
} else if (qrContainer) {
  qrContainer.style.display = 'none';
}

if (copyBtn && addressEl) {
  copyBtn.addEventListener('click', () => {
    const text = addressEl.textContent.trim();
    if (!text || text.includes('...')) return;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy Address'; }, 2000);
    });
  });
}
