# ♻️ ReBox

> **Turn packaging waste into rewards.** An open-source marketplace that connects households, businesses, and recyclers — built for communities, colleges, and small ecosystems that want to run their own circular economy.

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A518-339933?logo=node.js&logoColor=white" alt="Node 18+">
  <img src="https://img.shields.io/badge/postgres-15-4169E1?logo=postgresql&logoColor=white" alt="Postgres 15">
  <img src="https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=white" alt="React 18">
  <img src="https://img.shields.io/badge/PRs-welcome-blueviolet.svg" alt="PRs Welcome">
</p>

<!-- Add hero screenshot here → docs/images/hero.png -->
<!-- <p align="center"><img src="docs/images/hero.png" alt="ReBox dashboard" width="820"></p> -->

---

## Why ReBox?

Reusable packaging never reaches the people who could reuse it because there's no coordination layer. ReBox is that layer — a full-stack platform any campus sustainability club, coworking space, or neighborhood association can self-host in an afternoon.

- 🏫 **Built for small ecosystems** — colleges, coworking hubs, apartment complexes, farmers' markets.
- 💸 **Zero SaaS lock-in** — MIT licensed, deploy on a $5 VPS, own your data.
- 🌱 **Impact-first** — every transaction tracks CO₂, water, and waste diverted.
- 🧩 **Batteries included** — auth, rewards, marketplace, notifications, admin.

---

## ✨ Features

<table>
<tr>
<td width="33%" valign="top">

**👤 For Individuals**
- List boxes, bottles, containers
- Schedule pickups in a click
- Earn points redeemable for cash / gift cards
- Track personal CO₂ & water saved
- Bronze → Diamond reward tiers

</td>
<td width="33%" valign="top">

**🏢 For Businesses / Brands**
- Buyback marketplace for clean packaging
- Bid on user-listed items
- Sustainability & ESG reports
- Bulk offers
- Verified brand profiles

</td>
<td width="33%" valign="top">

**♻️ For Recyclers**
- Claim nearby pickups
- Route optimization
- Performance dashboard
- Impact leaderboard
- Real-time notifications

</td>
</tr>
</table>

---

## 🚀 Quickstart

The fastest path — one command, full stack running locally:

```bash
git clone https://github.com/Elactrac/rebox.git
cd rebox
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env   # one-time: generate a signing secret
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
docker-compose exec -e ALLOW_DEMO_SEED=true backend npm run seed   # optional demo accounts
```

Then open **http://localhost:3000** and log in with a demo account from [docs/DEMO_ACCOUNTS.md](docs/DEMO_ACCOUNTS.md).

<details>
<summary><b>Manual setup (no Docker)</b></summary>

**Prereqs:** Node 18+, PostgreSQL 15+, npm.

```bash
# Backend
cd backend
cp .env.example .env      # then edit DATABASE_URL + JWT_SECRET
npm install
npx prisma migrate dev
npm run seed
npm run dev               # → http://localhost:5001

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm start                 # → http://localhost:3000
```

</details>

---

## 🧱 Tech Stack

| Layer | Tools |
|---|---|
| **Frontend** | React 18, React Router 6, Tailwind CSS, Recharts, Lucide, React Hot Toast |
| **Backend** | Node.js, Express, Prisma, PostgreSQL, JWT, bcrypt, Nodemailer |
| **Realtime** | Socket.IO |
| **Optional** | Redis cache, Web Push (VAPID), Google OAuth, reCAPTCHA, Gemini AI |
| **Deploy** | Docker Compose, Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
rebox/
├── backend/          Express + Prisma API
│   ├── src/          routes, controllers, middleware, services
│   ├── prisma/       schema + seed
│   └── tests/
├── frontend/         React 18 SPA
│   └── src/          pages, components, context, hooks, services
├── docs/             self-hosting, architecture, demo accounts
└── docker-compose.yml
```

---

## 🌍 Deploy

| Target | Notes |
|---|---|
| **Docker Compose** | Simplest — one host, one command. See [docs/SELF_HOSTING.md](docs/SELF_HOSTING.md). |
| **Vercel + Render** | Frontend on Vercel, backend + Postgres on Render. Config files (`vercel.json`, `render.yaml`) are already in the repo. |
| **Your own VPS** | Any Linux box with Docker installed works. |

---

## 🤝 Contributing

This is a flagship open-source project — contributions of any size are welcome, from typo fixes to whole features. Great places to start:

- 🐛 [Report a bug](../../issues/new?template=bug_report.md)
- 💡 [Suggest a feature](../../issues/new?template=feature_request.md)
- 👋 First-timer? Look for issues tagged `good first issue`.
- 📖 Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🎓 Using ReBox at your college / community?

We'd love to feature you. Open a Discussion or a PR adding your deployment to `docs/DEPLOYMENTS.md` — logo, one-line story, and a link.

---

## 📜 License

MIT — see [LICENSE](LICENSE). Use it, fork it, run it, ship it. Attribution appreciated.

---

<p align="center">Made with 🌱 by <a href="https://github.com/Elactrac">Elactrac</a> — for the people building the circular economy from the ground up.</p>
