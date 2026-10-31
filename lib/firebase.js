import admin from "firebase-admin";

if (!admin.apps.length) {
  const b64 = process.env.FIREBASE_CREDENTIALS_B64;
  if (!b64) throw new Error("FIREBASE_CREDENTIALS_B64 missing");
  const creds = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  admin.initializeApp({ credential: admin.credential.cert(creds) });
}

export const db = admin.firestore();
export const usersCol = () => db.collection("users");
export const refcodesCol = () => db.collection("refcodes");