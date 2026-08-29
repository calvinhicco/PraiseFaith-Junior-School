export const FIREBASE_WEB_CONFIG = {
  apiKey: "AIzaSyBCpajdj01oLa4HRalaUpo2ODOvyI2rqfM",
  authDomain: "praisefaith-junior-school.firebaseapp.com",
  projectId: "praisefaith-junior-school",
  storageBucket: "praisefaith-junior-school.firebasestorage.app",
  messagingSenderId: "95874105499",
  appId: "1:95874105499:web:589ff457a9302eb41ec63e",
  measurementId: "G-THV8L2GVQS",
} as const

export function getFirebaseWebConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FIREBASE_WEB_CONFIG.apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FIREBASE_WEB_CONFIG.authDomain,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FIREBASE_WEB_CONFIG.projectId,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FIREBASE_WEB_CONFIG.storageBucket,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FIREBASE_WEB_CONFIG.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FIREBASE_WEB_CONFIG.appId,
    measurementId:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || FIREBASE_WEB_CONFIG.measurementId,
  }
}
