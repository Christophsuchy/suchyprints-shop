// Vercel Serverless Function: Bewertungen über den persönlichen Link aus der Bestellbestätigung.
// GET  /api/review?token=…  → Vorname + bestellte Artikel (für die Bewertungsseite)
// POST /api/review { token, rating, text, name } → speichert die Bewertung (noch nicht freigegeben)
// Benötigt SUPABASE_SERVICE_ROLE_KEY (und optional SUPABASE_URL) in Vercel.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  const { SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://opsbjglkegoyoeqmpxxa.supabase.co";
  if (!SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: "not_configured" });
  const headers = { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json" };

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const token = String((req.method === "GET" ? req.query?.token : body?.token) || "").trim();
  if (!UUID_RE.test(token)) return res.status(400).json({ error: "invalid_token" });

  try {
    const oq = new URLSearchParams({ select: "id,customer_name,items", review_token: `eq.${token}`, limit: "1" });
    const or = await fetch(`${SUPABASE_URL}/rest/v1/orders?${oq}`, { headers });
    if (!or.ok) return res.status(502).json({ error: "db_error" });
    const [order] = await or.json();
    if (!order) return res.status(404).json({ error: "not_found" });

    const rq = new URLSearchParams({ select: "id", order_id: `eq.${order.id}`, limit: "1" });
    const rr = await fetch(`${SUPABASE_URL}/rest/v1/reviews?${rq}`, { headers });
    const already = rr.ok ? (await rr.json()).length > 0 : false;

    if (req.method === "GET") {
      const items = (Array.isArray(order.items) ? order.items : [])
        .map((i) => String(i.name || ""))
        .filter((n) => n && !n.startsWith("Versand"));
      const firstName = String(order.customer_name || "").trim().split(/\s+/)[0] || "";
      return res.status(200).json({ firstName, items, alreadyReviewed: already });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
    if (already) return res.status(409).json({ error: "already_reviewed" });
    const rating = Number(body?.rating);
    const text = String(body?.text || "").trim().slice(0, 1000);
    const name = String(body?.name || "").trim().slice(0, 60);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: "invalid_rating" });
    if (text.length < 3) return res.status(400).json({ error: "text_too_short" });

    // Optionales Foto (im Browser schon auf max. 1200 px als JPEG verkleinert)
    let photoUrl = null;
    if (body?.photo) {
      const buf = Buffer.from(String(body.photo), "base64");
      const isJpeg = buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
      if (!isJpeg || buf.length > 2 * 1024 * 1024) return res.status(400).json({ error: "invalid_photo" });
      const path = `${order.id}.jpg`;
      const up = await fetch(`${SUPABASE_URL}/storage/v1/object/review-photos/${path}`, {
        method: "POST",
        headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "image/jpeg", "x-upsert": "true" },
        body: buf,
      });
      if (!up.ok) {
        console.error("Foto-Upload fehlgeschlagen", up.status, await up.text());
        return res.status(502).json({ error: "photo_upload_failed" });
      }
      photoUrl = `${SUPABASE_URL}/storage/v1/object/public/review-photos/${path}`;
    }

    const ins = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ order_id: order.id, rating, text, customer_name: name || null, approved: false, ...(photoUrl ? { photo_url: photoUrl } : {}) }),
    });
    if (!ins.ok) {
      const detail = await ins.text();
      console.error("Bewertung speichern fehlgeschlagen", ins.status, detail);
      if (ins.status === 409) return res.status(409).json({ error: "already_reviewed" });
      return res.status(502).json({ error: "db_error" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Bewertung fehlgeschlagen", err);
    return res.status(502).json({ error: "unexpected" });
  }
}
