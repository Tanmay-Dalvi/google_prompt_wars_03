/**
 * Firebase configuration and initialization for EcoSense.
 * Initializes Firebase Auth, Firestore, and Analytics.
 * @module firebase/config
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForVercelInitialization",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "google-prompt-wars-03.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "google-prompt-wars-03",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "google-prompt-wars-03.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:dummyaffect",
};

let app;
let auth;
let googleProvider;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization failed, using mocks:", error);
  app = {};
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {};
    },
    signOut: () => Promise.resolve(),
  };
  googleProvider = {};
  db = {};
}

export { app, auth, googleProvider, db };

let analyticsInstance = null;
try {
  if (app && app.options) {
    analyticsInstance = getAnalytics(app);
  }
} catch (err) {
  // Silent catch for test/server environment compatibility
}
export const analytics = analyticsInstance;

export const trackEvent = (name, params) => {
  try {
    if (analyticsInstance) {
      logEvent(analyticsInstance, name, params);
    }
  } catch (err) {
    // Silent catch
  }
};

export default app;
