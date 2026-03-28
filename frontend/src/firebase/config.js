import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Comment this out for now

const firebaseConfig = {
  apiKey: "AIzaSyB8igKyXTSjcUiCOysbFDddMrOlE6sN0SY",
  authDomain: "zenly-b02aa.firebaseapp.com",
  projectId: "zenly-b02aa",
  storageBucket: "zenly-b02aa.firebasestorage.app",
  messagingSenderId: "1018510996233",
  appId: "1:1018510996233:web:bf0775a12d472ce40a59d8",
  measurementId: "G-E84SLPW268"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider(); 

// Add scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');


export default app;