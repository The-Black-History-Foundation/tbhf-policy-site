/**
 * TBHF Policy Site - Configuration from environment variables.
 * Vite exposes import.meta.env.VITE_* from .env
 */
export const config = {
  BTCPAY_URL: import.meta.env.VITE_BTCPAY_URL || '',
  BITCOIN_ADDRESS: import.meta.env.VITE_BITCOIN_ADDRESS || 'bc1q... (add to .env)',
  LIGHTNING_ADDRESS: import.meta.env.VITE_LIGHTNING_ADDRESS || '',
  LIGHTNING_LNURL: import.meta.env.VITE_LIGHTNING_LNURL || '',
  VOLUNTEER_URL: import.meta.env.VITE_VOLUNTEER_URL || 'https://tbhfdn.org/volunteer',
  CONGRESS_API_KEY: import.meta.env.VITE_CONGRESS_API_KEY || '',
  AI_AGENT_URL: import.meta.env.VITE_AI_AGENT_URL || '',
  NEWSLETTER_API_URL: import.meta.env.VITE_TBHF_NEWSLETTER_API_URL || 'https://tbhf-2.vercel.app',
};

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};
