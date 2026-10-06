// Vercel Cron Job: fragt einmal täglich kurz die Datenbank ab, damit Supabase (Gratis-Tarif)
// das Projekt nicht wegen Inaktivität pausiert. Gibt keine Daten zurück.
export default async function handler(req, res) {
  const { SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://opsbjglkegoyoeqmpxxa.supabase.co";
  if (!SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: "not_configured" });
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=id&limit=1`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, at: new Date().toISOString() });
  } catch (err) {
    console.error("Keepalive fehlgeschlagen", err);
    return res.status(502).json({ ok: false });
  }
}
