# Quick reCAPTCHA Setup (5 Minutes)

## Step 1: Get Your Keys

1. **Open in browser:** https://www.google.com/recaptcha/admin

2. **Click the "+" button** to register a new site

3. **Fill out the form:**
   ```
   Label: ReBox
   reCAPTCHA type: ✓ reCAPTCHA v2
                   ✓ "I'm not a robot" Checkbox
   Domains: localhost
   ```

4. **Click "Submit"**

5. **Copy your keys:**
   - Site Key (starts with 6L...)
   - Secret Key (starts with 6L...)

## Step 2: Configure Backend

**File:** `/Users/keshav/Downloads/WD/rebox/backend/.env`

Open the file and add:
```bash
RECAPTCHA_SECRET_KEY=6L...your-secret-key-here
```

Save the file.

## Step 3: Configure Frontend

**Create file:** `/Users/keshav/Downloads/WD/rebox/frontend/.env`

```bash
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_RECAPTCHA_SITE_KEY=6L...your-site-key-here
```

Save the file.

## Step 4: Restart Servers

**Terminal 1 (Backend):**
```bash
cd /Users/keshav/Downloads/WD/rebox/backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd /Users/keshav/Downloads/WD/rebox/frontend
npm start
```

## Step 5: Test It!

1. Open: http://localhost:3000/login
2. You should see the reCAPTCHA checkbox
3. Check "I'm not a robot"
4. Try logging in

✅ Done! reCAPTCHA is now protecting your app.

---

## Troubleshooting

**Q: I don't see the reCAPTCHA checkbox**
- Check that frontend `.env` file exists
- Verify REACT_APP_RECAPTCHA_SITE_KEY is set correctly
- Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

**Q: "Invalid site key" error**
- Double-check you copied the Site Key (not Secret Key) to frontend
- Make sure `localhost` is in your reCAPTCHA domains list

**Q: Backend returns "reCAPTCHA verification failed"**
- Check backend `.env` has the Secret Key (not Site Key)
- Verify the Secret Key is correct

**Q: Can I skip this for now?**
- Yes! The app will work without reCAPTCHA keys
- It will automatically bypass verification in development mode
- Just don't set the keys in `.env` files

---

## Keys Reference

| Key Type   | Where to Use | Environment Variable |
|------------|--------------|---------------------|
| Site Key   | Frontend     | `REACT_APP_RECAPTCHA_SITE_KEY` |
| Secret Key | Backend      | `RECAPTCHA_SECRET_KEY` |

**Remember:** 
- Site Key = Public (goes in frontend, users can see it)
- Secret Key = Private (stays in backend, never expose it!)
