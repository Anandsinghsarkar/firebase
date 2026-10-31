import jwt from "jsonwebtoken";
import { usersCol, refcodesCol, db } from "../lib/firebase.js";

function auth(req) {
  const cookie = req.headers.cookie || "";
  const m = cookie.match(/fb_admin=([^;]+)/);
  if (!m) throw new Error("unauthorized");
  try {
    jwt.verify(m[1], process.env.JWT_SECRET);
  } catch {
    throw new Error("unauthorized");
  }
}

export default async function handler(req, res) {
  try {
    auth(req);
    const q = String(req.query.q || "").trim();
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const orderBy = req.query.orderBy || "created_at";

    if (q) {
      if (/^\d+$/.test(q)) {
        const snap = await usersCol().doc(q).get();
        if (snap.exists) {
          return res.json({ users: [{ ...snap.data(), user_id: Number(q) }] });
        }
      }
      const ref = await refcodesCol().doc(q.toUpperCase()).get();
      if (ref.exists) {
        const uid = String(ref.data().user_id);
        const u = await usersCol().doc(uid).get();
        if (u.exists) {
          return res.json({ users: [{ ...u.data(), user_id: Number(uid) }] });
        }
      }
      const byName = await usersCol().where("username", "==", q.replace(/^@/, "")).limit(20).get();
      if (!byName.empty) {
        return res.json({ users: byName.docs.map(d => ({ ...d.data(), user_id: Number(d.id) })) });
      }
      return res.json({ users: [] });
    }

    // no search — fetch all, sort, slice
    const snap = await usersCol().limit(500).get();
    let users = snap.docs.map(d => ({ ...d.data(), user_id: Number(d.id) }));
    users.sort((a, b) => (b[orderBy] || 0) - (a[orderBy] || 0));
    users = users.slice(0, limit);
    res.json({ users });
  } catch (e) {
    if (e.message === "unauthorized") return res.status(401).json({ error: "unauthorized" });
    res.status(500).json({ error: e.message });
  }
}