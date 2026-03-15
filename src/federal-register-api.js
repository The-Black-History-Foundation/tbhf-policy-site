/**
 * Federal Register API client for Executive Orders.
 * API docs: https://www.federalregister.gov/developers/documentation/api/v1
 */
const BASE = 'https://www.federalregister.gov/api/v1';

function buildUrl(path, params) {
  const url = new URL(BASE + path);
  if (params) {
    Object.keys(params).forEach((k) => {
      const v = params[k];
      if (Array.isArray(v)) {
        v.forEach((val) => url.searchParams.append(k, val));
      } else if (v != null && v !== '') {
        url.searchParams.set(k, v);
      }
    });
  }
  return url.toString();
}

function fetchJson(url) {
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error('Federal Register API error: ' + r.status);
    return r.json();
  });
}

/**
 * Search for an Executive Order by number.
 * Uses Federal Register API: PRESDOCU type + term search.
 * Fetches full documents to find the one with matching executive_order_number.
 * @param {number} orderNumber - e.g. 14067
 * @returns {Promise<Object>} The matching EO document, or rejects if not found
 */
export async function searchExecutiveOrder(orderNumber) {
  const params = new URLSearchParams();
  params.set('conditions[type]', 'PRESDOCU');
  params.set('conditions[term]', String(orderNumber));
  params.set('per_page', '10');
  params.set('order', 'newest');
  const res = await fetchJson(`${BASE}/documents.json?${params}`);
  const results = res.results || [];
  const target = String(orderNumber);
  for (const doc of results) {
    const docNum = doc.document_number;
    if (!docNum) continue;
    const full = await getDocument(docNum);
    const eoNum = full.executive_order_number ?? full.presidential_document_number;
    if (eoNum != null && String(eoNum) === target) return full;
  }
  throw new Error('Executive Order ' + orderNumber + ' not found');
}

/**
 * Search Presidential Documents (Executive Orders, Proclamations, etc.) by keyword.
 * @param {string} term - Search term (e.g. "Black history", "digital assets")
 * @param {number} [perPage=10]
 * @returns {Promise<{results: Array, count: number}>}
 */
export function searchByTerm(term, perPage = 10) {
  const params = new URLSearchParams();
  params.set('conditions[type]', 'PRESDOCU');
  params.set('conditions[term]', String(term).trim());
  params.set('per_page', String(perPage));
  params.set('order', 'newest');
  return fetchJson(`${BASE}/documents.json?${params}`);
}

/**
 * Get a single document by document number (e.g. "2022-07459").
 * @param {string} documentNumber
 * @returns {Promise<Object>}
 */
export function getDocument(documentNumber) {
  return fetchJson(buildUrl(`/documents/${encodeURIComponent(documentNumber)}.json`));
}

/**
 * Fetch raw text from Federal Register and extract a summary (first ~1200 chars of content).
 */
async function fetchRawTextSummary(rawTextUrl) {
  if (!rawTextUrl) return '';
  try {
    const url = typeof import.meta !== 'undefined' && import.meta.env?.DEV
      ? '/api/federal-register' + new URL(rawTextUrl).pathname
      : rawTextUrl;
    const res = await fetch(url);
    if (!res.ok) return '';
    const text = await res.text();
    // Skip Federal Register header boilerplate (~first 600 chars), take meaningful content
    const skip = Math.min(600, text.length);
    let content = text.slice(skip).replace(/\n{3,}/g, '\n\n').trim();
    return content.slice(0, 1200) + (content.length > 1200 ? '...' : '');
  } catch {
    return '';
  }
}

/**
 * Convert Federal Register EO document to policy object.
 */
export function eoToPolicy(doc) {
  return eoToPolicySync(doc);
}

/**
 * Async version: fetches raw text when abstract is missing to populate summary.
 */
export async function eoToPolicyWithSummary(doc) {
  const policy = eoToPolicySync(doc);
  if (policy.summary === '(Full text available at Federal Register link)' && doc.raw_text_url) {
    const fetched = await fetchRawTextSummary(doc.raw_text_url);
    if (fetched) policy.summary = fetched;
  }
  return policy;
}

function eoToPolicySync(doc) {
  const eoNum = doc.executive_order_number ?? doc.presidential_document_number ?? doc.executive_order_assignments?.[0]?.executive_order_number;
  const billNumber = eoNum != null ? `E.O. ${eoNum}` : (doc.document_number ? `E.O. (${doc.document_number})` : '');
  const federalRegisterUrl = doc.html_url || (doc.document_number ? `https://www.federalregister.gov/documents/${doc.document_number}` : '');
  const govInfoUrl = doc.pdf_url || '';

  let summary = doc.abstract || doc.summary || '';
  if (!summary && doc.raw_text_url) {
    summary = '(Full text available at Federal Register link)';
  }

  return {
    title: doc.title || 'Untitled Executive Order',
    shortTitle: doc.title || 'Untitled',
    billNumber,
    policyType: 'executive_order',
    congress: null,
    executiveOrderNumber: eoNum,
    summary,
    details: '',
    impact: 'mixed',
    status: 'enacted',
    links: {
      federalRegister: federalRegisterUrl,
      congressGov: '',
      govTrack: '',
      govInfo: govInfoUrl,
    },
    categories: [],
    actionItems: [],
  };
}

export const FederalRegisterAPI = {
  searchExecutiveOrder,
  searchByTerm,
  getDocument,
  eoToPolicy,
  eoToPolicyWithSummary,
};
