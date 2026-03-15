/**
 * TBHF Policy Site - Configuration
 * Update these values for your deployment.
 */
const TBHF_CONFIG = {
  // Bitcoin donations
  BTCPAY_URL: '', // e.g. 'https://btcpay.example.com/i/xxx'
  BITCOIN_ADDRESS: 'bc1q... (add your Bitcoin address)',
  LIGHTNING_ADDRESS: '', // e.g. 'tbhf@getalby.com'
  LIGHTNING_LNURL: '',   // Or full LNURL for static QR

  // Volunteer page
  VOLUNTEER_URL: 'https://tbhfdn.org/volunteer',

  // Congress.gov API - get free key at https://api.data.gov/signup/
  CONGRESS_API_KEY: '', // e.g. 'your-api-key'

  // AI Agent - optional. For AI summary drafting, deploy a Cloud Function or serverless
  // endpoint that calls OpenAI/Anthropic. Set URL here to enable "AI Draft Summary" in admin.
  AI_AGENT_URL: '', // e.g. 'https://your-project.cloudfunctions.net/draftPolicySummary'
};

// Expose for main.js
window.TBHF_CONFIG = TBHF_CONFIG;
