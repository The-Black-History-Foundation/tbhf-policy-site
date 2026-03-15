/**
 * TBHF Policy Site - Main script
 * Handles config application, Bitcoin copy, newsletter placeholder
 */
(function () {
  const config = window.TBHF_CONFIG || {};

  function applyConfig() {
    const bitcoinAddress = config.BITCOIN_ADDRESS || 'bc1q... (configure in config.js)';
    const btcpayUrl = config.BTCPAY_URL || '';
    const lightningAddress = config.LIGHTNING_ADDRESS || '';
    const lightningLnurl = config.LIGHTNING_LNURL || '';

    // Volunteer CTA
    const volunteerUrl = config.VOLUNTEER_URL || 'https://tbhfdn.org/volunteer';
    const volunteerLink = document.getElementById('volunteer-cta-link');
    if (volunteerLink) {
      volunteerLink.href = volunteerUrl;
    }

    // Bitcoin address
    const addressEl = document.getElementById('bitcoin-address');
    if (addressEl) {
      addressEl.textContent = bitcoinAddress;
    }

    // Lightning link
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
        lightningLink.textContent = 'Configure Lightning in config.js';
        lightningLink.style.opacity = '0.7';
      }
    }
  }

  function initCopyButton() {
    const btn = document.getElementById('copy-btc-btn');
    const addressEl = document.getElementById('bitcoin-address');
    if (!btn || !addressEl) return;

    btn.addEventListener('click', function () {
      const address = addressEl.textContent.trim();
      if (!address || address.includes('configure')) return;

      navigator.clipboard.writeText(address).then(function () {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(function () {
          btn.textContent = orig;
        }, 2000);
      }).catch(function () {
        btn.textContent = 'Failed';
        setTimeout(function () {
          btn.textContent = 'Copy';
        }, 2000);
      });
    });
  }

  function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Placeholder - no backend. In production, hook to your newsletter API.
      alert('Newsletter signup will be connected to your email service. For now, add your backend or use a service like Mailchimp.');
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

    if (!modal || !openBtn) return;

    const bitcoinAddress = config.BITCOIN_ADDRESS || 'bc1q... (add your Bitcoin address in config.js)';

    function openModal() {
      if (addressEl) addressEl.textContent = bitcoinAddress;
      if (qrImage && bitcoinAddress && !bitcoinAddress.includes('...')) {
        qrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent('bitcoin:' + bitcoinAddress);
        if (qrContainer) qrContainer.style.display = 'block';
      } else if (qrContainer) {
        qrContainer.style.display = 'none';
      }
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
    });

    if (copyBtn && addressEl) {
      copyBtn.addEventListener('click', function () {
        const text = addressEl.textContent.trim();
        if (!text || text.includes('...')) return;
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = 'Copied!';
          setTimeout(function () { copyBtn.textContent = 'Copy Address'; }, 2000);
        });
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyConfig();
      initCopyButton();
      initNewsletterForm();
      initDonateBtcModal();
    });
  } else {
    applyConfig();
    initCopyButton();
    initNewsletterForm();
    initDonateBtcModal();
  }
})();
