import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
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