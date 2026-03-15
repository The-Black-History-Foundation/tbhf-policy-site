/**
 * TBHF Policy Site - Main script for index.html
 */
import { config } from './config.js';
import { initFirebase } from './firebase-app.js';
import { isReady, subscribePolicies } from './policies.js';

// Expose for any legacy scripts; init Firebase
window.TBHF_CONFIG = config;
initFirebase();

function applyConfig() {
  const bitcoinAddress = config.BITCOIN_ADDRESS || 'bc1q... (add to .env)';
  const btcpayUrl = config.BTCPAY_URL || '';
  const lightningAddress = config.LIGHTNING_ADDRESS || '';
  const lightningLnurl = config.LIGHTNING_LNURL || '';

  const volunteerLink = document.getElementById('volunteer-cta-link');
  if (volunteerLink) volunteerLink.href = config.VOLUNTEER_URL || 'https://tbhfdn.org/volunteer';

  const addressEl = document.getElementById('bitcoin-address');
  if (addressEl) addressEl.textContent = bitcoinAddress;

  const lightningLink = document.getElementById('lightning-donate-link');
  if (lightningLink) {
    if (btcpayUrl) {
      lightningLink.href = btcpayUrl;
      lightningLink.textContent = 'Pay with Lightning';
    } else if (lightningAddress) {
      lightningLink.href = 'lightning:' + lightningAddress;
      lightningLink.textContent = 'Pay with Lightning';
    } else if (lightningLnurl) {
      lightningLink.href = lightningLnurl;
      lightningLink.textContent = 'Pay with Lightning';
    } else {
      lightningLink.href = '#donate';
      lightningLink.textContent = 'Configure Lightning in .env';
      lightningLink.style.opacity = '0.7';
    }
  }
}

function initCopyButton() {
  const btn = document.getElementById('copy-btc-btn');
  const addressEl = document.getElementById('bitcoin-address');
  if (!btn || !addressEl) return;
  btn.addEventListener('click', () => {
    const address = addressEl.textContent.trim();
    if (!address || address.includes('configure')) return;
    navigator.clipboard.writeText(address).then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => {
      btn.textContent = 'Failed';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return EMAIL_REGEX.test(email) && email.length <= 254;
}

function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  const emailInput = document.getElementById('newsletter-email');
  const submitBtn = document.getElementById('newsletter-submit');
  const errorEl = document.getElementById('newsletter-error');
  const pendingEl = document.getElementById('newsletter-pending');
  const confirmedEl = document.getElementById('newsletter-confirmed');

  if (!form || !emailInput || !submitBtn || !errorEl || !pendingEl || !confirmedEl) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (emailInput.value || '').trim().toLowerCase();
    if (!email) {
      errorEl.textContent = 'Email is required.';
      errorEl.hidden = false;
      return;
    }
    if (!isValidEmail(email)) {
      errorEl.textContent = 'Please enter a valid email address.';
      errorEl.hidden = false;
      return;
    }

    errorEl.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribing…';

    try {
      const res = await fetch(`${config.NEWSLETTER_API_URL}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        errorEl.textContent = data.error || 'Failed to subscribe. Please try again.';
        errorEl.hidden = false;
        return;
      }

      form.hidden = true;
      if (data.alreadySubscribed) {
        confirmedEl.hidden = false;
      } else {
        pendingEl.hidden = false;
      }
    } catch (err) {
      errorEl.textContent = err instanceof Error ? err.message : 'Failed to subscribe. Please try again.';
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Subscribe';
    }
  });
}

function initDonateBtcModal() {
  const modal = document.getElementById('donate-btc-modal');
  const openBtn = document.getElementById('donate-btc-modal-btn');
  const closeBtn = document.getElementById('donate-btc-modal-close');
  const addressEl = document.getElementById('modal-btc-address');
  const qrImage = document.getElementById('modal-qr-image');
  const qrContainer = document.getElementById('modal-qr-container');
  const copyBtn = document.getElementById('modal-copy-btn');
  const bitcoinAddress = config.BITCOIN_ADDRESS || 'bc1q... (add to .env)';

  if (!modal || !openBtn) return;

  function openModal() {
    if (addressEl) addressEl.textContent = bitcoinAddress;
    if (qrImage && bitcoinAddress && !bitcoinAddress.includes('...')) {
      qrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent('bitcoin:' + bitcoinAddress);
      if (qrContainer) qrContainer.style.display = 'block';
    } else if (qrContainer) qrContainer.style.display = 'none';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });

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
}

function renderPolicyCards(policies, containerId, limit = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const loading = document.getElementById(containerId + '-loading');
  if (loading) loading.remove();
  const list = Array.isArray(policies) ? policies.slice(0, limit) : [];
  if (list.length === 0) {
    container.innerHTML = '<p class="policy-empty">No policies yet. Configure Firebase and add policies in Admin.</p>';
    return;
  }
  container.innerHTML = list.map((p) => {
    const impactClass = 'policy-badge--' + (p.impact || 'mixed');
    const impactLabel = (p.impact || 'mixed').charAt(0).toUpperCase() + (p.impact || 'mixed').slice(1);
    const ref = p.billNumber || (p.policyType === 'executive_order' && p.executiveOrderNumber ? `E.O. ${p.executiveOrderNumber}` : '');
    return `<article class="policy-card">
      <span class="policy-badge ${impactClass}">${impactLabel}</span>
      <h3><a href="policy.html?id=${encodeURIComponent(p.id)}">${(p.shortTitle || p.title || 'Untitled')}</a></h3>
      <p class="policy-card-summary">${(p.summary || '').substring(0, 120)}${p.summary && p.summary.length > 120 ? '...' : ''}</p>
      <p class="policy-card-meta">${ref} &middot; ${p.status || 'pending'}</p>
    </article>`;
  }).join('');
}

function init() {
  applyConfig();
  initCopyButton();
  initNewsletterForm();
  initDonateBtcModal();

  if (isReady()) {
    subscribePolicies((policies) => renderPolicyCards(policies, 'policy-impact-cards', 4));
  } else {
    const el = document.getElementById('policy-impact-loading');
    if (el) el.textContent = 'Configure Firebase in .env to load policies.';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
