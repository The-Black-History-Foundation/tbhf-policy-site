/**
 * Admin page: Auth, CRUD, AI Agent
 */
(function () {
  var db = window.TBHF_DB;
  var auth = window.TBHF_AUTH;
  var Congress = window.CongressAPI;

  if (!auth) {
    document.getElementById('admin-auth-form').innerHTML = '<p>Firebase not configured. Add firebase-config.js.</p>';
    return;
  }

  var authForm = document.getElementById('admin-auth-form');
  var authContent = document.getElementById('admin-content');
  var authState = document.getElementById('admin-auth-state');
  var authError = document.getElementById('admin-auth-error');
  var policyList = document.getElementById('admin-policy-list');
  var policyForm = document.getElementById('admin-policy-form');
  var policyFormTitle = document.getElementById('policy-form-title');
  var policyIdInput = document.getElementById('policy-id');
  var policyCancelBtn = document.getElementById('policy-cancel-btn');
  var aiSearchBtn = document.getElementById('ai-search-btn');
  var aiFetchBtn = document.getElementById('ai-fetch-btn');
  var aiOutput = document.getElementById('ai-output');

  function showAuthForm() {
    authForm.classList.remove('hidden');
    authContent.classList.add('hidden');
    authState.innerHTML = '';
  }

  function showAdminContent() {
    authForm.classList.add('hidden');
    authContent.classList.remove('hidden');
    authState.innerHTML = '<span>' + (auth.currentUser && auth.currentUser.email) + '</span> <button type="button" id="admin-signout" class="btn btn-outline btn-sm">Sign Out</button>';
    document.getElementById('admin-signout').addEventListener('click', function () {
      auth.signOut();
    });
    loadPolicies();
  }

  function setAuthError(msg) {
    authError.textContent = msg || '';
    authError.classList.toggle('hidden', !msg);
  }

  auth.onAuthStateChanged(function (user) {
    if (user) {
      showAdminContent();
    } else {
      showAuthForm();
    }
  });

  document.getElementById('admin-login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    setAuthError('');
    var email = document.getElementById('admin-email').value.trim();
    var password = document.getElementById('admin-password').value;
    auth.signInWithEmailAndPassword(email, password).then(function () {
      setAuthError('');
    }).catch(function (err) {
      setAuthError(err.message || 'Sign in failed');
    });
  });

  function policiesCollection() {
    return db ? db.collection('policies') : null;
  }

  function loadPolicies() {
    var col = policiesCollection();
    if (!col) return;
    col.get().then(function (snap) {
      policyList.innerHTML = snap.docs.map(function (d) {
        var p = d.data();
        var id = d.id;
        var impact = p.impact || 'mixed';
        return '<li><span><strong>' + (p.shortTitle || p.title || 'Untitled') + '</strong> ' + (p.billNumber || '') + ' (' + impact + ')</span><span><button type="button" class="btn btn-outline btn-sm edit-policy" data-id="' + id + '">Edit</button> <button type="button" class="btn btn-outline btn-sm delete-policy" data-id="' + id + '">Delete</button></span></li>';
      }).join('');
      policyList.querySelectorAll('.edit-policy').forEach(function (btn) {
        btn.addEventListener('click', function () { editPolicy(btn.dataset.id); });
      });
      policyList.querySelectorAll('.delete-policy').forEach(function (btn) {
        btn.addEventListener('click', function () { deletePolicy(btn.dataset.id); });
      });
    });
  }

  function getPolicyFormData() {
    var links = {};
    var congressGov = document.getElementById('policy-congressGovUrl').value.trim();
    var govTrack = document.getElementById('policy-govTrackUrl').value.trim();
    if (congressGov) links.congressGov = congressGov;
    if (govTrack) links.govTrack = govTrack;
    return {
      title: document.getElementById('policy-title').value.trim(),
      shortTitle: document.getElementById('policy-shortTitle').value.trim(),
      impact: document.getElementById('policy-impact').value,
      status: document.getElementById('policy-status').value,
      billNumber: document.getElementById('policy-billNumber').value.trim(),
      congress: parseInt(document.getElementById('policy-congress').value, 10) || null,
      summary: document.getElementById('policy-summary').value.trim(),
      details: document.getElementById('policy-details').value.trim(),
      links: Object.keys(links).length ? links : {},
      actionItems: []
    };
  }

  function setPolicyFormData(p) {
    document.getElementById('policy-title').value = p.title || '';
    document.getElementById('policy-shortTitle').value = p.shortTitle || '';
    document.getElementById('policy-impact').value = p.impact || 'mixed';
    document.getElementById('policy-status').value = p.status || 'pending';
    document.getElementById('policy-billNumber').value = p.billNumber || '';
    document.getElementById('policy-congress').value = p.congress || '';
    document.getElementById('policy-summary').value = p.summary || '';
    document.getElementById('policy-details').value = p.details || '';
    document.getElementById('policy-congressGovUrl').value = (p.links && p.links.congressGov) || '';
    document.getElementById('policy-govTrackUrl').value = (p.links && p.links.govTrack) || '';
  }

  function clearPolicyForm() {
    policyIdInput.value = '';
    policyFormTitle.textContent = 'Add Policy';
    setPolicyFormData({
      title: '', shortTitle: '', impact: 'mixed', status: 'pending',
      billNumber: '', congress: '', summary: '', details: '',
      links: {}
    });
  }

  policyForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var col = policiesCollection();
    if (!col) return;
    var data = getPolicyFormData();
    var now = firebase.firestore.Timestamp.now();
    data.updatedAt = now;
    if (!policyIdInput.value) {
      data.createdAt = now;
      col.add(data).then(function () {
        clearPolicyForm();
        loadPolicies();
      }).catch(function (err) {
        alert('Error: ' + err.message);
      });
    } else {
      col.doc(policyIdInput.value).update(data).then(function () {
        clearPolicyForm();
        loadPolicies();
      }).catch(function (err) {
        alert('Error: ' + err.message);
      });
    }
  });

  if (policyCancelBtn) {
    policyCancelBtn.addEventListener('click', clearPolicyForm);
  }

  function editPolicy(id) {
    var col = policiesCollection();
    if (!col) return;
    col.doc(id).get().then(function (d) {
      if (!d.exists) return;
      var p = d.data();
      p.id = d.id;
      policyIdInput.value = id;
      policyFormTitle.textContent = 'Edit Policy';
      setPolicyFormData(p);
      policyForm.scrollIntoView();
    });
  }

  function deletePolicy(id) {
    if (!confirm('Delete this policy?')) return;
    var col = policiesCollection();
    if (!col) return;
    col.doc(id).delete().then(function () {
      loadPolicies();
      if (policyIdInput.value === id) clearPolicyForm();
    }).catch(function (err) {
      alert('Error: ' + err.message);
    });
  }

  function showAiOutput(text) {
    aiOutput.textContent = text;
    aiOutput.classList.remove('hidden');
  }

  function hideAiOutput() {
    aiOutput.classList.add('hidden');
  }

  if (aiFetchBtn) {
    aiFetchBtn.addEventListener('click', function () {
      var congress = parseInt(document.getElementById('ai-congress').value, 10);
      var billType = document.getElementById('ai-bill-type').value;
      var billNumber = parseInt(document.getElementById('ai-bill-number').value, 10);
      if (!congress || !billNumber) {
        showAiOutput('Enter Congress and bill number.');
        return;
      }
      if (!Congress || !Congress.hasKey()) {
        showAiOutput('Add CONGRESS_API_KEY to config.js for Congress.gov API.');
        return;
      }
      showAiOutput('Fetching...');
      Congress.getBill(congress, billType, billNumber).then(function (res) {
        var bill = res.bill || res;
        var policy = Congress.billToPolicy(bill);
        Congress.getBillSummaries(congress, billType, billNumber).then(function (sumRes) {
          var items = (sumRes && sumRes.summaries) ? sumRes.summaries : (Array.isArray(sumRes) ? sumRes : []);
          if (items.length && items[0].text) {
            policy.summary = String(items[0].text).substring(0, 500);
          }
          setPolicyFormData(policy);
          showAiOutput('Fetched: ' + policy.title + '\n\nReview summary, set impact, add details. Click Save Policy.');
        }).catch(function () {
          setPolicyFormData(policy);
          showAiOutput('Fetched: ' + policy.title + '\n\nFill in summary, impact, and details, then click Save Policy.');
        });
      }).catch(function (err) {
        showAiOutput('Error: ' + err.message);
      });
    });
  }

  if (aiSearchBtn) {
    aiSearchBtn.addEventListener('click', function () {
      var query = document.getElementById('ai-search-query').value.trim();
      if (!query) {
        showAiOutput('Enter a search query (e.g. "African American history education").');
        return;
      }
      showAiOutput('Congress.gov API does not support keyword search.\n\nTo find relevant bills:\n\n1. Go to congress.gov and search for "' + query + '"\n2. Note bill numbers (e.g. H.R. 765, S. 123)\n3. Enter Congress (e.g. 119) and bill number above\n4. Click "Fetch from Congress.gov" to import\n\nKnown bills related to Black history preservation:\n- H.R. 765 (African American History Act)\n- National Council on African American History and Culture Act\n- Juneteenth National Independence Day Act');
    });
  }

  var aiDraftBtn = document.getElementById('ai-draft-btn');
  if (aiDraftBtn) {
    aiDraftBtn.addEventListener('click', function () {
      var config = window.TBHF_CONFIG || {};
      var url = config.AI_AGENT_URL;
      if (!url) {
        showAiOutput('Set AI_AGENT_URL in config.js to enable AI summary drafting.\n\nDeploy a Cloud Function or serverless endpoint that accepts { title, billNumber, summary } and returns an AI-drafted impact summary.');
        return;
      }
      var title = document.getElementById('policy-title').value.trim();
      var billNumber = document.getElementById('policy-billNumber').value.trim();
      var summary = document.getElementById('policy-summary').value.trim();
      if (!title && !summary) {
        showAiOutput('Fill in title or summary first, then click AI Draft.');
        return;
      }
      showAiOutput('Calling AI agent...');
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title, billNumber: billNumber, summary: summary })
      }).then(function (r) { return r.json(); }).then(function (data) {
        if (data.details) {
          document.getElementById('policy-details').value = data.details;
          showAiOutput('AI drafted impact summary. Review and edit, then Save.');
        } else {
          showAiOutput(JSON.stringify(data));
        }
      }).catch(function (err) {
        showAiOutput('Error: ' + err.message);
      });
    });
  }
})();
