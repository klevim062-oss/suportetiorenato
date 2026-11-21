/* =========================================================================
   API DE CONVERSÕES DA META (roda no servidor da Vercel, não no navegador)
   -------------------------------------------------------------------------
   O navegador chama /api/meta-event e esta função repassa o evento para a
   Meta usando o TOKEN, que fica guardado em segredo na Vercel:

     Vercel → Projeto → Settings → Environment Variables
       META_ACCESS_TOKEN     (obrigatório) token da API de Conversões
       META_PIXEL_ID         (opcional)    padrão: 2370057920494120
       META_TEST_EVENT_CODE  (opcional)    código "TEST..." do Gerenciador de
                                           Eventos, só para testar

   NUNCA coloque o token no index.html, config.js ou main.js.
   ========================================================================= */

const DEFAULT_PIXEL_ID = "2370057920494120";
const API_VERSION = process.env.META_API_VERSION || "v23.0";
const ALLOWED_EVENTS = new Set(["PageView", "ViewContent", "InitiateCheckout", "Lead"]);

function readCookie(header, name) {
    const match = (header || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[1]) : undefined;
}

function parseBody(body) {
    if (!body) return {};
    if (typeof body === "object") return body;
    try { return JSON.parse(body); } catch { return {}; }
}

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ ok: false });
    }

    const token = process.env.META_ACCESS_TOKEN;
    if (!token) return res.status(500).json({ ok: false, error: "token não configurado" });

    const body = parseBody(req.body);
    const eventName = String(body.event_name || "");
    if (!ALLOWED_EVENTS.has(eventName)) return res.status(400).json({ ok: false, error: "evento inválido" });

    const cookies = req.headers.cookie;
    const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();

    const userData = {
        client_ip_address: forwarded || req.socket?.remoteAddress,
        client_user_agent: req.headers["user-agent"]
    };
    const fbp = readCookie(cookies, "_fbp");
    const fbc = readCookie(cookies, "_fbc") || (body.fbc ? String(body.fbc).slice(0, 500) : undefined);
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    const event = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: String(body.event_id || "").slice(0, 100) || undefined,
        event_source_url: String(body.event_source_url || req.headers.referer || "").slice(0, 1000),
        action_source: "website",
        user_data: userData
    };

    const payload = { data: [event] };
    if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;

    const pixelId = process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
    const url = `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;

    try {
        const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await r.json().catch(() => ({}));
        if (!r.ok) {
            console.error("[Meta CAPI] erro", r.status, result && result.error && result.error.message);
            return res.status(502).json({ ok: false });
        }
        return res.status(200).json({ ok: true, received: result.events_received });
    } catch (err) {
        console.error("[Meta CAPI] falha de rede", err && err.message);
        return res.status(502).json({ ok: false });
    }
};
