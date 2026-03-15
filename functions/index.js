/**
 * Firebase Cloud Functions for TBHF Policy Site (2nd gen)
 * Deploy: firebase deploy --only functions
 * On first deploy, you'll be prompted for ANTHROPIC_API_KEY (your Claude key).
 * Or create the secret in Google Cloud Secret Manager, then deploy.
 */
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const Anthropic = require('@anthropic-ai/sdk').default;

const anthropicKey = defineSecret('ANTHROPIC_API_KEY');

function setCors(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

exports.draftPolicySummary = onRequest(
  { secrets: [anthropicKey] },
  async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const key = anthropicKey.value();
    if (!key) {
      setCors(res);
      res.status(500).json({ error: 'Claude API key not configured. Run: firebase deploy --only functions and enter your key when prompted, or add ANTHROPIC_API_KEY to Secret Manager.' });
      return;
    }

    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }

    const { title = '', billNumber = '', summary = '' } = body;
    const anthropic = new Anthropic({ apiKey: key });

    const prompt = `You are an expert on federal policy and the preservation of Black history. Draft a 2-4 paragraph "Impact on Black History Preservation" section for a policy database entry.

Policy: ${title || 'Untitled'}
Bill: ${billNumber || 'N/A'}
Summary from Congress.gov: ${summary || 'None provided'}

Write in plain language for the general public. Explain how this policy positively, negatively, or mixed affects the preservation, teaching, and celebration of Black history in the United States. Be specific and factual.`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });
      const textBlock = message.content?.find((b) => b.type === 'text');
      const text = textBlock?.text?.trim() || '';
      res.json({ details: text });
    } catch (err) {
      console.error(err);
      setCors(res);
      res.status(500).json({ error: err.message || 'AI request failed' });
    }
  }
);
