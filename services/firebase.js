import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";

import {
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-fA6xj7NchB2Fe2dg8-3deei5MtrnMCI",
  authDomain: "myfinances-ms.firebaseapp.com",
  projectId: "myfinances-ms",
  storageBucket: "myfinances-ms.appspot.com",
  messagingSenderId: "719666390437",
  appId: "1:719666390437:web:b7f3e43dcf68da7566744c",
};

initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase();

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

async function addTransaction(transaction) {
  const userId = auth.currentUser.uid;
  const transactionsRef = ref(database, userId);

  set(push(transactionsRef), transaction);
}

async function removeTransaction(transactionId) {
  const userId = auth.currentUser.uid;
  const transactionRef = ref(database, userId + "/" + transactionId);

  remove(transactionRef);
}

function onTransactionsChange(callback) {
  const userId = auth.currentUser.uid;
  const transactionsRef = ref(database, userId);

  onValue(
    transactionsRef,
    (snapshot) => {
      let transactions = [];
      snapshot.forEach((childSnapshot) => {
        const childKey = childSnapshot.key;
        const childData = childSnapshot.val();
        transactions.push({ ...childData, id: childKey });
      });
      transactions = transactions.sort((a, b) => {
        if (a.date == b.date) {
          return 0;
        }

        return a.date < b.date ? -1 : 1;
      });
      callback(transactions);
    },
    {
      onlyOnce: false,
    }
  );
}

export const Firebase = {
  auth,
  user: null,
  onAuthStateChanged,
  signInWithGoogle,
  signOut,
  addTransaction,
  removeTransaction,
  onTransactionsChange,
};
