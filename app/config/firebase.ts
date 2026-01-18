import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: User must replace this with their own config
const firebaseConfig = {
    apiKey: "AIzaSyCkJXoGuE0NLzl47ux69z8mQp4O3ATzkAA",
    authDomain: "f4ntastik4-hepsibrd-soluton-db.firebaseapp.com",
    projectId: "f4ntastik4-hepsibrd-soluton-db",
    storageBucket: "f4ntastik4-hepsibrd-soluton-db.firebasestorage.app",
    messagingSenderId: "340847024734",
    appId: "1:340847024734:web:30704b9fb143d810a5b2cf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
