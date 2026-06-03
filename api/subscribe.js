export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { email } = req.body || {};
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
  let BEEHIIV_PUB_ID = process.env.BEEHIIV_PUB_ID;
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUB_ID) {
    return res.status(500).json({ error: 'Missing env vars', details: { hasKey: !!BEEHIIV_API_KEY, hasPub: !!BEEHIIV_PUB_ID } });
  }
  // Ensure pub_ prefix
  if (!BEEHIIV_PUB_ID.startsWith('pub_')) {
    BEEHIIV_PUB_ID = 'pub_' + BEEHIIV_PUB_ID;
  }
  try {
    const apiUrl = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: 'overthinking_app',
        utm_medium: 'web_app',
      }),
    });
    const data = await response.json();
    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({
        error: 'Subscription failed',
        status: response.status,
        beehiiv: data,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to subscribe', message: error.message });
  }
}
