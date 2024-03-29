import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";

import {
  get,
  getDatabase,
  onValue,
  orderByKey,
  push,
  query,
  ref,
  remove,
  set,
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";

import {
  getMessaging,
  getToken,
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-fA6xj7NchB2Fe2dg8-3deei5MtrnMCI",
  authDomain: "myfinances-ms.firebaseapp.com",
  databaseURL: "https://myfinances-ms-default-rtdb.firebaseio.com",
  projectId: "myfinances-ms",
  storageBucket: "myfinances-ms.appspot.com",
  messagingSenderId: "719666390437",
  appId: "1:719666390437:web:b7f3e43dcf68da7566744c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase();
const messaging = getMessaging(app);

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
  const transactionsPath = getTransactionsPath(transaction);
  const transactionsRef = ref(database, transactionsPath);

  set(push(transactionsRef), transaction);
}

async function updateTransaction(transaction) {
  const transactionsPath = getTransactionsPath(transaction);
  const transactionPath = `${transactionsPath}/${transaction.id}`;
  const transactionRef = ref(database, transactionPath);

  set(transactionRef, transaction);
}

function getTransactionsPath(transaction) {
  const userId = auth.currentUser.uid;
  const dateSplitted = String(transaction.date).split("/");
  const month = dateSplitted[1];
  const year = dateSplitted[2];
  const path = `transactions/${userId}/${year}${month}`;

  return path;
}

async function removeTransaction(transaction) {
  const userId = auth.currentUser.uid;
  const dateSplitted = String(transaction.date).split("/");
  const month = dateSplitted[1];
  const year = dateSplitted[2];
  const path = `transactions/${userId}/${year}${month}/${transaction.id}`;

  const transactionRef = ref(database, path);

  remove(transactionRef);
}

async function getMonthList() {
  const userId = auth.currentUser.uid;
  const path = `transactions/${userId}`;

  const userTransactionsRef = ref(database, path);
  const monthsSnapshot = await get(query(userTransactionsRef, orderByKey()));
  const monthList = [];
  monthsSnapshot.forEach((childSnapshot) => {
    const childKey = childSnapshot.key;
    monthList.push(childKey);
  });

  return monthList;
}

async function changeTransactionCheck(transaction, checked) {
  const userId = auth.currentUser.uid;
  const dateSplitted = String(transaction.date).split("/");
  const month = dateSplitted[1];
  const year = dateSplitted[2];
  const path = `transactions/${userId}/${year}${month}/${transaction.id}/checked`;

  const checkRef = ref(database, path);

  set(checkRef, checked);
}

function onTransactionsChange(month, callback) {
  const userId = auth.currentUser.uid;
  const transactionsRef = ref(database, `transactions/${userId}/${month}`);

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

        const dateSplittedA = String(a.date).split("/");
        const dayA = dateSplittedA[0];
        const monthA = dateSplittedA[1];
        const yearA = dateSplittedA[2];
        const dateA = new Date(yearA, monthA, dayA);

        const dateSplittedB = String(b.date).split("/");
        const dayB = dateSplittedB[0];
        const monthB = dateSplittedB[1];
        const yearB = dateSplittedB[2];
        const dateB = new Date(yearB, monthB, dayB);

        return dateA < dateB ? -1 : 1;
      });
      callback(transactions);
    },
    {
      onlyOnce: false,
    }
  );
}

async function getMessagingToken() {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.info("Notification permission not granted.");
    return;
  }

  console.info("Notification permission granted.");

  try {
    const currentToken = await getToken(messaging, {
      vapidKey:
        "BNIBQHE291FTfKOCsrnf5IzsDF6HE4Tad5IYgjQ14-8NNK6xQzdVfl8DGzg0nQBRGB7HUQwJgPMMS6QvZDoktpk",
    });

    addNotificationToken(currentToken);
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
  }
}

async function addNotificationToken(token) {
  const tokenIsAlreadySaved = await checkIfNotificationTokenIsSaved(token);
  if (tokenIsAlreadySaved) return;

  const userId = auth.currentUser.uid;
  const path = `notification_tokens/${userId}/`;
  const notificationTokensRef = ref(database, path);

  set(push(notificationTokensRef), token);
}

async function checkIfNotificationTokenIsSaved(token) {
  const userId = auth.currentUser.uid;
  const path = `notification_tokens/${userId}/`;
  const notificationTokensRef = ref(database, path);

  const tokensSnapshot = await get(notificationTokensRef);

  let isSaved = false;
  tokensSnapshot.forEach((childSnapshot) => {
    const value = childSnapshot.val();

    if (token === value) {
      isSaved = true;
      return;
    }
  });

  return isSaved;
}

export const Firebase = {
  auth,
  user: null,
  onAuthStateChanged,
  signInWithGoogle,
  signOut,
  addTransaction,
  updateTransaction,
  removeTransaction,
  onTransactionsChange,
  getMonthList,
  changeTransactionCheck,
  getMessagingToken,
};
