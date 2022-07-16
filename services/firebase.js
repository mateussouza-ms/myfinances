import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";

// If you enabled Analytics in your project, add the Firebase SDK for Google Analytics

// Add Firebase products that you want to use
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOYodRUdnDOrnhMLhe3VPQOk22-z9yxJQ",
  authDomain: "devfinance-ms.firebaseapp.com",
  projectId: "devfinance-ms",
  storageBucket: "devfinance-ms.appspot.com",
  messagingSenderId: "585011655116",
  appId: "1:585011655116:web:170c466afc9e21bd4e6d69",
};

// Initialize Firebase
initializeApp(firebaseConfig);
const auth = getAuth();

async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(auth, provider);

  if (result.user) {
    const { uid, displayName, photoURL } = result.user;

    if (!displayName || !photoURL) {
      throw new Error("Missing information from Google Account");
    }
  }
}

export const Firebase = {
  auth,
  user: null,
  onAuthStateChanged,
  signInWithGoogle,
  signOut,
};
