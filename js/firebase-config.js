// Tapis Rouge Pro - Firebase Configuration
// Firebase SDK Configuration

const firebaseConfig = {
    apiKey: "AIzaSyBrazKnGRESDhQnzs0xxlA0bvcwKr3iaTU",
    authDomain: "tapis-rouge-pro.firebaseapp.com",
    projectId: "tapis-rouge-pro",
    storageBucket: "tapis-rouge-pro.firebasestorage.app",
    messagingSenderId: "992369391262",
    appId: "1:992369391262:web:0e37b8b6c33422b3d32d8f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Export for use in other scripts
window.db = db;
