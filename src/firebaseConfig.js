import { initializeApp } from 'firebase/app';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp, 
    deleteDoc,
    doc,
    getDocs
} from 'firebase/firestore';

// 🚨🚨 IMPORTANT: REPLACE ALL PLACEHOLDERS WITH YOUR ACTUAL FIREBASE PROJECT KEYS 🚨🚨
const firebaseConfig = {
    apiKey: "AIzaSyCUpR7ZfDwX7F_QyDWPYkbi8CU96Hk4-xI",
    authDomain: "airforshare-aeb58.firebaseapp.com",
    projectId: "airforshare-aeb58",
    storageBucket: "airforshare-aeb58.firebasestorage.app",
    messagingSenderId: "711784264473",
    appId: "1:711784264473:web:fea61f7ff1437012354b88",
    measurementId: "G-S3F1E8V2LP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export everything needed for the UI component
export { db, collection, addDoc, serverTimestamp, deleteDoc, doc, getDocs };