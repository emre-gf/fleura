const firebaseConfig = {
  apiKey: "AIzaSyA-y7bxhgRQd2tBZhzw-jpCDqwOzjRn6ZE",
  authDomain: "fleuranails.firebaseapp.com",
  projectId: "fleuranails",
  storageBucket: "fleuranails.firebasestorage.app",
  messagingSenderId: "1037259204106",
  appId: "1:1037259204106:web:4ae669478367795063a1f3",
  measurementId: "G-5MWKVSGTQV"
};

async function initFirebaseAnalytics() {
  try {
    const [{ initializeApp }, { getAnalytics, isSupported }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js")
    ]);

    if (!(await isSupported())) return;

    const app = initializeApp(firebaseConfig);
    getAnalytics(app);
  } catch (error) {
    console.warn("Firebase Analytics could not be initialized.", error);
  }
}

// KVKK: Firebase Analytics yalnızca kullanıcı analitik çerezleri kabul ettiğinde başlar.
let analyticsStarted = false;

function scheduleFirebaseAnalytics() {
  if (analyticsStarted) return;
  analyticsStarted = true;

  const run = () => {
    void initFirebaseAnalytics();
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 5000 });
  } else {
    window.setTimeout(run, 2000);
  }
}

// Çerez bildirimi "Kabul et" seçildiğinde bu fonksiyonu çağırır.
window.fnStartFirebaseAnalytics = scheduleFirebaseAnalytics;

function hasAnalyticsConsent() {
  try {
    return localStorage.getItem("fn-cookie-consent") === "accepted";
  } catch (error) {
    return false;
  }
}

window.addEventListener(
  "load",
  () => {
    if (hasAnalyticsConsent()) scheduleFirebaseAnalytics();
  },
  { once: true }
);
