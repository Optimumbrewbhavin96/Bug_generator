// Vercel Serverless Function — runs on the server, not the browser.
// OpenAI's API does not send CORS headers for browser requests, so a
// direct fetch() from the page to api.openai.com is silently blocked.
// This function receives the request from the page, calls OpenAI
// server-side (no CORS restriction applies to server-to-server calls),
// and returns the result back to the page.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { key, model, sys, content } = req.body || {};
  if (!key) {
    res.status(400).json({ error: 'Missing API key' });
    return;
  }
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: sys || '' },
          { role: 'user', content: content || '' }
        ]
      })
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
