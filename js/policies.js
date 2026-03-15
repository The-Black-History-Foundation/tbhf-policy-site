/**
 * Policy list and detail - reads from Firestore.
 */
(function () {
  function getDb() {
    return window.TBHF_DB;
  }

  function isReady() {
    return window.TBHF_FIREBASE_READY === true;
  }

  function collection() {
    const db = getDb();
    return db ? db.collection('policies') : null;
  }

  function subscribePolicies(callback) {
    const col = collection();
    if (!col) {
      callback([]);
      return function () {};
    }
    return col.onSnapshot(
      function (snap) {
        const list = snap.docs.map(function (d) {
          const data = d.data();
          data.id = d.id;
          return data;
        }).sort(function (a, b) {
          var at = (a.updatedAt && a.updatedAt.toMillis) ? a.updatedAt.toMillis() : (a.createdAt && a.createdAt.toMillis) ? a.createdAt.toMillis() : 0;
          var bt = (b.updatedAt && b.updatedAt.toMillis) ? b.updatedAt.toMillis() : (b.createdAt && b.createdAt.toMillis) ? b.createdAt.toMillis() : 0;
          return bt - at;
        });
        callback(list);
      },
      function (err) {
        console.warn('Firestore policies error:', err);
        callback([]);
      }
    );
  }

  function getPolicy(id) {
    const db = getDb();
    if (!db) return Promise.resolve(null);
    return db.collection('policies').doc(id).get().then(function (d) {
      if (!d.exists) return null;
      const data = d.data();
      data.id = d.id;
      return data;
    });
  }

  window.TBHF_Policies = {
    isReady: isReady,
    subscribePolicies: subscribePolicies,
    getPolicy: getPolicy
  };
})();
