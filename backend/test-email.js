require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration\n');
  console.log('📋 Current Configuration:');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  SMTP_HOST:', process.env.SMTP_HOST);
  console.log('  SMTP_PORT:', process.env.SMTP_PORT);
  console.log('  SMTP_USER:', process.env.SMTP_USER);
  console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
  console.log('  EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('');

  // Check if in development mode
  if (process.env.NODE_ENV !== 'production' || !process.env.SMTP_HOST) {
    console.log('⚠️  ISSUE FOUND: Not in production mode or SMTP_HOST not set');
    console.log('');
    console.log('📝 Email Service Behavior:');
    console.log('  - In DEVELOPMENT mode: Emails are only logged to console (NOT actually sent)');
    console.log('  - In PRODUCTION mode: Emails are sent via SMTP');
    console.log('');
    console.log('✅ SOLUTION OPTIONS:\n');
    console.log('Option 1: Test Mode (Console Logging Only)');
    console.log('  - Keep NODE_ENV=development');
    console.log('  - Emails will be logged to console');
    console.log('  - Good for testing without real email');
    console.log('');
    console.log('Option 2: Real Email Sending (Gmail)');
    console.log('  Step 1: Enable 2FA on your Gmail account');
    console.log('  Step 2: Generate App Password at: https://myaccount.google.com/apppasswords');
    console.log('  Step 3: Update .env with:');
    console.log('    NODE_ENV=production');
    console.log('    SMTP_USER=your-real-email@gmail.com');
    console.log('    SMTP_PASS=your-16-char-app-password');
    console.log('');
    console.log('Option 3: Use a Testing Service (Recommended for Development)');
    console.log('  - Sign up for Mailtrap (free): https://mailtrap.io');
    console.log('  - Get SMTP credentials from Mailtrap');
    console.log('  - Update .env with Mailtrap credentials');
    console.log('  - Emails will be captured (not sent to real inboxes)');
    console.log('');
    return;
  }

  // Check if credentials are placeholders
  if (process.env.SMTP_USER === 'your-email@gmail.com' || 
      process.env.SMTP_PASS === 'your-gmail-app-password') {
    console.log('❌ ISSUE FOUND: SMTP credentials are placeholder values');
    console.log('');
    console.log('You need to update your .env file with real credentials.');
    console.log('See solutions above.');
    console.log('');
    return;
  }

  // Test SMTP connection
  console.log('🔌 Testing SMTP Connection...\n');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection Successful!');
    console.log('📧 Email service is properly configured and ready to send emails.\n');

    // Send test email
    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"ReBox Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'ReBox Email Test ✅',
      text: 'If you receive this email, your ReBox email service is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f3f4f6; border-radius: 8px;">
          <h2 style="color: #10B981;">✅ Email Service Test Successful!</h2>
          <p>Your ReBox email configuration is working correctly.</p>
          <p style="color: #6b7280; font-size: 14px;">Test conducted at: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('  Message ID:', info.messageId);
    console.log('  Check your inbox:', process.env.SMTP_USER);
  } catch (error) {
    console.log('❌ SMTP Connection Failed!');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    
    if (error.code === 'EAUTH') {
      console.log('🔐 Authentication Failed - Possible causes:');
      console.log('  1. Incorrect email or password');
      console.log('  2. Need to use App Password (not your Gmail password)');
      console.log('  3. 2FA not enabled on Gmail account');
      console.log('');
      console.log('📝 To fix:');
      console.log('  1. Go to: https://myaccount.google.com/apppasswords');
      console.log('  2. Create a new App Password');
      console.log('  3. Update SMTP_PASS in .env with the 16-character password');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.log('🌐 Connection Failed - Possible causes:');
      console.log('  1. Network/firewall blocking SMTP port 587');
      console.log('  2. Wrong SMTP host or port');
      console.log('  3. Internet connection issue');
    }
  }
}

testEmailConfiguration().catch(console.error);
