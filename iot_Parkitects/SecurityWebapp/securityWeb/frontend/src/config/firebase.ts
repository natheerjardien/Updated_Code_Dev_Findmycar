// Import functions that are needed 
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDbL55frdOhcMZPmW3HiUFhBb7AWbj6Nwg",
  authDomain: "wil-smartparking.firebaseapp.com",
  databaseURL: "https://wil-smartparking-default-rtdb.firebaseio.com",
  projectId: "wil-smartparking",
  storageBucket: "wil-smartparking.firebasestorage.app",
  messagingSenderId: "206377666582",
  appId: "1:206377666582:web:8818cc73ac003db1644d37",
  measurementId: "G-G45GVS51JP"
};

// We use const to initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

/* Reference list:
Expo, 2026. Using Firebase. [source code]. Available: <https://docs.expo.dev/guides/using-firebase/> [Accessed 30 August 2026].
Firebase, 2026. Get Started with Firebase Authentication in React Native. [source code]. Available: <https://firebase.google.com/docs/auth/web/start> [Accessed 30 August 2026].

*/