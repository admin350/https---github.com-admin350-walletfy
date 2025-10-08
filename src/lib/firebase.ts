
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
    getFirestore, 
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAooE58pfmLlwtJYqVYtbBY-iweawgrWYY",
  authDomain: "eng-name-468403-f5.firebaseapp.com",
  projectId: "eng-name-468403-f5",
  storageBucket: "eng-name-468403-f5.appspot.com",
  messagingSenderId: "20250015401",
  appId: "1:20250015401:web:0f872d6a105841d6e4dbb8"
};

// Singleton pattern to ensure only one instance of Firebase services
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with robust offline persistence for multi-tab environments
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const auth = getAuth(app);

export { app, db, auth };
