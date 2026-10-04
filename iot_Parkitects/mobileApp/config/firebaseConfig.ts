// importing the core firebase app initializer (Expo, 2026).
import { initializeApp, getApps } from 'firebase/app';
// pulling in just the auth module so we dont bloat the app size (Firebase, 2026).
import { getAuth, initializeAuth } from 'firebase/auth'; 
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDbL55frdOhcMZPmW3HiUFhBb7AWbj6Nwg",
  authDomain: "wil-smartparking.firebaseapp.com",
  databaseURL: "https://wil-smartparking-default-rtdb.firebaseio.com",
  projectId: "wil-smartparking",
  storageBucket: "wil-smartparking.firebasestorage.app",
  messagingSenderId: "206377666582",
  appId: "1:206377666582:web:df1754d86802997e644d37",
  measurementId: "G-98T1959MMK"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = Platform.OS === 'web' 
  ? getAuth(app) 
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });

export { auth };

/* Reference list:

   Expo, 2026. Using Firebase. [source code]. Available: <https://docs.expo.dev/guides/using-firebase/> [Accessed 28 August 2026].

   Firebase, 2026. Get Started with Firebase Authentication in React Native. [source code]. Available: <https://firebase.google.com/docs/auth/web/start> [Accessed 28 August 2026].

*/