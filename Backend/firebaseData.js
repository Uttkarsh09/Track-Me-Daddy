// import { initializeApp } from 'firebase/app';

// // TODO: Replace the following with your app's Firebase project configuration

// const firebaseApp = initializeApp(firebaseConfig);
// export const db = getFirestore(firebaseApp);
const firebaseConfig = {
    apiKey: "your_firebase_api_key",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export default db;
