# Staff Menu Portal

React · Tailwind CSS · Telegram

No accounts, no auth. Staff open the page, see today's menu image, fill in
their name / email / food choice / reference PIN, and submit. The order is
sent directly to a Telegram channel. They see a success confirmation.

---

## Setup

```bash
npm install
cp .env.example .env   # add your two Telegram values
npm start
```

---

## Telegram setup (one-time)

**1. Create a bot**
```
@BotFather → /newbot → copy the token
```

**2. Create a private channel**
```
New Channel → Private
Add the bot as Admin (Post Messages + Pin Messages permissions)
Forward any channel message to @userinfobot → copy the id (e.g. -1001234567890)
```

**3. Add to `.env`**
```
REACT_APP_TELEGRAM_BOT_TOKEN=your_bot_token
REACT_APP_TELEGRAM_CHANNEL_ID=-1001234567890
```

---

## Setting the menu image

1. Post any food menu photo in the channel
2. Long-press it → **Pin Message**
3. The app displays it automatically

To update the menu — pin a new photo.

---

## How orders arrive in Telegram

When a staff member submits their order, the bot posts this to the channel:

```
🍽️ New Food Order

👤 Name:  Ada Okonkwo
📧 Email: ada@company.com
🥘 Food:  Jollof Rice + Chicken
🔑 PIN:   1234
🕐 Time:  12 Jun 2025, 12:30
```

---

## Deploy to Vercel

1. Push to GitHub (`.env` is gitignored)
2. Vercel → New Project → import repo
3. Framework: **Create React App**
4. Add `REACT_APP_TELEGRAM_BOT_TOKEN` and `REACT_APP_TELEGRAM_CHANNEL_ID`
5. Deploy

`vercel.json` handles SPA routing.

---

## Project structure

```
src/
├── lib/
│   └── telegram.js     # getDashboardImage(), sendOrder()
└── pages/
    └── MenuPage.jsx    # menu image + order form + success screen
```
