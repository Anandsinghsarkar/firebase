export default function handler(req, res) {
  res.setHeader("Set-Cookie", "fb_admin=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure");
  res.json({ ok: true });
}