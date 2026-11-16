import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import webConfig from "../../firebase-applet-config.json";

// The browser only uses Firebase for sign-in. All data goes through the
// Smart Growth Bot server, which checks who you are on every request.
const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || webConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || webConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || webConfig.projectId,
  appId: env.VITE_FIREBASE_APP_ID || webConfig.appId,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || webConfig.messagingSenderId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || webConfig.storageBucket,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Local development only: point sign-in at the Firebase Auth emulator.
if (env.VITE_FIREBASE_AUTH_EMULATOR) connectAuthEmulator(auth, env.VITE_FIREBASE_AUTH_EMULATOR, { disableWarnings: true });
export default app;
