/**
 * Congress.gov API client.
 */
import { config } from './config.js';

const BASE = 'https://api.congress.gov/v3';
const apiKey = config.CONGRESS_API_KEY || '';

function buildUrl(path, params) {
  const url = new URL(BASE + path);
  if (apiKey) url.searchParams.set('api_key', apiKey);
  if (params) {
    Object.keys(params).forEach((k) => url.searchParams.set(k, params[k]));
  }
  return url.toString();
}

function fetchJson(url) {
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error('Congress API error: ' + r.status);
    return r.json();
  });
}

export function getBill(congress, billType, billNumber) {
  return fetchJson(buildUrl(`/bill/${congress}/${billType}/${billNumber}`));
}

export function listBills(congress, opts = {}) {
  const params = { congress };
  if (opts.limit) params.limit = opts.limit;
  if (opts.offset) params.offset = opts.offset;
  if (opts.billType) params.billType = opts.billType;
  return fetchJson(buildUrl('/bill', params));
}

export function getBillSummaries(congress, billType, billNumber) {
  return fetchJson(buildUrl(`/bill/${congress}/${billType}/${billNumber}/summaries`));
}

function formatBillNumber(billType, num) {
  const t = (billType || 'hr').toUpperCase();
  if (t === 'HR' || t === 'S') return (t === 'HR' ? 'H.R.' : 'S.') + ' ' + num;
  return t + '.' + num;
}

function inferStatus(bill) {
  const latest = bill.latestAction || bill.latestActionText;
  const text = (latest && latest.text) ? latest.text.toLowerCase() : '';
  if (text.includes('became public law') || text.includes('signed by president')) return 'enacted';
  return 'pending';
}

export function billToPolicy(billData) {
  const bill = billData.bill || billData;
  const congress = bill.congress;
  const billType = (bill.type || '').toLowerCase();
  const num = bill.number;
  const title = bill.title || bill.shortTitle || 'Untitled';
  const congressGovUrl = `https://www.congress.gov/bill/${congress}th-congress/${billType}/${num}`;
  const govTrackUrl = `https://www.govtrack.us/congress/bills/${congress}/${billType}${num}`;

  return {
    title,
    shortTitle: bill.shortTitle || title,
    billNumber: formatBillNumber(billType, num),
    congress: parseInt(congress, 10),
    billType,
    congressGovId: `${congress}-${billType}-${num}`,
    links: { congressGov: congressGovUrl, govTrack: govTrackUrl },
    status: inferStatus(bill),
    summary: '',
    details: '',
    impact: 'mixed',
    categories: [],
    actionItems: [],
  };
}

export const CongressAPI = {
  getBill,
  listBills,
  getBillSummaries,
  billToPolicy,
  hasKey: () => !!apiKey,
  getKey: () => apiKey,
};
