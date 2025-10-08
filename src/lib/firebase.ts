
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAooE58pfmLlwtJYqVYtbBY-iweawgrWYY",
  authDomain: "eng-name-468403-f5.firebaseapp.com",
  projectId: "eng-name-468403-f5",
  storageBucket: "eng-name-468403-f5.appspot.com",
  messagingSenderId: "20250015401",
  appId: "1:20250015401:web:0f872d6a105841d6e4dbb8"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore con persistencia habilitada
const db = getFirestore(app);
try {
  enableIndexedDbPersistence(db)
  console.log("Firebase Offline-first persistence enabled");
} catch (error) {
  if (error instanceof Error && error.code === 'failed-precondition') {
    console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
  } else if (error instanceof Error && error.code === 'unimplemented') {
    console.warn("The current browser does not support all of the features required to enable persistence.");
  }
}

const auth = getAuth(app);

export { app, db, auth };
