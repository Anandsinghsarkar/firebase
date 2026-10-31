import jwt from "jsonwebtoken";
import { db } from "../../lib/firebase.js";

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
    const parent = String(req.query.parent || "").trim();
    let collections;
    if (parent) {
      const doc = db.doc(parent);
      collections = await doc.listCollections();
    } else {
      collections = await db.listCollections();
    }
    return res.json({ collections: collections.map(c => ({ id: c.id, path: c.path })) });
  } catch (e) {
    if (e.message === "unauthorized") return res.status(401).json({ error: "unauthorized" });
    return res.status(500).json({ error: e.message });
  }
}
