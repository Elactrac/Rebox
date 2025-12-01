#!/bin/bash
# Quick script to check reCAPTCHA configuration

echo "🔍 Checking reCAPTCHA Configuration..."
echo ""

# Check backend
echo "📦 Backend Check:"
if [ -f "backend/.env" ]; then
    if grep -q "RECAPTCHA_SECRET_KEY=6L" backend/.env 2>/dev/null; then
        echo "  ✅ Backend .env has RECAPTCHA_SECRET_KEY configured"
    elif grep -q "RECAPTCHA_SECRET_KEY=" backend/.env 2>/dev/null; then
        echo "  ⚠️  Backend .env has RECAPTCHA_SECRET_KEY but value looks like placeholder"
        echo "      Update it with your actual secret key from Google reCAPTCHA"
    else
        echo "  ❌ Backend .env missing RECAPTCHA_SECRET_KEY"
        echo "      Add: RECAPTCHA_SECRET_KEY=your-secret-key"
    fi
else
    echo "  ❌ Backend .env file not found"
    echo "      Copy .env.example to .env and configure it"
fi

echo ""

# Check frontend
echo "🎨 Frontend Check:"
if [ -f "frontend/.env" ]; then
    if grep -q "REACT_APP_RECAPTCHA_SITE_KEY=6L" frontend/.env 2>/dev/null; then
        echo "  ✅ Frontend .env has REACT_APP_RECAPTCHA_SITE_KEY configured"
    elif grep -q "REACT_APP_RECAPTCHA_SITE_KEY=" frontend/.env 2>/dev/null; then
        echo "  ⚠️  Frontend .env has REACT_APP_RECAPTCHA_SITE_KEY but value looks like placeholder"
        echo "      Update it with your actual site key from Google reCAPTCHA"
    else
        echo "  ❌ Frontend .env missing REACT_APP_RECAPTCHA_SITE_KEY"
        echo "      Add: REACT_APP_RECAPTCHA_SITE_KEY=your-site-key"
    fi
else
    echo "  ❌ Frontend .env file not found"
    echo "      Create frontend/.env and add REACT_APP_RECAPTCHA_SITE_KEY"
fi

echo ""
echo "📚 Need help? Read RECAPTCHA_QUICK_START.md"
echo "🌐 Get keys from: https://www.google.com/recaptcha/admin"
echo ""
echo "ℹ️  Note: The app works without reCAPTCHA in development mode,"
echo "   but you should configure it for production!"
