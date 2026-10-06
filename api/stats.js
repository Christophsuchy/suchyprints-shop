// Vercel Serverless Function: Wartelisten-Zahlen aus Brevo fürs Dashboard (nur eingeloggt).
export default async function handler(req, res) {
  const { SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, BREVO_LIST_ID } = process.env;
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://opsbjglkegoyoeqmpxxa.supabase.co";
  if (!SUPABASE_SERVICE_ROLE_KEY || !BREVO_API_KEY) return res.status(500).json({ error: "not_configured" });
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "unauthorized" });
  const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` } });
  if (!who.ok) return res.status(401).json({ error: "unauthorized" });

  try {
    const all = [];
    for (let offset = 0; offset < 500; offset += 50) {
      const r = await fetch(`https://api.brevo.com/v3/contacts/lists?limit=50&offset=${offset}`, { headers: { "api-key": BREVO_API_KEY, accept: "application/json" } });
      if (!r.ok) throw new Error("brevo " + r.status);
      const lists = (await r.json()).lists || [];
      all.push(...lists);
      if (lists.length < 50) break;
    }
    const count = (l) => Number(l.uniqueSubscribers ?? l.totalSubscribers ?? 0);
    const main = all.find((l) => String(l.id) === String(BREVO_LIST_ID));
    const products = all
      .map((l) => ({ l, m: String(l.name).match(/^Produkt: (.*) \((p\d+)\)$/) }))
      .filter((x) => x.m)
      .map(({ l, m }) => ({ productId: m[2], name: m[1], subscribers: count(l) }))
      .sort((a, b) => b.subscribers - a.subscribers);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ newsletter: main ? count(main) : null, products });
  } catch (err) {
    console.error("Stats fehlgeschlagen", err);
    return res.status(502).json({ error: "brevo_error" });
  }
}
