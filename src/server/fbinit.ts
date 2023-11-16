// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSHUial1tXECfUOaEPXyJyBAKWBeQACUM",
  authDomain: "chattest-9fd71.firebaseapp.com",
  databaseURL: "https://chattest-9fd71.firebaseio.com",
  projectId: "chattest-9fd71",
  storageBucket: "chattest-9fd71.appspot.com",
  messagingSenderId: "251684571237",
  appId: "1:251684571237:web:91acee0c1a8ff24d895e8c",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const db = getDatabase(app)
const auth = getAuth(app)
export { db, auth }
