/**
 * Policy list and detail - reads from Firestore.
 */
export function isReady() {
  return window.TBHF_FIREBASE_READY === true;
}

function collection() {
  const db = window.TBHF_DB;
  return db ? db.collection('policies') : null;
}

export function subscribePolicies(callback) {
  const col = collection();
  if (!col) {
    callback([]);
    return () => {};
  }
  return col.onSnapshot(
    (snap) => {
      const list = snap.docs
        .map((d) => {
          const data = d.data();
          data.id = d.id;
          return data;
        })
        .sort((a, b) => {
          const at = (a.updatedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0);
          const bt = (b.updatedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0);
          return bt - at;
        });
      callback(list);
    },
    (err) => {
      console.warn('Firestore policies error:', err);
      callback([]);
    }
  );
}

export function getPolicy(id) {
  const db = window.TBHF_DB;
  if (!db) return Promise.resolve(null);
  return db.collection('policies').doc(id).get().then((d) => {
    if (!d.exists) return null;
    const data = d.data();
    data.id = d.id;
    return data;
  });
}
