import jwt from "jsonwebtoken";
import { db } from "../../lib/firebase.js";

function authorize(req) {
  const match = (req.headers.cookie || "").match(/fb_admin=([^;]+)/);
  if (!match || !process.env.JWT_SECRET) throw new Error("unauthorized");
  try { jwt.verify(match[1], process.env.JWT_SECRET); }
  catch { throw new Error("unauthorized"); }
}
function clean(value) {
  if (value === null || value === undefined) return value;
  if (value && typeof value.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(clean);
  if (typeof value === "object") {
    if (value.path && value.firestore) return { _type: "reference", path: value.path };
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v)]));
  }
  return value;
}

export default async function handler(req, res) {
  try {
    authorize(req);
    if (req.method !== "GET") return res.status(405).json({ error: "method not allowed" });
    const path = String(req.query.collection || "").trim().replace(/^\/+|\/+$/g, "");
    if (!path || path.split("/").length % 2 !== 1) return res.status(400).json({ error: "valid collection path is required" });
    const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10) || 50, 1), 100);
    const after = String(req.query.after || "");
    let query = db.collection(path).orderBy("__name__").limit(limit);
    if (after) query = query.startAfter(db.collection(path).doc(after));
    const snap = await query.get();
    const docs = snap.docs.map(d => ({ id: d.id, path: d.ref.path, data: clean(d.data()) }));
    return res.json({ documents: docs, nextCursor: snap.size === limit ? snap.docs[snap.docs.length - 1].id : null });
  } catch (e) {
    if (e.message === "unauthorized") return res.status(401).json({ error: "unauthorized" });
    return res.status(500).json({ error: e.message });
  }
}
