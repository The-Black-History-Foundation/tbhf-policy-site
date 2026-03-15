/**
 * Congress.gov API client.
 * Requires CONGRESS_API_KEY in config.js.
 */
const CongressAPI = (function () {
  const BASE = 'https://api.congress.gov/v3';
  const config = window.TBHF_CONFIG || {};
  const apiKey = config.CONGRESS_API_KEY || '';

  function getKey() {
    return apiKey;
  }

  function hasKey() {
    return !!apiKey;
  }

  function buildUrl(path, params) {
    const url = new URL(BASE + path);
    if (apiKey) url.searchParams.set('api_key', apiKey);
    if (params) {
      Object.keys(params).forEach(function (k) {
        url.searchParams.set(k, params[k]);
      });
    }
    return url.toString();
  }

  function fetchJson(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('Congress API error: ' + r.status);
      return r.json();
    });
  }

  /**
   * Fetch a single bill by congress, type, and number.
   * @param {number} congress - e.g. 118
   * @param {string} billType - hr, s, hjres, sjres, etc.
   * @param {number} billNumber - e.g. 765
   */
  function getBill(congress, billType, billNumber) {
    const path = '/bill/' + congress + '/' + billType + '/' + billNumber;
    return fetchJson(buildUrl(path));
  }

  /**
   * List bills for a congress.
   * @param {number} congress - e.g. 118
   * @param {object} opts - limit, offset, billType, fromDateTime, toDateTime
   */
  function listBills(congress, opts) {
    opts = opts || {};
    const params = { congress: congress };
    if (opts.limit) params.limit = opts.limit;
    if (opts.offset) params.offset = opts.offset;
    if (opts.billType) params.billType = opts.billType;
    if (opts.fromDateTime) params.fromDateTime = opts.fromDateTime;
    if (opts.toDateTime) params.toDateTime = opts.toDateTime;
    return fetchJson(buildUrl('/bill', params));
  }

  /**
   * Get bill summaries.
   */
  function getBillSummaries(congress, billType, billNumber) {
    const path = '/bill/' + congress + '/' + billType + '/' + billNumber + '/summaries';
    return fetchJson(buildUrl(path));
  }

  /**
   * Parse Congress.gov bill response into our policy schema.
   */
  function billToPolicy(billData) {
    const bill = billData.bill || billData;
    const congress = bill.congress;
    const billType = (bill.type || '').toLowerCase();
    const num = bill.number;
    const title = bill.title || bill.shortTitle || 'Untitled';
    const congressGovUrl = 'https://www.congress.gov/bill/' + congress + 'th-congress/' + billType + '/' + num;
    const govTrackUrl = 'https://www.govtrack.us/congress/bills/' + congress + '/' + billType + num;

    return {
      title: title,
      shortTitle: bill.shortTitle || title,
      billNumber: formatBillNumber(billType, num),
      congress: parseInt(congress, 10),
      billType: billType,
      congressGovId: congress + '-' + billType + '-' + num,
      links: {
        congressGov: congressGovUrl,
        govTrack: govTrackUrl
      },
      status: inferStatus(bill),
      summary: '',
      details: '',
      impact: 'mixed',
      categories: [],
      actionItems: []
    };
  }

  function formatBillNumber(billType, num) {
    const t = (billType || 'hr').toUpperCase();
    if (t === 'HR' || t === 'S') return (t === 'HR' ? 'H.R.' : 'S.') + ' ' + num;
    return t + '.' + num;
  }

  function inferStatus(bill) {
    const latest = bill.latestAction || bill.latestActionText;
    const text = (latest && latest.text) ? latest.text.toLowerCase() : '';
    if (text.indexOf('became public law') >= 0 || text.indexOf('signed by president') >= 0) return 'enacted';
    if (text.indexOf('passed') >= 0 || text.indexOf('referred') >= 0) return 'pending';
    return 'pending';
  }

  var api = {
    getBill: getBill,
    listBills: listBills,
    getBillSummaries: getBillSummaries,
    billToPolicy: billToPolicy,
    hasKey: hasKey,
    getKey: getKey
  };
  window.CongressAPI = api;
  return api;
})();
