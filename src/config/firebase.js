// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBil6IXXsVm7Pbcs3CiXEZPUvTHvHwEUrE",
  authDomain: "studyplancopilot.firebaseapp.com",
  projectId: "studyplancopilot",
  storageBucket: "studyplancopilot.firebasestorage.app",
  messagingSenderId: "114914648208",
  appId: "1:114914648208:web:dd0ea174d6f30f42717815",
  measurementId: "G-ZD40K7L5NV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
