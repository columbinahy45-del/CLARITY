import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  increment,
  type Unsubscribe,
} from 'firebase/firestore';

// Firebase web configuration.
// These values are public by design (security comes from firestore.rules), so they
// are the defaults; VITE_FIREBASE_* environment variables can still override them.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDtPZDTqL-3GYXfe8BlTlYp6glPQdebALQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'clarity-40427.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'clarity-40427',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'clarity-40427.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '525173551775',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:525173551775:web:d85f00e794396a7b3128aa',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-BZXJFFJVSH',
};

// Check if valid Firebase configuration is supplied by user
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    // Analytics only works in supported browsers; never let it break the app.
    analyticsSupported().then((ok) => { if (ok && app) getAnalytics(app); }).catch(() => {});
    try {
      // Optional profile fields (address, avatar, ...) are often undefined.
      db = initializeFirestore(app, { ignoreUndefinedProperties: true });
    } catch {
      // Already initialised (e.g. hot reload) - reuse the existing instance.
      db = getFirestore(app);
    }
    console.info('[Firebase] Initialized with custom project:', firebaseConfig.projectId);
  } catch (err) {
    console.warn('[Firebase] Initialization error:', err);
  }
}

export {
  app,
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  increment,
  type User,
  type Unsubscribe,
};
