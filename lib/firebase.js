import admin from "firebase-admin";

function decodeServiceAccount() {
  const b64 = process.env.FIREBASE_CREDENTIALS_B64;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (b64) return JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  if (raw) return JSON.parse(raw);
  throw new Error("FIREBASE_CREDENTIALS_B64 or FIREBASE_SERVICE_ACCOUNT_JSON is missing");
}

if (!admin.apps.length) {
  const creds = decodeServiceAccount();
  const options = { credential: admin.credential.cert(creds) };
  if (process.env.FIREBASE_DATABASE_URL) options.databaseURL = process.env.FIREBASE_DATABASE_URL;
  admin.initializeApp(options);
}

export { admin };
export const db = admin.firestore();
export const usersCol = () => db.collection("users");
export const refcodesCol = () => db.collection("refcodes");
