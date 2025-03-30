// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASW_JbOfpJ2DkCmzO7AOlkjv806IGUnUg",
  authDomain: "lnmdoubtsolverz.firebaseapp.com",
  projectId: "lnmdoubtsolverz",
  storageBucket: "lnmdoubtsolverz.firebasestorage.app",
  messagingSenderId: "289840486336",
  appId: "1:289840486336:web:04f0db519c3278538a5a25",
  measurementId: "G-PHCM0327KB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
