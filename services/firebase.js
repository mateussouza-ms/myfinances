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
  apiKey: "AIzaSyD-fA6xj7NchB2Fe2dg8-3deei5MtrnMCI",
  authDomain: "myfinances-ms.firebaseapp.com",
  projectId: "myfinances-ms",
  storageBucket: "myfinances-ms.appspot.com",
  messagingSenderId: "719666390437",
  appId: "1:719666390437:web:b7f3e43dcf68da7566744c",
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
