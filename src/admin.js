/**
 * Admin page: Auth, CRUD, AI Agent
 */
import { config } from './config.js';
import { initFirebase } from './firebase-app.js';
import { CongressAPI } from './congress-api.js';
import { FederalRegisterAPI } from './federal-register-api.js';

window.TBHF_CONFIG = config;
initFirebase();

const auth = window.TBHF_AUTH;
const db = window.TBHF_DB;

if (!auth) {
  const el = document.getElementById('admin-auth-form');
  if (el) el.innerHTML = '<p>Firebase not configured. Add VITE_FIREBASE_* to .env.</p>';
} else {
  const authForm = document.getElementById('admin-auth-form');
  const authContent = document.getElementById('admin-content');
  const authError = document.getElementById('admin-auth-error');
  const policyList = document.getElementById('admin-policy-list');
  const policyForm = document.getElementById('admin-policy-form');
  const policyFormTitle = document.getElementById('policy-form-title');
  const policyIdInput = document.getElementById('policy-id');
  const policyCancelBtn = document.getElementById('policy-cancel-btn');
  const aiSearchBtn = document.getElementById('ai-search-btn');
  const aiFetchBtn = document.getElementById('ai-fetch-btn');
  const aiFetchEoBtn = document.getElementById('ai-fetch-eo-btn');
  const aiOutput = document.getElementById('ai-output');

  function showAuthForm() {
    authForm?.classList.remove('hidden');
    authContent?.classList.add('hidden');
    document.getElementById('admin-auth-state').innerHTML = '';
  }

  function showAdminContent() {
    authForm?.classList.add('hidden');
    authContent?.classList.remove('hidden');
    document.getElementById('admin-auth-state').innerHTML = `<span>${auth.currentUser?.email || ''}</span> <button type="button" id="admin-signout" class="btn btn-outline btn-sm">Sign Out</button>`;
    document.getElementById('admin-signout')?.addEventListener('click', () => auth.signOut());
    initAdminTabs();
    loadPolicies();
  }

  function switchToTab(index) {
    const tabs = document.querySelectorAll('.admin-tab');
    const panels = document.querySelectorAll('.admin-tab-panel');
    tabs.forEach((t, j) => {
      t.classList.toggle('active', j === index);
      t.setAttribute('aria-selected', j === index);
    });
    panels.forEach((p, j) => {
      p.classList.toggle('active', j === index);
    });
  }

  function initAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => switchToTab(i));
    });
  }

  function setAuthError(msg) {
    if (authError) {
      authError.textContent = msg || '';
      authError.classList.toggle('hidden', !msg);
    }
  }

  auth.onAuthStateChanged((user) => (user ? showAdminContent() : showAuthForm()));

  updatePolicyTypeUI();

  document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    setAuthError('');
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    auth.signInWithEmailAndPassword(email, password).then(() => setAuthError('')).catch((err) => setAuthError(err.message || 'Sign in failed'));
  });

  function policiesCollection() {
    return db?.collection('policies') || null;
  }

  function loadPolicies() {
    const col = policiesCollection();
    if (!col) return;
    col.get().then((snap) => {
      policyList.innerHTML = snap.docs.map((d) => {
        const p = d.data();
        const id = d.id;
        const impact = p.impact || 'mixed';
        const ref = p.billNumber || (p.policyType === 'executive_order' && p.executiveOrderNumber ? `E.O. ${p.executiveOrderNumber}` : '');
        return `<li><span><strong>${p.shortTitle || p.title || 'Untitled'}</strong> ${ref} (${impact})</span><span><button type="button" class="btn btn-outline btn-sm edit-policy" data-id="${id}">Edit</button> <button type="button" class="btn btn-outline btn-sm delete-policy" data-id="${id}">Delete</button></span></li>`;
      }).join('');
      policyList.querySelectorAll('.edit-policy').forEach((btn) => btn.addEventListener('click', () => editPolicy(btn.dataset.id)));
      policyList.querySelectorAll('.delete-policy').forEach((btn) => btn.addEventListener('click', () => deletePolicy(btn.dataset.id)));
    });
  }

  function getPolicyFormData() {
    const policyType = document.getElementById('policy-policyType')?.value || 'bill';
    const congressGov = document.getElementById('policy-congressGovUrl')?.value?.trim() || '';
    const govTrack = document.getElementById('policy-govTrackUrl')?.value?.trim() || '';
    const federalRegister = document.getElementById('policy-federalRegisterUrl')?.value?.trim() || '';
    const links = {};
    if (congressGov) links.congressGov = congressGov;
    if (govTrack) links.govTrack = govTrack;
    if (federalRegister) links.federalRegister = federalRegister;
    let billNumber = '';
    let executiveOrderNumber = null;
    if (policyType === 'executive_order') {
      executiveOrderNumber = parseInt(document.getElementById('policy-executiveOrderNumber')?.value, 10) || null;
      billNumber = executiveOrderNumber ? `E.O. ${executiveOrderNumber}` : '';
    } else {
      billNumber = document.getElementById('policy-billNumber')?.value?.trim() || '';
    }
    return {
      title: document.getElementById('policy-title')?.value?.trim() || '',
      shortTitle: document.getElementById('policy-shortTitle')?.value?.trim() || '',
      policyType,
      impact: document.getElementById('policy-impact')?.value || 'mixed',
      status: document.getElementById('policy-status')?.value || 'pending',
      billNumber,
      executiveOrderNumber: policyType === 'executive_order' ? executiveOrderNumber : null,
      congress: policyType === 'bill' ? (parseInt(document.getElementById('policy-congress')?.value, 10) || null) : null,
      summary: document.getElementById('policy-summary')?.value?.trim() || '',
      details: document.getElementById('policy-details')?.value?.trim() || '',
      links: Object.keys(links).length ? links : {},
      actionItems: [],
    };
  }

  function setPolicyFormData(p) {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
    set('policy-title', p.title);
    set('policy-shortTitle', p.shortTitle);
    set('policy-policyType', p.policyType || 'bill');
    set('policy-impact', p.impact);
    set('policy-status', p.status);
    if (p.policyType === 'executive_order') {
      set('policy-executiveOrderNumber', p.executiveOrderNumber ?? (p.billNumber ? parseInt(String(p.billNumber).replace(/\D/g, ''), 10) : ''));
      set('policy-billNumber', '');
    } else {
      set('policy-billNumber', p.billNumber);
      set('policy-executiveOrderNumber', '');
    }
    set('policy-congress', p.congress);
    set('policy-summary', p.summary);
    set('policy-details', p.details);
    set('policy-congressGovUrl', p.links?.congressGov);
    set('policy-govTrackUrl', p.links?.govTrack);
    set('policy-federalRegisterUrl', p.links?.federalRegister);
    updatePolicyTypeUI();
  }

  function updatePolicyTypeUI() {
    const policyType = document.getElementById('policy-policyType')?.value || 'bill';
    const isEo = policyType === 'executive_order';
    document.getElementById('policy-bill-row')?.classList.toggle('hidden', isEo);
    document.getElementById('policy-eo-row')?.classList.toggle('hidden', !isEo);
    document.getElementById('policy-congress-row')?.classList.toggle('hidden', isEo);
    document.getElementById('policy-congress-urls')?.classList.toggle('hidden', isEo);
    document.getElementById('policy-federal-register-row')?.classList.toggle('hidden', !isEo);
  }

  function clearPolicyForm() {
    policyIdInput.value = '';
    policyFormTitle.textContent = 'Add Policy';
    setPolicyFormData({ title: '', shortTitle: '', policyType: 'bill', impact: 'mixed', status: 'pending', billNumber: '', congress: '', summary: '', details: '', links: {} });
  }

  document.getElementById('policy-policyType')?.addEventListener('change', updatePolicyTypeUI);

  policyForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const col = policiesCollection();
    if (!col) return;
    const data = getPolicyFormData();
    const now = firebase.firestore.Timestamp.now();
    data.updatedAt = now;
    if (!policyIdInput.value) {
      data.createdAt = now;
      col.add(data).then(() => { clearPolicyForm(); loadPolicies(); }).catch((err) => alert('Error: ' + err.message));
    } else {
      col.doc(policyIdInput.value).update(data).then(() => { clearPolicyForm(); loadPolicies(); }).catch((err) => alert('Error: ' + err.message));
    }
  });

  policyCancelBtn?.addEventListener('click', clearPolicyForm);

  function editPolicy(id) {
    const col = policiesCollection();
    if (!col) return;
    col.doc(id).get().then((d) => {
      if (!d.exists) return;
      const p = d.data();
      policyIdInput.value = id;
      policyFormTitle.textContent = 'Edit Policy';
      setPolicyFormData(p);
      policyForm?.scrollIntoView();
    });
  }

  function deletePolicy(id) {
    if (!confirm('Delete this policy?')) return;
    const col = policiesCollection();
    if (!col) return;
    col.doc(id).delete().then(() => { loadPolicies(); if (policyIdInput.value === id) clearPolicyForm(); }).catch((err) => alert('Error: ' + err.message));
  }

  function showAiOutput(text) {
    if (aiOutput) {
      aiOutput.textContent = text;
      aiOutput.classList.remove('hidden');
    }
  }

  function hideAiOutput() {
    if (aiOutput) aiOutput.classList.add('hidden');
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
  }

  aiFetchEoBtn?.addEventListener('click', () => {
    const eoNum = parseInt(document.getElementById('ai-eo-number')?.value, 10);
    if (!eoNum) {
      showAiOutput('Enter an Executive Order number (e.g. 14067).');
      return;
    }
    showAiOutput('Fetching Executive Order...');
    FederalRegisterAPI.searchExecutiveOrder(eoNum)
      .then((doc) => FederalRegisterAPI.eoToPolicyWithSummary(doc))
      .then((policy) => {
        document.getElementById('policy-policyType').value = 'executive_order';
        updatePolicyTypeUI();
        setPolicyFormData(policy);
        showAiOutput('Fetched: ' + policy.title + '\n\nReview summary and set impact. Use "AI Draft Summary" to generate the Details (impact on Black history), then Save Policy.');
        switchToTab(1);
      })
      .catch((err) => showAiOutput('Error: ' + err.message));
  });

  aiFetchBtn?.addEventListener('click', () => {
    const congress = parseInt(document.getElementById('ai-congress')?.value, 10);
    const billType = document.getElementById('ai-bill-type')?.value;
    const billNumber = parseInt(document.getElementById('ai-bill-number')?.value, 10);
    if (!congress || !billNumber) {
      showAiOutput('Enter Congress and bill number.');
      return;
    }
    if (!CongressAPI.hasKey()) {
      showAiOutput('Add VITE_CONGRESS_API_KEY to .env for Congress.gov API.');
      return;
    }
    showAiOutput('Fetching...');
    CongressAPI.getBill(congress, billType, billNumber).then((res) => {
      const bill = res.bill || res;
      const policy = { ...CongressAPI.billToPolicy(bill), policyType: 'bill' };
      CongressAPI.getBillSummaries(congress, billType, billNumber).then((sumRes) => {
        const items = sumRes?.summaries ?? (Array.isArray(sumRes) ? sumRes : []);
        if (items.length && items[0].text) policy.summary = stripHtml(String(items[0].text));
        setPolicyFormData(policy);
        showAiOutput('Fetched: ' + policy.title + '\n\nReview summary and set impact. Use "AI Draft Summary" to generate the Details (impact on Black history), then Save Policy.');
        switchToTab(1);
      }).catch(() => {
        setPolicyFormData(policy);
        showAiOutput('Fetched: ' + policy.title + '\n\nNo summary from Congress.gov. Use "AI Draft Summary" to generate Details (impact on Black history), then Save Policy.');
        switchToTab(1);
      });
    }).catch((err) => showAiOutput('Error: ' + err.message));
  });

  aiSearchBtn?.addEventListener('click', () => {
    const query = document.getElementById('ai-search-query')?.value?.trim() || '';
    if (!query) {
      showAiOutput('Enter a search term (e.g. "Black history", "digital assets").');
      return;
    }
    showAiOutput('Searching Federal Register...');
    FederalRegisterAPI.searchByTerm(query, 15)
      .then((res) => {
        const results = (res.results || []).slice().sort((a, b) => {
          const da = a.publication_date ? new Date(a.publication_date).getTime() : 0;
          const db = b.publication_date ? new Date(b.publication_date).getTime() : 0;
          return db - da;
        });
        if (!results.length) {
          showAiOutput('No Executive Orders or Presidential Documents found for "' + query + '".');
          return;
        }
        const html = results.map((doc) => {
          const date = doc.publication_date ? new Date(doc.publication_date).toLocaleDateString() : '';
          const subtype = doc.subtype || doc.type || '';
          return `<div class="ai-search-result" data-doc="${doc.document_number}" role="button" tabindex="0">${doc.title || 'Untitled'} <span class="ai-search-meta">${subtype} · ${doc.document_number} · ${date}</span></div>`;
        }).join('');
        aiOutput.innerHTML = `<p><strong>${res.count ?? results.length} result(s). Click one to import:</strong></p>${html}`;
        aiOutput.classList.remove('hidden');
        const handleSelect = (docNum) => {
          if (!docNum) return;
          showAiOutput('Fetching document...');
          FederalRegisterAPI.getDocument(docNum)
              .then((full) => FederalRegisterAPI.eoToPolicyWithSummary(full))
              .then((policy) => {
                document.getElementById('policy-policyType').value = 'executive_order';
                updatePolicyTypeUI();
                setPolicyFormData(policy);
                showAiOutput('Imported: ' + policy.title + '\n\nReview and set impact. Use "AI Draft Summary" for Details, then Save Policy.');
                switchToTab(1);
                policyForm?.scrollIntoView();
              })
              .catch((err) => showAiOutput('Error: ' + err.message));
        };
        aiOutput.querySelectorAll('.ai-search-result').forEach((el) => {
          const docNum = el.dataset.doc;
          el.addEventListener('click', () => handleSelect(docNum));
          el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(docNum); } });
        });
      })
      .catch((err) => showAiOutput('Error: ' + err.message));
  });

  document.getElementById('ai-draft-btn')?.addEventListener('click', () => {
    const url = import.meta.env.DEV ? '/api/ai-draft' : (config.AI_AGENT_URL || '');
    if (!url) {
      showAiOutput('Set VITE_AI_AGENT_URL in .env to enable AI summary drafting.\n\nDeploy a Cloud Function or serverless endpoint that accepts { title, billNumber, summary } and returns an AI-drafted impact summary.');
      return;
    }
    const title = document.getElementById('policy-title')?.value?.trim() || '';
    const billNumber = document.getElementById('policy-billNumber')?.value?.trim() || '';
    const summary = document.getElementById('policy-summary')?.value?.trim() || '';
    if (!title && !summary) {
      showAiOutput('Fill in title or summary first, then click AI Draft.');
      return;
    }
    const statusEl = document.getElementById('ai-draft-status');
    if (statusEl) {
      statusEl.textContent = 'AI is creating the summary...';
      statusEl.classList.remove('hidden');
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, billNumber, summary }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (statusEl) statusEl.classList.add('hidden');
        if (data.details) {
          document.getElementById('policy-details').value = data.details;
        } else {
          showAiOutput(JSON.stringify(data));
        }
      })
      .catch((err) => {
        if (statusEl) statusEl.classList.add('hidden');
        showAiOutput('Error: ' + err.message);
      });
  });
}
