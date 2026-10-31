import jwt from "jsonwebtoken";
import { admin } from "../lib/firebase.js";

function authorize(req) {
  const match = (req.headers.cookie || "").match(/fb_admin=([^;]+)/);
  if (!match || !process.env.JWT_SECRET) throw new Error("unauthorized");
  try { jwt.verify(match[1], process.env.JWT_SECRET); }
  catch { throw new Error("unauthorized"); }
}

export default async function handler(req, res) {
  try {
    authorize(req);
    if (req.method !== "GET") return res.status(405).json({ error: "method not allowed" });
    if (!process.env.FIREBASE_DATABASE_URL) return res.status(400).json({ error: "FIREBASE_DATABASE_URL is not configured" });
    const path = String(req.query.path || "/").trim();
    if (path.split("/").includes("..")) return res.status(400).json({ error: "invalid path" });
    const snap = await admin.database().ref(path || "/").get();
    return res.json({ path: path || "/", exists: snap.exists(), value: snap.val() });
  } catch (e) {
    if (e.message === "unauthorized") return res.status(401).json({ error: "unauthorized" });
    return res.status(500).json({ error: e.message });
  }
}
