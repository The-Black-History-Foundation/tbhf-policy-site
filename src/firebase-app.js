/**
 * Firebase initialization. Requires Firebase SDK loaded via script tags.
 */
import { firebaseConfig } from './config.js';

export function initFirebase() {
  const config = firebaseConfig;
  if (!config || !config.apiKey || config.apiKey === 'YOUR_API_KEY') {
    window.TBHF_FIREBASE_READY = false;
    window.TBHF_DB = null;
    window.TBHF_AUTH = null;
    return;
  }

  try {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
      firebase.initializeApp(config);
    }
    window.TBHF_DB = typeof firebase !== 'undefined' ? firebase.firestore() : null;
    window.TBHF_AUTH = typeof firebase !== 'undefined' && firebase.auth ? firebase.auth() : null;
    window.TBHF_FIREBASE_READY = true;
  } catch (e) {
    console.warn('Firebase init failed:', e);
    window.TBHF_FIREBASE_READY = false;
    window.TBHF_DB = null;
    window.TBHF_AUTH = null;
  }
}
