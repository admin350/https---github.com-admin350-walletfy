// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED, initializeFirestore, type Firestore } from "firebase/firestore";

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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Lazy initialization for Firebase
function getFirebaseInstances() {
    if (typeof window !== "undefined" && !getApps().length) {
        // This ensures we only initialize on the client
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } else if (getApps().length) {
        app = getApp();
        auth = getAuth(app);
        db = getFirestore(app);
    }
}

getFirebaseInstances();

export { app, auth, db, enableIndexedDbPersistence };
