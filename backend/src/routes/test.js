// Test endpoint to verify email configuration
const express = require('express');
const router = express.Router();

router.get('/test-email-config', (req, res) => {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    smtpConfigured: {
      host: !!process.env.SMTP_HOST,
      port: !!process.env.SMTP_PORT,
      user: !!process.env.SMTP_USER,
      pass: !!process.env.SMTP_PASS,
      from: !!process.env.SMTP_FROM
    },
    smtpValues: {
      host: process.env.SMTP_HOST ? 'SET' : 'NOT SET',
      port: process.env.SMTP_PORT || 'NOT SET',
      user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'NOT SET',
      pass: process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET',
      from: process.env.SMTP_FROM || 'NOT SET'
    }
  };
  
  res.json({
    success: true,
    config,
    message: process.env.SMTP_HOST ? 'SMTP is configured' : 'SMTP is NOT configured'
  });
});

module.exports = router;
