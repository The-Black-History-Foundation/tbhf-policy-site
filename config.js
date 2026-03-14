/**
 * TBHF Policy Site - Configuration
 * Update these values for your deployment.
 * DDME_URL: Your deployed DDME platform (e.g. https://ddme.vercel.app)
 * Bitcoin: Configure BTCPay Server URL, or use static address/Lightning
 */
const TBHF_CONFIG = {
  // DDME platform URL - connect policy site to DDME
  DDME_URL: 'https://ddme.vercel.app',

  // Bitcoin donations
  // Option A: BTCPay Server - use your store's payment page URL for Lightning + on-chain
  BTCPAY_URL: '', // e.g. 'https://btcpay.example.com/i/xxx'

  // Option B: Static Bitcoin address (used when BTCPAY_URL is empty)
  BITCOIN_ADDRESS: 'bc1q... (add your Bitcoin address)',

  // Lightning: If using BTCPay, BTCPAY_URL handles both. Otherwise use Lightning Address or LNURL
  LIGHTNING_ADDRESS: '', // e.g. 'tbhf@getalby.com'
  LIGHTNING_LNURL: '',   // Or full LNURL for static QR

  // Charity Coin (from DDME)
  CHARITY_COIN_URL: 'https://charity-coin-2.vercel.app',

  // Volunteer page (tbhfdn.org or DDME Earn)
  VOLUNTEER_URL: 'https://tbhfdn.org/volunteer',
};

// Expose for main.js
window.TBHF_CONFIG = TBHF_CONFIG;
