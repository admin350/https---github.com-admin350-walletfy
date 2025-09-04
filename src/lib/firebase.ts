

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "fa-vision",
  "appId": "1:340465179002:web:f4c555150a25ea691d5ec3",
  "storageBucket": "fa-vision.firebasestorage.app",
  "apiKey": "AIzaSyBpEHk9J_35GMcHw38fjcHu7V4gG0-qNX8",
  "authDomain": "fa-vision.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "340465179002"
};

// Initialize Firebase, checking if apps are already initialized.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
