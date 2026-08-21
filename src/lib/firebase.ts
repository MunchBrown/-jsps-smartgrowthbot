import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfigData from "../../firebase-applet-config.json";

// Initialize Firebase app singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfigData);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
