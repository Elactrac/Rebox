# Google OAuth Troubleshooting Checklist

## ✅ Backend Configuration (DONE)
- [x] `GOOGLE_CLIENT_ID` set in Render: `185236919820-ehqtqn1n4v016jjiunq1i11pldrhlskm.apps.googleusercontent.com`
- [x] `GOOGLE_CLIENT_SECRET` set in Render
- [x] Backend OAuth config returns `enabled: true`
- [x] Backend can generate OAuth URLs

## 🔍 Google Cloud Console Settings (VERIFY THESE)

Go to: https://console.cloud.google.com/apis/credentials

### 1. Find Your OAuth 2.0 Client ID
Look for: `185236919820-ehqtqn1n4v016jjiunq1i11pldrhlskm.apps.googleusercontent.com`

### 2. Click "Edit" and verify these settings:

#### Authorized JavaScript origins:
```
http://localhost:3000
https://rebox-m3qz.onrender.com
```

#### Authorized redirect URIs:
```
http://localhost:3000/oauth/callback/google
https://rebox-m3qz.onrender.com/oauth/callback/google
```

### 3. OAuth Consent Screen
- Status should be: **Testing** or **Published**
- If Testing, add your test email addresses to "Test users"

## 🧪 Testing Steps

### Step 1: Clear Browser Cache
1. Open http://localhost:3000/login
2. Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows) - Hard refresh
3. Open DevTools (F12)
4. Go to Console tab

### Step 2: Check for Button
- You should see "Sign in with Google" button
- If not visible, check Console for errors

### Step 3: Check Network Requests
1. Go to Network tab in DevTools
2. Refresh the page
3. Look for request to: `https://rebox-m3qz.onrender.com/api/oauth/config`
4. Check if response shows `"enabled": true`

### Step 4: Test OAuth Flow
1. Click "Sign in with Google" button
2. Should redirect to Google login page
3. After Google login, redirects back to: `http://localhost:3000/oauth/callback/google?code=...`

## 🐛 Common Issues

### Issue 1: Button Not Showing
**Symptom:** No Google sign-in button on login page

**Solution:**
- Hard refresh browser (Cmd+Shift+R)
- Check DevTools Console for errors
- Verify `/api/oauth/config` returns `enabled: true`

### Issue 2: "redirect_uri_mismatch" Error
**Symptom:** Google shows error after clicking button

**Solution:**
- Verify redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/oauth/callback/google`
- NO trailing slashes
- Must be exact match (case-sensitive)

### Issue 3: "Access Blocked: App Not Published"
**Symptom:** Google shows "This app isn't verified"

**Solution:**
- Add your email to Test Users in OAuth Consent Screen
- Or publish the app (requires verification for production)

### Issue 4: "Invalid Client ID"
**Symptom:** Error when generating OAuth URL

**Solution:**
- Verify `GOOGLE_CLIENT_ID` in Render matches the one in Google Cloud Console
- Redeploy Render service after changing env vars

## 📞 Quick Debug Commands

Run these in Terminal:

```bash
# 1. Check backend OAuth config
curl -s https://rebox-m3qz.onrender.com/api/oauth/config | jq .

# Expected output:
# {
#   "success": true,
#   "data": {
#     "google": {
#       "enabled": true,
#       "clientId": "185236919820-..."
#     }
#   }
# }

# 2. Test OAuth URL generation
curl -s 'https://rebox-m3qz.onrender.com/api/oauth/google/url?redirect_uri=http://localhost:3000/oauth/callback/google' | jq .

# Should return a Google OAuth URL
```

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Frontend running on http://localhost:3000
- [ ] Backend env vars set (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] Backend redeployed after adding env vars
- [ ] Redirect URIs added to Google Cloud Console
- [ ] Browser cache cleared (hard refresh)
- [ ] DevTools Console checked for errors
- [ ] Network tab shows `/oauth/config` returning `enabled: true`

## 🎯 Current Status

### Backend:
- ✅ OAuth enabled: `true`
- ✅ Client ID: `185236919820-ehqtqn1n4v016jjiunq1i11pldrhlskm.apps.googleusercontent.com`
- ✅ Generating OAuth URLs successfully

### Frontend:
- ✅ Running on localhost:3000
- ✅ GoogleSignInButton component exists
- ✅ API calls configured correctly
- ⚠️ **NEEDS HARD REFRESH** to pick up new OAuth config

## 🚀 Next Steps

1. **Go to: http://localhost:3000/login**
2. **Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)**
3. **You should now see the Google sign-in button**
4. **If still not visible:**
   - Open DevTools Console (F12)
   - Share any error messages
   - Check Network tab for `/oauth/config` response

## 📧 Test User Setup

If you see "Access Blocked" when testing:

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Under "Test users", click "ADD USERS"
3. Add your Google email address
4. Save and try again
