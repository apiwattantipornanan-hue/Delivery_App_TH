(function () {
  const STORE_KEY = "final-app-design-store-v1";
  const SETTINGS_ID = "shop";

  function initialStore() {
    return {
      orders: [],
      settings: {
        id: SETTINGS_ID,
        stockOpen: true,
        closedSlots: [],
        updatedAt: new Date().toISOString(),
      },
    };
  }

  function readLocal() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? { ...initialStore(), ...JSON.parse(raw) } : initialStore();
    } catch {
      return initialStore();
    }
  }

  function writeLocal(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent("final-app-store-change"));
  }

  function canUseFirebase() {
    return Boolean(
      window.FINAL_APP_FIREBASE_CONFIG?.enabled &&
        window.firebase?.apps &&
        window.firebase?.firestore,
    );
  }

  function withTimeout(promise, label) {
    const timeoutMs = window.FINAL_APP_FIREBASE_CONFIG?.timeoutMs || 10000;

    return Promise.race([
      promise,
      new Promise((_, reject) => {
        window.setTimeout(() => {
          reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  }

  let firebaseDb = null;

  function getFirebaseDb() {
    if (!canUseFirebase()) {
      return null;
    }

    if (!firebaseDb) {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(window.FINAL_APP_FIREBASE_CONFIG.firebaseConfig);
      }
      firebaseDb = window.firebase.firestore();
    }

    return firebaseDb;
  }

  async function getSettings() {
    const db = getFirebaseDb();

    if (db) {
      const doc = await db.collection("settings").doc(SETTINGS_ID).get();
      return doc.exists ? doc.data() : initialStore().settings;
    }

    return readLocal().settings;
  }

  async function saveSettings(nextSettings) {
    const settings = {
      ...nextSettings,
      id: SETTINGS_ID,
      updatedAt: new Date().toISOString(),
    };
    const db = getFirebaseDb();

    if (db) {
      await withTimeout(db.collection("settings").doc(SETTINGS_ID).set(settings, { merge: true }), "saveSettings");
      return settings;
    }

    const store = readLocal();
    store.settings = settings;
    writeLocal(store);
    return settings;
  }

  async function createOrder(order) {
    const db = getFirebaseDb();

    if (db) {
      await withTimeout(db.collection("orders").doc(order.id).set(order), "createOrder");
      return order;
    }

    const store = readLocal();
    store.orders = [order, ...store.orders.filter((item) => item.id !== order.id)];
    writeLocal(store);
    return order;
  }

  async function updateOrder(orderId, patch) {
    const db = getFirebaseDb();

    if (db) {
      await withTimeout(
        db.collection("orders").doc(orderId).set(
          {
            ...patch,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        ),
        "updateOrder",
      );
      return;
    }

    const store = readLocal();
    store.orders = store.orders.map((order) =>
      order.id === orderId ? { ...order, ...patch, updatedAt: new Date().toISOString() } : order,
    );
    writeLocal(store);
  }

  function subscribeOrders(callback) {
    const db = getFirebaseDb();

    if (db) {
      return db
        .collection("orders")
        .orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {
          callback(snapshot.docs.map((doc) => doc.data()));
        }, () => {
          callback(readLocal().orders);
        });
    }

    const emit = () => callback(readLocal().orders);
    emit();
    window.addEventListener("storage", emit);
    window.addEventListener("final-app-store-change", emit);
    return () => {
      window.removeEventListener("storage", emit);
      window.removeEventListener("final-app-store-change", emit);
    };
  }

  function subscribeSettings(callback) {
    const db = getFirebaseDb();

    if (db) {
      return db.collection("settings").doc(SETTINGS_ID).onSnapshot((doc) => {
        callback(doc.exists ? doc.data() : initialStore().settings);
      }, () => {
        callback(initialStore().settings);
      });
    }

    const emit = () => callback(readLocal().settings);
    emit();
    window.addEventListener("storage", emit);
    window.addEventListener("final-app-store-change", emit);
    return () => {
      window.removeEventListener("storage", emit);
      window.removeEventListener("final-app-store-change", emit);
    };
  }

  window.FinalAppStore = {
    createOrder,
    getSettings,
    saveSettings,
    subscribeOrders,
    subscribeSettings,
    updateOrder,
  };
})();
