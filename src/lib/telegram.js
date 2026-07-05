/**
 * src/lib/telegram.js
 *
 * Two responsibilities:
 *  1. getDashboardImage() — fetch the pinned photo from the channel (menu display)
 *  2. sendOrder()         — post an order notification to the channel
 *
 * DASHBOARD IMAGE
 * ───────────────
 * Post a photo in the channel and pin it. getDashboardImage() always reads
 * getChat().pinned_message — not a consumed queue, always available.
 * To update the menu: pin a new photo.
 *
 * BOT SETUP (one-time)
 * ────────────────────
 * 1. @BotFather → /newbot → copy token → REACT_APP_TELEGRAM_BOT_TOKEN
 * 2. Create a private channel
 * 3. Add the bot as Admin (Post Messages + Pin Messages)
 * 4. Forward any channel message to @userinfobot → copy the id
 *    (e.g. -1001234567890) → REACT_APP_TELEGRAM_CHANNEL_ID
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

  // photo[] is sorted smallest → largest; always use the last (highest res)
  const fileId   = pinnedMsg.photo[pinnedMsg.photo.length - 1].file_id;
  const fileInfo = await tgGet("getFile", { file_id: fileId });
  return `https://api.telegram.org/file/bot${token()}/${fileInfo.file_path}`;
}

/**
 * Send a new food order to the Telegram channel.
 *
 * @param {{ name: string, email: string, food: string, pin: string }} order
 */
export async function sendOrder({ name, email, food, pin }) {
  const now  = new Date();
  const time = now.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const text = [
    "🍽️ *New Food Order*",
    "",
    `👤 *Name:*  ${name}`,
    `📧 *Email:* ${email}`,
    `🥘 *Food:*  ${food}`,
    `🔑 *PIN:*   ${pin}`,
    `🕐 *Time:*  ${time}`,
  ].join("\n");

  await tgPost("sendMessage", {
    chat_id:    channelId(),
    text,
    parse_mode: "Markdown",
  });
}
