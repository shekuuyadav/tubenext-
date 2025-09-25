
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDb7pWT4BVyAW3iBRELUJNFF2X98POOx58",
  authDomain: "tubenext-m3vwi.firebaseapp.com",
  projectId: "tubenext-m3vwi",
  storageBucket: "tubenext-m3vwi.firebasestorage.app",
  messagingSenderId: "136373606702",
  appId: "1:136373606702:web:6ee7393915b51a0e9b02bf"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
