/**
 * Firebase initialization and Firestore helpers.
 */
(function () {
  const config = window.TBHF_FIREBASE_CONFIG;
  if (!config || !config.apiKey || config.apiKey === 'YOUR_API_KEY') {
    window.TBHF_FIREBASE_READY = false;
    window.TBHF_DB = null;
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    window.TBHF_DB = firebase.firestore();
    window.TBHF_AUTH = firebase.auth ? firebase.auth() : null;
    window.TBHF_FIREBASE_READY = true;
  } catch (e) {
    console.warn('Firebase init failed:', e);
    window.TBHF_FIREBASE_READY = false;
    window.TBHF_DB = null;
  }
})();
