
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED, initializeFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "fa-vision",
  "appId": "1:340465179002:web:f4c555150a25ea691d5ec3",
  "storageBucket": "fa-vision.firebasestorage.app",
  "apiKey": "AIzaSyBpEHk9J_35GMcHw38fjcHu7V4gG0-qNX8",
  "authDomain": "fa-vision.firebaseapp.com",
  "measurementId": "G-9X03F2011M",
  "messagingSenderId": "340465179002"
};

// Initialize Firebase, checking if apps are already initialized.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// Robust Firestore initialization specifying the database ID
const db = initializeFirestore(app, {}, "(default)");

// Enable offline persistence
try {
    enableIndexedDbPersistence(db, {
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
    });
} catch (err: any) {
    if (err.code === 'failed-precondition') {
        // This can happen with multiple tabs open.
    } else if (err.code === 'unimplemented') {
        // The current browser does not support it.
    }
}


export const auth = getAuth(app);
export { db };
