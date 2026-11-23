# Demo Accounts

After running the seed (`npm run seed` inside `backend/`, or `docker-compose exec -e ALLOW_DEMO_SEED=true backend npm run seed`), you can log in with any of these accounts.

> ⚠️ These are **sample credentials only** and their passwords are public. The seed script refuses to run when `NODE_ENV=production` unless you pass `ALLOW_DEMO_SEED=true`, so never set that on a real deployment.

| Role | Email | Password |
|---|---|---|
| 👨‍💼 Admin | `admin@example.com` | `admin123` |
| 👤 Individual | `user@example.com` | `user123` |
| 🏢 Business (EcoBrand Inc.) | `brand@example.com` | `business123` |
| ♻️ Recycler (Green Recycling Co.) | `recycler@example.com` | `recycler123` |

**Login URL (local):** http://localhost:3000/login

> 💡 If reCAPTCHA is enabled locally, check the "I'm not a robot" box before submitting.
