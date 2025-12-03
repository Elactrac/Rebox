// Test endpoint to verify email configuration
const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/test-email-config', (req, res) => {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    smtpConfigured: {
      host: !!process.env.SMTP_HOST,
      port: !!process.env.SMTP_PORT,
      user: !!process.env.SMTP_USER,
      pass: !!process.env.SMTP_PASS,
      from: !!process.env.EMAIL_FROM
    },
    smtpValues: {
      host: process.env.SMTP_HOST ? 'SET' : 'NOT SET',
      port: process.env.SMTP_PORT || 'NOT SET',
      user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'NOT SET',
      pass: process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET',
      from: process.env.EMAIL_FROM || 'NOT SET'
    }
  };
  
  res.json({
    success: true,
    config,
    message: process.env.SMTP_HOST ? 'SMTP is configured' : 'SMTP is NOT configured'
  });
});

// Test sending actual email
router.post('/test-send-email', async (req, res) => {
  try {
    const { sendEmail } = require('../services/email');
    const testEmail = req.body.email || process.env.SMTP_USER;
    
    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'No email address provided'
      });
    }
    
    // Try sending a test email
    const result = await sendEmail(testEmail, 'welcome', ['Test User', 'INDIVIDUAL']);
    
    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully!' : 'Failed to send test email',
      messageId: result.messageId,
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
});

router.get('/debug-user/:email', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.params.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        provider: true,
        role: true
      }
    });
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // Test password
    const testPass = 'user123';
    const isMatch = user.password ? await bcrypt.compare(testPass, user.password) : false;
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        provider: user.provider,
        role: user.role,
        passwordMatchesUser123: isMatch
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
