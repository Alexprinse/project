// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8q3UtPg38psrBEQRF6U98XO60vydbUPU",
  authDomain: "campus-event-cfe80.firebaseapp.com",
  projectId: "campus-event-cfe80",
  storageBucket: "campus-event-cfe80.firebasestorage.app",
  messagingSenderId: "442343786099",
  appId: "1:442343786099:web:884ec77ecda05d7e448c06",
  measurementId: "G-TNNP393Q2K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth ,db };