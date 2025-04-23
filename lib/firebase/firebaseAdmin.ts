import * as admin from "firebase-admin";


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    // databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,

  });
}

export { admin };

export const FieldValue = admin.firestore.FieldValue;
export const auth = admin.auth();
export const firestore = admin.firestore();
export const realtimeDB = admin.database(); 
