/**
 * Policy detail page
 */
import './policy-detail.css';
import { initFirebase } from './firebase-app.js';
import { getPolicy } from './policies.js';

initFirebase();

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const container = document.getElementById('policy-detail-content');

if (!id || !container) {
  container.innerHTML = '<p class="policy-empty">Policy not found.</p>';
} else {
  getPolicy(id).then((p) => {
    if (!p) {
      container.innerHTML = '<p class="policy-empty">Policy not found.</p>';
      return;
    }
    const impactClass = 'policy-badge--' + (p.impact || 'mixed');
    const impactLabel = (p.impact || 'mixed').charAt(0).toUpperCase() + (p.impact || 'mixed').slice(1);
    let linksHtml = '';
    if (p.links) {
      if (p.links.federalRegister) linksHtml += `<a href="${p.links.federalRegister}" target="_blank" rel="noopener">Federal Register</a>`;
      if (p.links.congressGov) linksHtml += (linksHtml ? ' ' : '') + `<a href="${p.links.congressGov}" target="_blank" rel="noopener">Congress.gov</a>`;
      if (p.links.govTrack) linksHtml += (linksHtml ? ' ' : '') + `<a href="${p.links.govTrack}" target="_blank" rel="noopener">GovTrack</a>`;
    }
    let actionHtml = '';
    if (p.actionItems?.length) {
      actionHtml = `<div class="policy-actions"><h3>Take Action</h3><ul>${p.actionItems.map((a) => `<li>${a}</li>`).join('')}</ul></div>`;
    }
    const ref = p.billNumber || (p.policyType === 'executive_order' && p.executiveOrderNumber ? `E.O. ${p.executiveOrderNumber}` : '');
    const congressPart = p.congress ? ' &middot; ' + p.congress + 'th Congress' : '';
    const summaryHtml = (p.summary || '').split('\n').map((s) => `<p>${s}</p>`).join('');
    const isEo = p.policyType === 'executive_order';
    const summaryBlock = isEo && (p.summary || '')
      ? `<div class="policy-detail-summary-wrap">
          <button type="button" class="policy-summary-toggle" aria-expanded="false">Show Executive Order Summary</button>
          <div class="policy-detail-summary policy-detail-summary-fullwidth" hidden>${summaryHtml}</div>
        </div>`
      : `<div class="policy-detail-summary policy-detail-summary-fullwidth">${summaryHtml || '<p></p>'}</div>`;
    const detailsHtml = p.details ? `<div class="policy-detail-details"><h3>Impact on Black History Preservation</h3>${p.details.split('\n').map((s) => `<p>${s}</p>`).join('')}</div>` : '';
    container.innerHTML = `<article class="policy-detail">
      <span class="policy-badge ${impactClass}">${impactLabel}</span>
      <h1>${p.shortTitle || p.title || 'Untitled'}</h1>
      <p class="policy-detail-meta">${ref} &middot; ${p.status || 'pending'}${congressPart}</p>
      ${summaryBlock}
      ${detailsHtml}
      ${linksHtml ? `<div class="policy-detail-links"><h3>Official Sources</h3><p>${linksHtml}</p></div>` : ''}
      ${actionHtml}
    </article>`;
    container.querySelector('.policy-summary-toggle')?.addEventListener('click', (e) => {
      const btn = e.target;
      const summary = btn.nextElementSibling;
      if (summary?.hidden) {
        summary.hidden = false;
        btn.textContent = 'Hide Executive Order Summary';
        btn.setAttribute('aria-expanded', 'true');
      } else {
        summary.hidden = true;
        btn.textContent = 'Show Executive Order Summary';
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });
}
