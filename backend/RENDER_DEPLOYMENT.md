# ReBox Backend - Render Deployment Guide

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- Supabase database connection string

## Step 1: Push Code to GitHub

If not already done, initialize git and push your backend code:

```bash
cd /Users/keshav/Downloads/WD/rebox/backend
git init
git add .
git commit -m "Initial commit - ReBox backend"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 2: Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `rebox/backend` directory (or your backend repo)

## Step 3: Configure Web Service

### Basic Settings:
- **Name**: `rebox-backend` (or your preferred name)
- **Runtime**: `Node`
- **Build Command**: `npm install && npx prisma generate && npx prisma db push`
- **Start Command**: `npm start`
- **Plan**: Free

### Environment Variables:

Add these environment variables in Render dashboard:

#### Required:
```
DATABASE_URL=postgresql://postgres:%21sQ98932k05@db.qxowgfdreqzqtbsoeqlu.supabase.co:5432/postgres

DIRECT_URL=postgresql://postgres:%21sQ98932k05@db.qxowgfdreqzqtbsoeqlu.supabase.co:5432/postgres

JWT_SECRET=<generate-random-secret>

NODE_ENV=production

FRONTEND_URL=http://localhost:3000
```

#### Optional (Email - can configure later):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@rebox.com
```

#### Optional (OAuth - can configure later):
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

## Step 4: Deploy

1. Click "Create Web Service"
2. Render will:
   - Clone your repository
   - Run `npm install`
   - Run `npx prisma generate` (creates Prisma client)
   - Run `npx prisma db push` (creates tables in Supabase)
   - Start your server with `npm start`

3. Wait for deployment (usually 2-5 minutes)

## Step 5: Verify Deployment

Once deployed, you'll get a URL like: `https://rebox-backend.onrender.com`

Test the health endpoint:
```bash
curl https://rebox-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "ReBox API is running",
  "socketEnabled": true
}
```

## Step 6: Seed Database (Optional)

After first deployment, you can seed the database:

1. Go to Render Dashboard → Your Service → Shell
2. Run: `npm run seed`

This will create test accounts:
- Admin: admin@test.com / admin123
- User: user@test.com / user123
- Business: business@test.com / business123
- Recycler: recycler@test.com / recycler123

## Step 7: Update Frontend

Update your frontend to use the Render backend URL:

In `/Users/keshav/Downloads/WD/rebox/frontend/.env`:
```
REACT_APP_API_URL=https://rebox-backend.onrender.com/api
REACT_APP_SOCKET_URL=https://rebox-backend.onrender.com
```

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure `DATABASE_URL` has proper URL encoding (`!` → `%21`)

### Database Connection Issues
- Render has IPv6 support, so Supabase connection should work
- Verify Supabase credentials are correct
- Check if Supabase project is active (not paused)

### App Crashes After Deploy
- Check application logs in Render dashboard
- Verify all required environment variables are set
- Ensure `NODE_ENV=production` is set

## Important Notes

### Free Tier Limitations:
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free usage

### Automatic Deploys:
- Render auto-deploys on every push to `main` branch
- Can disable in Service Settings if needed

### Custom Domain (Optional):
- Can add custom domain in Service Settings
- Update CORS `FRONTEND_URL` accordingly

## Next Steps

1. Deploy frontend to Vercel/Netlify
2. Update CORS settings with production frontend URL
3. Configure email service (Gmail, SendGrid, etc.)
4. Set up OAuth credentials if needed
5. Monitor logs and performance in Render dashboard

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Supabase Docs: https://supabase.com/docs
