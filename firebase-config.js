// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-y7bxhgRQd2tBZhzw-jpCDqwOzjRn6ZE",
  authDomain: "fleuranails.firebaseapp.com",
  projectId: "fleuranails",
  storageBucket: "fleuranails.firebasestorage.app",
  messagingSenderId: "1037259204106",
  appId: "1:1037259204106:web:4ae669478367795063a1f3",
  measurementId: "G-5MWKVSGTQV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.log("Firebase Analytics Initialized");
