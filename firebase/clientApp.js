// // firebase/clientApp.js
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyA2a7UquW_E1aOsOV4_PbCPRJGYfcEZJvg",
//   authDomain: "rate-my-prof-89395.firebaseapp.com",
//   projectId: "rate-my-prof-89395",
//   storageBucket: "rate-my-prof-89395.appspot.com",
//   messagingSenderId: "220658571409",
//   appId: "1:220658571409:web:87dc4ab3228dde2bb80730",
//   measurementId: "G-MGVLJ31E23"
// };

// async function addRecommendation(teacherName, recommendation, rating) {
//     try {
//       const docRef = await addDoc(collection(db, "recommendations"), {
//         teacherName: teacherName,
//         recommendation: recommendation,
//         rating: rating,
//         timestamp: new Date()
//       });
//       console.log("Document written with ID: ", docRef.id);
//     } catch (e) {
//       console.error("Error adding document: ", e);
//     }
//   }

//   async function getRecommendations() {
//     const recommendationsArray = [];
//     const querySnapshot = await getDocs(collection(db, "recommendations"));
//     querySnapshot.forEach((doc) => {
//       recommendationsArray.push({ id: doc.id, ...doc.data() });
//     });
//     return recommendationsArray;
//   }

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// export { db };

// firebase/clientApp.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2a7UquW_E1aOsOV4_PbCPRJGYfcEZJvg",
  authDomain: "rate-my-prof-89395.firebaseapp.com",
  projectId: "rate-my-prof-89395",
  storageBucket: "rate-my-prof-89395.appspot.com",
  messagingSenderId: "220658571409",
  appId: "1:220658571409:web:87dc4ab3228dde2bb80730",
  measurementId: "G-MGVLJ31E23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addRecommendation(teacherName, recommendation, rating) {
  try {
    const docRef = await addDoc(collection(db, "recommendations"), {
      teacherName: teacherName,
      recommendation: recommendation,
      rating: rating,
      timestamp: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}

async function getRecommendations() {
  const recommendationsArray = [];
  try {
    const querySnapshot = await getDocs(collection(db, "recommendations"));
    querySnapshot.forEach((doc) => {
      recommendationsArray.push({ id: doc.id, ...doc.data() });
    });
    return recommendationsArray;
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw e;
  }
}

export { db, addRecommendation, getRecommendations };