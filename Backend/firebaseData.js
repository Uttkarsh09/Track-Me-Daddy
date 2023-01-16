// import { initializeApp } from 'firebase/app';

// // TODO: Replace the following with your app's Firebase project configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyDWpUteq2Ui3oSoDO_5LtFZKh6lvOMfRvw",
//     authDomain: "ontheroad-hackathon.firebaseapp.com",
//     databaseURL: "https://ontheroad-hackathon-default-rtdb.firebaseio.com",
//     projectId: "ontheroad-hackathon",
//     storageBucket: "ontheroad-hackathon.appspot.com",
//     messagingSenderId: "198382946882",
//     appId: "1:198382946882:web:26b1345cfb1ccb48c3fbdb",
//     measurementId: "G-T65Y6W15JV"
// };

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