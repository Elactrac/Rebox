# 🧪 Test Accounts

## Available Test Accounts

All test accounts have been created and are **ready to use immediately**!

---

### 👤 Individual Users

**Account 1:**
```
Email:    john@test.com
Password: password123
Name:     John Doe
Role:     Individual
Points:   100
```

**Account 2:**
```
Email:    jane@test.com
Password: password123
Name:     Jane Smith
Role:     Individual
Points:   100
```

---

### 🏢 Business User

```
Email:        business@test.com
Password:     password123
Name:         Mike Johnson
Role:         Business
Company:      EcoBoxes Inc
Type:         Retail
Points:       100
```

---

### ♻️ Recycler User

```
Email:        recycler@test.com
Password:     password123
Name:         Sarah Green
Role:         Recycler
Company:      GreenCycle Solutions
Type:         Recycling
Points:       100
```

---

### 👨‍💼 Admin User

```
Email:    admin@test.com
Password: admin123
Name:     Admin User
Role:     Individual
Points:   100
```

---

## 🧪 How to Test

### Option 1: Login with Existing Account

1. Go to: http://localhost:3000/login
2. **Check the reCAPTCHA box** ("I'm not a robot")
3. Enter any email/password from above
4. Click "Sign In"

**Example:**
- Email: `john@test.com`
- Password: `password123`
- ✅ Check reCAPTCHA
- 🚀 Login!

### Option 2: Create New Account

1. Go to: http://localhost:3000/register
2. Fill out the form
3. **Check the reCAPTCHA box**
4. Submit

---

## 🔐 Important: reCAPTCHA Required!

**Both login and registration now require reCAPTCHA verification:**
- ✅ You must check "I'm not a robot" before submitting
- ❌ Without verification → Error message
- ✅ With verification → Success!

---

## 🎯 Test Scenarios

### Scenario 1: Test Login with reCAPTCHA
1. Open http://localhost:3000/login
2. Enter: `jane@test.com` / `password123`
3. **Try submitting WITHOUT checking reCAPTCHA** → Should fail
4. **Check the reCAPTCHA box** → Should succeed

### Scenario 2: Test Registration
1. Open http://localhost:3000/register
2. Fill in new user details
3. Check reCAPTCHA
4. Submit → New account created

### Scenario 3: Test Different Roles
- Login as **Individual** (`john@test.com`)
- Login as **Business** (`business@test.com`)
- Login as **Recycler** (`recycler@test.com`)
- See different dashboard features for each role

### Scenario 4: Test Google OAuth (if configured)
1. Click "Sign in with Google" button
2. Complete Google authentication
3. reCAPTCHA is also verified during OAuth flow

---

## 📊 All Accounts Have:

- ✅ **Verified email** (no verification needed)
- ✅ **100 reward points** to start
- ✅ **Impact stats** initialized
- ✅ **Valid phone numbers**
- ✅ **Ready to use immediately**

---

## 🔧 Reset/Recreate Accounts

If you need to reset accounts:

```bash
cd /Users/keshav/Downloads/WD/rebox/backend
node create-test-accounts.js
```

Script will skip existing accounts and only create missing ones.

---

## 🚀 Quick Test Commands

**Test Login API directly (bypass reCAPTCHA):**
```bash
# Note: This will fail because reCAPTCHA is required
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"password123"}'
```

**Check if user exists:**
```bash
# Will return "Access denied" (expected - need auth token)
curl http://localhost:5001/api/auth/me
```

---

## 📝 Notes

- All passwords are **simple for testing** (`password123` or `admin123`)
- **Don't use these in production!**
- Accounts are **auto-verified** (no email verification needed)
- Each account starts with **100 reward points**
- reCAPTCHA is **required** for all authentication flows

---

## 🎉 Ready to Test!

Pick any account above and login at: **http://localhost:3000/login**

**Don't forget to check the reCAPTCHA box!** ✅
