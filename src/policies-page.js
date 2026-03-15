/**
 * Policies list page
 */
import { initFirebase } from './firebase-app.js';
import { subscribePolicies } from './policies.js';

initFirebase();

const typeSel = document.getElementById('filter-type');
const impactSel = document.getElementById('filter-impact');
const statusSel = document.getElementById('filter-status');
const sortSel = document.getElementById('filter-sort');
const searchInput = document.getElementById('filter-search');
const container = document.getElementById('policies-container');
const loading = document.getElementById('policies-loading');

function filterAndRender(policies) {
  const policyType = typeSel?.value || '';
  const impact = impactSel?.value || '';
  const status = statusSel?.value || '';
  const sort = sortSel?.value || 'newest';
  const q = (searchInput?.value || '').toLowerCase().trim();
  let list = (policies || []).filter((p) => {
    if (policyType && (p.policyType || 'bill') !== policyType) return false;
    if (impact && (p.impact || '') !== impact) return false;
    if (status && (p.status || '') !== status) return false;
    if (q) {
      const ref = p.billNumber || (p.policyType === 'executive_order' && p.executiveOrderNumber ? `E.O. ${p.executiveOrderNumber}` : '');
      const text = ((p.title || '') + ' ' + (p.shortTitle || '') + ' ' + (p.summary || '') + ' ' + ref + ' executive order').toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });
  list = sortPolicies(list, sort);
  render(list);
}

function sortPolicies(list, sort) {
  const arr = [...list];
  const getTime = (p) => (p.updatedAt?.toMillis?.() ?? p.createdAt?.toMillis?.() ?? 0);
  const getTitle = (p) => (p.shortTitle || p.title || '').toLowerCase();
  const impactOrder = { positive: 0, negative: 1, mixed: 2 };
  switch (sort) {
    case 'oldest':
      arr.sort((a, b) => getTime(a) - getTime(b));
      break;
    case 'title-az':
      arr.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
      break;
    case 'title-za':
      arr.sort((a, b) => getTitle(b).localeCompare(getTitle(a)));
      break;
    case 'impact':
      arr.sort((a, b) => (impactOrder[a.impact] ?? 2) - (impactOrder[b.impact] ?? 2));
      break;
    default:
      arr.sort((a, b) => getTime(b) - getTime(a));
  }
  return arr;
}

function render(list) {
  if (loading) loading.remove();
  if (!container) return;
  if (!list?.length) {
    container.innerHTML = '<p class="policy-empty">No policies match your filters.</p>';
    return;
  }
  container.innerHTML = list.map((p) => {
    const impactClass = 'policy-badge--' + (p.impact || 'mixed');
    const impactLabel = (p.impact || 'mixed').charAt(0).toUpperCase() + (p.impact || 'mixed').slice(1);
    const ref = p.billNumber || (p.policyType === 'executive_order' && p.executiveOrderNumber ? `E.O. ${p.executiveOrderNumber}` : '');
    return `<article class="policy-card">
      <span class="policy-badge ${impactClass}">${impactLabel}</span>
      <h3><a href="policy.html?id=${encodeURIComponent(p.id)}">${(p.shortTitle || p.title || 'Untitled')}</a></h3>
      <p class="policy-card-summary">${(p.summary || '').substring(0, 180)}${p.summary && p.summary.length > 180 ? '...' : ''}</p>
      <p class="policy-card-meta">${ref} &middot; ${p.status || 'pending'}</p>
    </article>`;
  }).join('');
}

typeSel?.addEventListener('change', () => filterAndRender(window._policiesCache || []));
impactSel?.addEventListener('change', () => filterAndRender(window._policiesCache || []));
statusSel?.addEventListener('change', () => filterAndRender(window._policiesCache || []));
sortSel?.addEventListener('change', () => filterAndRender(window._policiesCache || []));
searchInput?.addEventListener('input', () => filterAndRender(window._policiesCache || []));

subscribePolicies((policies) => {
  window._policiesCache = policies;
  filterAndRender(policies);
});
