import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyByghSOjPlzleQKEfXWyvAZ6Rj7wbKGONY",
  authDomain: "pomodoro-ynovm2.firebaseapp.com",
  projectId: "pomodoro-ynovm2",
  storageBucket: "pomodoro-ynovm2.appspot.com",
  messagingSenderId: "422187559328",
  appId: "1:422187559328:android:5b2e7282a5cb8b6eb55cc5"
};


const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app,  {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { app, auth, db };