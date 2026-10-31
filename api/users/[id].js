import jwt from "jsonwebtoken";
import { usersCol } from "../../lib/firebase.js";

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
    const { id } = req.query;
    const ref = usersCol().doc(String(id));

    if (req.method === "GET") {
      const snap = await ref.get();
      if (!snap.exists) return res.status(404).json({ error: "not found" });
      return res.json({ ...snap.data(), user_id: Number(id) });
    }

    if (req.method === "PATCH") {
      const body = req.body || {};
      const patch = {};
      if ("credits" in body && Number.isInteger(body.credits)) patch.credits = body.credits;
      if ("banned" in body) patch.banned = !!body.banned;
      if (!Object.keys(patch).length) return res.status(400).json({ error: "no valid fields" });
      await ref.update(patch);
      const snap = await ref.get();
      return res.json({ ...snap.data(), user_id: Number(id) });
    }

    res.status(405).end();
  } catch (e) {
    if (e.message === "unauthorized") return res.status(401).json({ error: "unauthorized" });
    res.status(500).json({ error: e.message });
  }
}