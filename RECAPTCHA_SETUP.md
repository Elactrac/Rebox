# Google reCAPTCHA Setup Guide

## Overview
Google reCAPTCHA v2 has been successfully integrated into the ReBox application to protect against bots and spam on login, registration, and OAuth flows.

## ⚡ Quick Start (No Domain Needed!)

**Don't have a domain?** No problem! reCAPTCHA works on `localhost` for testing.

1. Go to: https://www.google.com/recaptcha/admin
2. Click "+" → Create new site
3. Choose "reCAPTCHA v2" → "I'm not a robot"
4. Type `localhost` as the domain
5. Copy your **Site Key** and **Secret Key**
6. Add to `.env` files (see detailed instructions below)
7. Restart servers and test!

That's it! You can deploy to a real domain later.

## Files Created/Modified

### Backend
- ✅ `src/middleware/recaptcha.js` - reCAPTCHA verification middleware
- ✅ `src/routes/auth.js` - Added reCAPTCHA to login and register routes
- ✅ `src/routes/oauth.js` - Added reCAPTCHA to OAuth routes
- ✅ `.env.example` - Added RECAPTCHA_SECRET_KEY configuration

### Frontend
- ✅ `src/components/common/ReCaptcha.js` - Reusable reCAPTCHA component
- ✅ `src/pages/Login.js` - Integrated reCAPTCHA
- ✅ `src/pages/Register.js` - Integrated reCAPTCHA
- ✅ `src/context/AuthContext.js` - Updated to pass reCAPTCHA token
- ✅ `.env.example` - Added REACT_APP_RECAPTCHA_SITE_KEY configuration

## Setup Instructions

### 1. Get Google reCAPTCHA Keys

1. **Go to Google reCAPTCHA Admin Console:**
   - Visit: https://www.google.com/recaptcha/admin

2. **Register a new site:**
   - Click "+" to add a new site
   - Label: "ReBox" (or your preferred name)
   - reCAPTCHA type: **reCAPTCHA v2** → "I'm not a robot" Checkbox
   - Domains: 
     - **Just type:** `localhost` (Google allows this for testing)
     - You can add more domains later when you deploy

3. **Accept Terms** and click "Submit"

   **Note:** Google reCAPTCHA works perfectly on localhost for development and testing. You don't need a real domain to get started!

4. **Copy Your Keys:**
   - **Site Key** (public key - used in frontend)
   - **Secret Key** (private key - used in backend)

### 2. Configure Backend

1. **Edit `.env` file:**
   ```bash
   cd /Users/keshav/Downloads/WD/rebox/backend
   nano .env  # or use any text editor
   ```

2. **Add these lines** (replace with your actual keys):
   ```
   RECAPTCHA_SECRET_KEY=your-actual-secret-key-here
   ```

### 3. Configure Frontend

1. **Create `.env` file** (if it doesn't exist):
   ```bash
   cd /Users/keshav/Downloads/WD/rebox/frontend
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```bash
   nano .env  # or use any text editor
   ```

3. **Add these lines** (replace with your actual keys):
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   REACT_APP_RECAPTCHA_SITE_KEY=your-actual-site-key-here
   ```

### 4. Restart Servers

**Backend:**
```bash
cd /Users/keshav/Downloads/WD/rebox/backend
npm start
```

**Frontend:**
```bash
cd /Users/keshav/Downloads/WD/rebox/frontend
npm start
```

## Features

### Protected Routes
- ✅ `/api/auth/register` - Registration with reCAPTCHA
- ✅ `/api/auth/login` - Login with reCAPTCHA
- ✅ `/api/oauth/google/token` - Google OAuth with reCAPTCHA
- ✅ `/api/oauth/google/code` - Google OAuth callback with reCAPTCHA

### Development Mode
- If reCAPTCHA keys are **not configured**, the system will:
  - **Backend:** Bypass verification in development mode
  - **Frontend:** Hide the reCAPTCHA widget
- This allows development without reCAPTCHA, but **should be configured for production**

### Error Handling
- Token expired → User notified to verify again
- Token missing → User prompted to complete reCAPTCHA
- Token invalid → Clear error message shown
- Network error → Graceful fallback

## Testing

1. **Without reCAPTCHA (Development):**
   - Don't configure keys
   - App works normally, reCAPTCHA bypassed

2. **With reCAPTCHA:**
   - Configure keys as described above
   - Visit `http://localhost:3000/login`
   - See reCAPTCHA checkbox appear
   - Click "I'm not a robot"
   - Submit form - should work
   - Try submitting without checking - should fail with error

## Production Deployment

When deploying to production:

1. **Update reCAPTCHA domains:**
   - Go back to https://www.google.com/recaptcha/admin
   - Add your production domain (e.g., `rebox.eco`)

2. **Set environment variables:**
   - Backend: `RECAPTCHA_SECRET_KEY`
   - Frontend: `REACT_APP_RECAPTCHA_SITE_KEY`

3. **Enable HTTPS:**
   - reCAPTCHA works best with HTTPS
   - Some features may be limited on HTTP

## Troubleshooting

### reCAPTCHA Not Showing
- Check that `REACT_APP_RECAPTCHA_SITE_KEY` is set in frontend `.env`
- Verify the key is not the placeholder value
- Check browser console for errors

### Verification Failing
- Ensure `RECAPTCHA_SECRET_KEY` is correct in backend `.env`
- Check backend logs for specific error messages
- Verify domain is registered in reCAPTCHA admin console

### "reCAPTCHA expired" Error
- Token is valid for 2 minutes
- User needs to verify again if they wait too long

## Security Notes

- ✅ Secret key never exposed to frontend
- ✅ Token validated on every protected endpoint
- ✅ Tokens are single-use (cannot be reused)
- ✅ IP address sent for additional verification
- ✅ Rate limiting still applies (defense in depth)

## Advanced Configuration

### Using reCAPTCHA v3 (Score-based)

If you prefer invisible reCAPTCHA with risk scores:

1. Register a new reCAPTCHA v3 site
2. In backend, use `verifyRecaptchaV3(0.5)` middleware instead
3. Adjust score threshold (0.0 to 1.0) based on your needs

### Optional reCAPTCHA

For less sensitive endpoints, use `optionalRecaptcha` middleware:
- Verifies if token is present
- Skips if token is absent
- Useful for search, browse, etc.

## Support

For issues:
- Backend logs: Check `/tmp/backend.log`
- Frontend logs: Check browser console
- reCAPTCHA docs: https://developers.google.com/recaptcha

## Summary

✅ Google reCAPTCHA v2 fully integrated
✅ Backend middleware created and applied
✅ Frontend component created and integrated
✅ Development mode bypass for convenience
✅ Production-ready with proper error handling
✅ Works with both email/password and OAuth flows

**Next Step:** Get your reCAPTCHA keys and configure the `.env` files!
