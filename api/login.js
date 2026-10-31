import jwt from "jsonwebtoken";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { key } = req.body || {};
  const expected = process.env.ADMIN_KEY;
  const secret = process.env.JWT_SECRET;

  if (!expected || !secret) {
    return res.status(500).json({ error: "server not configured" });
  }
  if (!key || key !== expected) {
    return res.status(401).json({ error: "Invalid key" });
  }

  const token = jwt.sign({ role: "admin" }, secret, { expiresIn: "7d" });
  res.setHeader(
    "Set-Cookie",
    `fb_admin=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`
  );
  res.json({ ok: true });
}