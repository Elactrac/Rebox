const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized successfully');
}

// Create reusable transporter (fallback to nodemailer if SendGrid not available)
const createTransporter = () => {
  // Check if we have valid SMTP credentials (not placeholders)
  const hasValidSMTP = process.env.SMTP_HOST && 
                       process.env.SMTP_USER && 
                       process.env.SMTP_PASS &&
                       process.env.SMTP_USER !== 'your-email@gmail.com' &&
                       process.env.SMTP_PASS !== 'your-gmail-app-password';
  
  // For production with valid credentials, use real SMTP
  if (process.env.NODE_ENV === 'production' && hasValidSMTP) {
    console.log('📧 Initializing SMTP transporter with:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      secure: process.env.SMTP_SECURE === 'true'
    });
    
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use Gmail service directly
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP connection verification failed:', error);
        console.error('⚠️  Emails will be logged to console instead');
      } else {
        console.log('✅ SMTP server is ready to send emails');
      }
    });
    
    return transporter;
  }

  // Development mode or missing credentials - log to console
  if (!hasValidSMTP && process.env.NODE_ENV === 'production' && !process.env.SENDGRID_API_KEY) {
    console.warn('⚠️  WARNING: Production mode but no email service configured');
    console.warn('   Please set SENDGRID_API_KEY or SMTP credentials');
    console.warn('   Emails will be logged to console only (not sent)');
  } else if (!process.env.SENDGRID_API_KEY) {
    console.log('ℹ️  Running in DEVELOPMENT mode - emails will be logged to console only');
  }
  
  return {
    sendMail: async (options) => {
      console.log('\n=== 📧 Email Send (Console Mode) ===');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Preview:', options.text.substring(0, 200) + '...');
      console.log('=====================================\n');
      return { messageId: 'console-' + Date.now(), accepted: [options.to] };
    }
  };
};

const transporter = createTransporter();

// Base email template with consistent branding
const getEmailTemplate = (content, headerColor = '#10B981', headerEmoji = '♻️') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReBox</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f3f4f6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-wrapper {
      width: 100%;
      background: linear-gradient(135deg, #ecfdf5 0%, #f3f4f6 100%);
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: ${headerColor};
      background: linear-gradient(135deg, ${headerColor} 0%, #059669 100%);
      color: white;
      padding: 50px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .email-header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 8s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.2); opacity: 0.1; }
    }
    .logo-container {
      position: relative;
      z-index: 1;
    }
    .logo-emoji {
      font-size: 48px;
      margin-bottom: 12px;
      display: inline-block;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .logo {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 8px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    .tagline {
      font-size: 15px;
      opacity: 0.95;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .email-body {
      padding: 45px 35px;
      background: #ffffff;
    }
    .greeting {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .content-text {
      font-size: 16px;
      line-height: 1.8;
      color: #374151;
      margin-bottom: 18px;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, ${headerColor} 0%, #059669 100%);
      color: white !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      transition: all 0.3s;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    }
    .info-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      border-left: 5px solid ${headerColor};
      padding: 20px 24px;
      margin: 28px 0;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
    }
    .warning-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-left: 5px solid #f59e0b;
      padding: 20px 24px;
      margin: 28px 0;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
    }
    .detail-card {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin: 28px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 14px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .detail-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 15px;
    }
    .detail-value {
      color: #111827;
      font-size: 15px;
      font-weight: 600;
      text-align: right;
    }
    .tracking-code {
      text-align: center;
      margin: 32px 0;
      padding: 24px;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border-radius: 12px;
      border: 2px dashed ${headerColor};
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
    }
    .tracking-label {
      font-size: 13px;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .tracking-value {
      font-size: 28px;
      font-weight: 800;
      color: ${headerColor};
      letter-spacing: 3px;
      font-family: 'Courier New', monospace;
      text-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
    }
    .link-box {
      background: #f9fafb;
      padding: 16px 20px;
      border-radius: 8px;
      margin: 20px 0;
      word-break: break-all;
      font-size: 13px;
      color: #6b7280;
      font-family: 'Courier New', monospace;
      border: 1px solid #e5e7eb;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin: 28px 0;
    }
    .stat-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      border: 2px solid #bbf7d0;
    }
    .stat-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 800;
      color: #059669;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 12px;
      color: #047857;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .email-footer {
      background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      color: #9ca3af;
      padding: 35px 30px;
      text-align: center;
    }
    .footer-links {
      margin: 20px 0;
    }
    .footer-link {
      color: #10B981;
      text-decoration: none;
      margin: 0 15px;
      font-size: 14px;
      font-weight: 600;
      transition: color 0.2s;
    }
    .footer-link:hover {
      color: #34d399;
    }
    .social-icons {
      margin: 25px 0;
    }
    .social-icon {
      display: inline-block;
      width: 40px;
      height: 40px;
      margin: 0 8px;
      background: #374151;
      border-radius: 50%;
      line-height: 40px;
      color: white;
      text-decoration: none;
      transition: all 0.3s;
    }
    .social-icon:hover {
      background: #10B981;
      transform: translateY(-3px);
    }
    .copyright {
      font-size: 13px;
      color: #6b7280;
      margin-top: 20px;
      line-height: 1.6;
    }
    .divider {
      height: 2px;
      background: linear-gradient(to right, transparent, #374151, transparent);
      margin: 28px 0;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      .email-container {
        border-radius: 12px;
      }
      .email-header {
        padding: 40px 20px;
      }
      .email-body {
        padding: 35px 25px;
      }
      .logo {
        font-size: 30px;
      }
      .logo-emoji {
        font-size: 40px;
      }
      .greeting {
        font-size: 20px;
      }
      .detail-row {
        flex-direction: column;
        gap: 6px;
        padding: 12px 0;
      }
      .detail-value {
        text-align: left;
      }
      .stats-grid {
        grid-template-columns: 1fr;
      }
      .tracking-value {
        font-size: 22px;
        letter-spacing: 2px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <div class="logo-container">
          <div class="logo-emoji">${headerEmoji}</div>
          <div class="logo">ReBox</div>
          <div class="tagline">Sustainable Packaging Marketplace</div>
        </div>
      </div>
      <div class="email-body">
        ${content}
      </div>
      <div class="email-footer">
        <div class="footer-links">
          <a href="${process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'https://rebox-wd.vercel.app'}" class="footer-link">Home</a>
          <a href="${process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'https://rebox-wd.vercel.app'}/impact" class="footer-link">Our Impact</a>
          <a href="${process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'https://rebox-wd.vercel.app'}/help" class="footer-link">Help</a>
        </div>
        <div class="divider"></div>
        <p class="copyright">
          © ${new Date().getFullYear()} ReBox. All rights reserved.<br>
          🌍 Making packaging recycling simple and rewarding.<br>
          Together, we're building a sustainable future.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Email templates
const templates = {
  verifyEmail: (name, verifyUrl) => ({
    subject: '🎉 Welcome to ReBox - Verify Your Email',
    text: `Hi ${name},\n\nWelcome to ReBox! We're excited to have you join our sustainable packaging community.\n\nPlease verify your email by clicking this link: ${verifyUrl}\n\nThis link expires in 24 hours.\n\nOnce verified, you can start listing packaging, scheduling pickups, and earning rewards!\n\nThanks,\nThe ReBox Team`,
    html: getEmailTemplate(`
      <div class="greeting">Welcome to ReBox, ${name}! 🎉</div>
      <p class="content-text">
        Thank you for joining our mission to make packaging recycling <strong>simple, rewarding, and sustainable</strong>. 
        We're thrilled to have you as part of our growing community!
      </p>
      
      <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 25px; border-radius: 12px; margin: 28px 0; text-align: center; border: 2px solid #a7f3d0;">
        <div style="font-size: 42px; margin-bottom: 12px;">🚀</div>
        <div style="color: #047857; font-size: 18px; font-weight: 700; margin-bottom: 8px;">Let's Get You Started!</div>
        <div style="color: #059669; font-size: 14px;">Just one click away from making a difference</div>
      </div>
      
      <p class="content-text">
        To activate your account and start your sustainable journey, please verify your email address:
      </p>
      
      <div class="button-container">
        <a href="${verifyUrl}" class="button">✓ Verify Email Address</a>
      </div>
      
      <p class="content-text" style="font-size: 14px; color: #6b7280; text-align: center;">
        Or copy and paste this link into your browser:
      </p>
      <div class="link-box">${verifyUrl}</div>
      
      <div class="warning-box">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 28px;">⏰</div>
          <div>
            <strong style="font-size: 15px;">Time-Sensitive Link</strong>
            <p style="margin: 6px 0 0 0; font-size: 14px;">This verification link will expire in 24 hours for security purposes.</p>
          </div>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-value">Easy</div>
          <div class="stat-label">List Packages</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-value">Earn</div>
          <div class="stat-label">Get Rewards</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🌍</div>
          <div class="stat-value">Track</div>
          <div class="stat-label">Your Impact</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">♻️</div>
          <div class="stat-value">Save</div>
          <div class="stat-label">The Planet</div>
        </div>
      </div>
      
      <div style="margin-top: 35px; padding-top: 28px; border-top: 2px solid #f3f4f6;">
        <p class="content-text" style="font-size: 13px; color: #9ca3af; text-align: center;">
          <strong>Didn't create an account?</strong> You can safely ignore this email.<br>
          Your email address won't be added to our system without verification.
        </p>
      </div>
    `, '#10B981', '✉️')
  }),

  resetPassword: (name, resetUrl) => ({
    subject: '🔐 Reset Your ReBox Password',
    text: `Hi ${name},\n\nWe received a request to reset your ReBox password.\n\nClick this link to set a new password: ${resetUrl}\n\nThis link expires in 1 hour for security.\n\nIf you didn't request this, you can safely ignore this email - your password will remain unchanged.\n\nThanks,\nThe ReBox Team`,
    html: getEmailTemplate(`
      <div class="greeting">Hi ${name} 👋</div>
      
      <p class="content-text">
        We received a request to reset the password for your ReBox account. No worries - we've got you covered!
      </p>
      
      <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 25px; border-radius: 12px; margin: 28px 0; text-align: center; border: 2px solid #fca5a5;">
        <div style="font-size: 42px; margin-bottom: 12px;">🔑</div>
        <div style="color: #991b1b; font-size: 18px; font-weight: 700; margin-bottom: 8px;">Create a New Password</div>
        <div style="color: #dc2626; font-size: 14px;">Secure your account with a strong password</div>
      </div>
      
      <div class="button-container">
        <a href="${resetUrl}" class="button" style="background: linear-gradient(135deg, #EF4444 0%, #dc2626 100%);">🔒 Reset My Password</a>
      </div>
      
      <p class="content-text" style="font-size: 14px; color: #6b7280; text-align: center;">
        Or copy and paste this link into your browser:
      </p>
      <div class="link-box">${resetUrl}</div>
      
      <div class="warning-box">
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="font-size: 28px;">⏰</div>
          <div>
            <strong style="font-size: 15px;">Link Expires in 1 Hour</strong>
            <p style="margin: 6px 0 0 0; font-size: 14px;">For your security, this password reset link will expire in 60 minutes. If you need more time, simply request another reset link from the login page.</p>
          </div>
        </div>
      </div>
      
      <div class="info-box">
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="font-size: 28px;">🔒</div>
          <div>
            <strong style="font-size: 15px;">Didn't Request This?</strong>
            <p style="margin: 6px 0 0 0; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure. If you're concerned about your account security, please contact our support team.</p>
          </div>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 20px; border-radius: 12px; margin: 28px 0; text-align: center;">
        <div style="font-size: 16px; color: #047857; font-weight: 600; margin-bottom: 8px;">💡 Password Security Tips</div>
        <div style="font-size: 14px; color: #059669; line-height: 1.8;">
          • Use at least 8 characters<br>
          • Mix uppercase, lowercase, numbers & symbols<br>
          • Avoid common words or personal information<br>
          • Don't reuse passwords from other sites
        </div>
      </div>
    `, '#EF4444', '🔐')
  }),

  newPickupAlert: (recyclerName, pickup, user) => ({
    subject: `New Pickup Available - ${pickup.trackingCode}`,
    text: `Hi ${recyclerName},\n\nA new pickup is available in your area!\n\nTracking Code: ${pickup.trackingCode}\nCustomer: ${user.name}\nDate: ${new Date(pickup.scheduledDate).toLocaleDateString()}\nTime Slot: ${pickup.scheduledSlot}\nLocation: ${pickup.city}, ${pickup.state}\nItems: ${pickup.totalItems} package(s)\nEstimated Value: $${pickup.totalValue.toFixed(2)}\n\nView details and claim this pickup at: ${process.env.FRONTEND_URL}/pickups/${pickup.id}\n\nThanks,\nThe ReBox Team`,
    html: getEmailTemplate(`
      <p>Hi <strong>${recyclerName}</strong>,</p>
      
      <div class="warning-box">
        <p><strong>⏰ New Pickup Available - Action Required</strong></p>
        <p style="margin-top: 10px;">A new pickup request is waiting to be claimed in your service area. First come, first served!</p>
      </div>
      
      <div class="tracking-code">
        <div style="font-size: 13px; color: #6b7280; margin-bottom: 5px;">TRACKING CODE</div>
        <div style="font-size: 24px; font-weight: bold; color: #10B981; letter-spacing: 2px;">${pickup.trackingCode}</div>
      </div>
      
      <div class="detail-card">
        <div class="detail-row">
          <span class="detail-label">👤 Customer</span>
          <span class="detail-value">${user.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Pickup Date</span>
          <span class="detail-value">${new Date(pickup.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⏰ Time Slot</span>
          <span class="detail-value">${pickup.scheduledSlot}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📍 Location</span>
          <span class="detail-value">${pickup.city}, ${pickup.state}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📦 Items</span>
          <span class="detail-value">${pickup.totalItems} package(s)</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⚖️ Weight</span>
          <span class="detail-value">${pickup.totalWeight || 0} kg</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">💰 Estimated Value</span>
          <span class="detail-value" style="color: #10B981; font-weight: bold; font-size: 18px;">$${pickup.totalValue.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="info-box" style="margin: 20px 0;">
        <p style="margin: 0;"><strong>📍 Pickup Address:</strong></p>
        <p style="margin: 10px 0 0 0; line-height: 1.6;">
          ${pickup.address}<br>
          ${pickup.city}, ${pickup.state} ${pickup.zipCode}
        </p>
      </div>
      
      ${pickup.instructions ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>📝 Special Instructions:</strong></p>
          <p style="margin: 10px 0 0 0;">${pickup.instructions}</p>
        </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/pickups/${pickup.id}" class="button">🚛 View & Claim Pickup</a>
      </div>
      
      <p style="text-align: center; font-size: 13px; color: #6b7280; margin-top: 20px;">
        ⚡ <strong>Act fast!</strong> This pickup is available to all recyclers in your area.
      </p>
    `, '#059669')
  }),

  welcome: (name, role = 'INDIVIDUAL') => {
    const roleContent = {
      INDIVIDUAL: {
        title: 'Welcome to ReBox - Start Your Sustainable Journey! 🌱',
        intro: 'You\'re now part of a growing community that\'s turning packaging waste into a valuable resource.',
        benefits: [
          { icon: '♻️', title: 'Declutter Your Space', desc: 'Free up room by listing your used packaging materials' },
          { icon: '⭐', title: 'Earn Rewards', desc: 'Get points for every package you list and recycle' },
          { icon: '🌍', title: 'Track Your Impact', desc: 'See real-time data on your environmental contribution' },
          { icon: '🚛', title: 'Easy Pickups', desc: 'Schedule convenient pickup times that work for you' }
        ],
        steps: [
          { step: '1', title: 'List Your Packaging', desc: 'Take photos and describe your packaging materials' },
          { step: '2', title: 'Schedule Pickup', desc: 'Choose a convenient time for collection' },
          { step: '3', title: 'Earn Rewards', desc: 'Get points and watch your environmental impact grow' }
        ],
        cta: 'Start Listing Now',
        ctaUrl: '/packages/new'
      },
      BUSINESS: {
        title: 'Welcome to ReBox - Your Sustainable Packaging Solution 📦',
        intro: 'Transform your packaging waste into a resource and access affordable sustainable materials for your business.',
        benefits: [
          { icon: '💰', title: 'Cost Savings', desc: 'Reduce disposal costs and access affordable packaging materials' },
          { icon: '📊', title: 'Sustainability Metrics', desc: 'Track and report your environmental impact' },
          { icon: '🏢', title: 'Business Solutions', desc: 'Bulk listing and regular pickup scheduling' },
          { icon: '🌟', title: 'Brand Value', desc: 'Showcase your commitment to sustainability' }
        ],
        steps: [
          { step: '1', title: 'List Your Materials', desc: 'Bulk list packaging materials your business generates' },
          { step: '2', title: 'Explore Marketplace', desc: 'Find affordable sustainable packaging for your needs' },
          { step: '3', title: 'Track Impact', desc: 'Monitor cost savings and sustainability metrics' }
        ],
        cta: 'Explore Business Solutions',
        ctaUrl: '/dashboard'
      },
      RECYCLER: {
        title: 'Welcome to ReBox - Start Collecting & Earning 🚛',
        intro: 'Join our network of recyclers connecting with businesses and individuals who need sustainable packaging solutions.',
        benefits: [
          { icon: '📍', title: 'Local Opportunities', desc: 'Access pickup requests in your service area' },
          { icon: '💵', title: 'Earn More', desc: 'Get paid for collecting and processing packaging materials' },
          { icon: '📱', title: 'Smart Scheduling', desc: 'Efficient route planning and pickup management' },
          { icon: '📈', title: 'Grow Your Business', desc: 'Expand your recycling operations with consistent volume' }
        ],
        steps: [
          { step: '1', title: 'Browse Pickups', desc: 'View available pickup requests in your area' },
          { step: '2', title: 'Claim & Collect', desc: 'Accept pickups and schedule collections' },
          { step: '3', title: 'Process & Earn', desc: 'Process materials and receive payment' }
        ],
        cta: 'View Available Pickups',
        ctaUrl: '/pickups'
      },
      ADMIN: {
        title: 'Welcome to ReBox Admin Dashboard 👑',
        intro: 'You now have full administrative access to manage the ReBox platform and support our growing community.',
        benefits: [
          { icon: '👥', title: 'User Management', desc: 'Oversee and support all platform users' },
          { icon: '📊', title: 'Platform Analytics', desc: 'Monitor growth, engagement, and impact metrics' },
          { icon: '🔧', title: 'System Controls', desc: 'Manage platform settings and configurations' },
          { icon: '🌍', title: 'Impact Overview', desc: 'Track total environmental impact across the platform' }
        ],
        steps: [
          { step: '1', title: 'Review Dashboard', desc: 'Familiarize yourself with platform metrics' },
          { step: '2', title: 'Monitor Activity', desc: 'Keep track of user engagement and transactions' },
          { step: '3', title: 'Support Community', desc: 'Help users and optimize platform performance' }
        ],
        cta: 'Go to Admin Dashboard',
        ctaUrl: '/admin'
      }
    };

    const content = roleContent[role] || roleContent.INDIVIDUAL;

    return {
      subject: content.title.replace(/[🌱📦🚛👑]/g, '').trim(),
      text: `Hi ${name},\n\n${content.intro}\n\nNext Steps:\n${content.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.desc}`).join('\n')}\n\nGet started at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}${content.ctaUrl}\n\nThanks for joining us!\nThe ReBox Team`,
      html: getEmailTemplate(`
        <div class="greeting">Welcome to ReBox, ${name}! 🎉</div>
        <p class="content-text" style="font-size: 16px; line-height: 1.8;">
          ${content.intro}
        </p>
        
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
          <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 5px;">🚀 You're all set to get started!</div>
          <div style="color: rgba(255,255,255,0.95); font-size: 14px;">Let's make packaging recycling simple and rewarding together</div>
        </div>
        
        <div style="margin: 35px 0;">
          <h2 style="color: #1f2937; font-size: 20px; font-weight: bold; margin-bottom: 20px; text-align: center;">✨ What You Can Do</h2>
          <div style="display: grid; gap: 15px;">
            ${content.benefits.map(benefit => `
              <div style="background: #f9fafb; border-left: 4px solid #10B981; padding: 15px; border-radius: 8px;">
                <div style="display: flex; align-items: start; gap: 12px;">
                  <div style="font-size: 24px; line-height: 1; flex-shrink: 0;">${benefit.icon}</div>
                  <div>
                    <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${benefit.title}</div>
                    <div style="color: #6b7280; font-size: 14px; line-height: 1.5;">${benefit.desc}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div style="margin: 35px 0;">
          <h2 style="color: #1f2937; font-size: 20px; font-weight: bold; margin-bottom: 20px; text-align: center;">🎯 Get Started in 3 Easy Steps</h2>
          <div style="display: grid; gap: 20px;">
            ${content.steps.map((step, index) => `
              <div style="display: flex; align-items: start; gap: 15px;">
                <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; flex-shrink: 0;">${step.step}</div>
                <div style="flex: 1; padding-top: 4px;">
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-size: 16px;">${step.title}</div>
                  <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">${step.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="button-container" style="margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}${content.ctaUrl}" class="button" style="display: inline-block; background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">${content.cta} →</a>
        </div>
        
        <div class="info-box" style="margin: 30px 0;">
          <p style="margin: 0 0 10px 0;"><strong>💡 Pro Tips:</strong></p>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #4b5563;">
            <li>Complete your profile to unlock all features</li>
            <li>Check your email for important updates and notifications</li>
            <li>Visit our Help Center if you have any questions</li>
            <li>Track your environmental impact in your dashboard</li>
          </ul>
        </div>
        
        <div style="background: #ecfdf5; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
          <div style="font-size: 28px; margin-bottom: 10px;">🌍</div>
          <p style="color: #065f46; font-weight: 600; margin: 0 0 5px 0;">Together, We're Making a Difference</p>
          <p style="color: #047857; font-size: 14px; margin: 0;">Every package recycled reduces waste and saves our planet's resources</p>
        </div>
        
        <div class="divider"></div>
        
        <p class="content-text" style="text-align: center; color: #6b7280; font-size: 14px;">
          Need help getting started? Visit our <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/help" style="color: #10B981; text-decoration: none; font-weight: 600;">Help Center</a> or reply to this email.
        </p>
      `)
    };
  },

  pickupConfirmation: (name, pickup) => ({
    subject: `Pickup Scheduled - ${pickup.trackingCode}`,
    text: `Hi ${name},\n\nYour pickup has been scheduled!\n\nTracking Code: ${pickup.trackingCode}\nDate: ${new Date(pickup.scheduledDate).toLocaleDateString()}\nTime Slot: ${pickup.scheduledSlot}\nAddress: ${pickup.address}, ${pickup.city}, ${pickup.state} ${pickup.zipCode}\n\nTrack your pickup at: ${process.env.FRONTEND_URL}/pickups/${pickup.id}\n\nThanks,\nThe ReBox Team`,
    html: getEmailTemplate(`
      <p>Hi <strong>${name}</strong>,</p>
      <p>Great news! Your packaging pickup has been successfully scheduled. Here are your pickup details:</p>
      
      <div class="tracking-code">
        <div style="font-size: 13px; color: #6b7280; margin-bottom: 5px;">YOUR TRACKING CODE</div>
        <div style="font-size: 28px; font-weight: bold; color: #10B981; letter-spacing: 2px;">${pickup.trackingCode}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Save this code to track your pickup</div>
      </div>
      
      <div class="detail-card">
        <div class="detail-row">
          <span class="detail-label">📅 Pickup Date</span>
          <span class="detail-value">${new Date(pickup.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⏰ Time Slot</span>
          <span class="detail-value">${pickup.scheduledSlot}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📦 Total Items</span>
          <span class="detail-value">${pickup.totalItems} package(s)</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💰 Estimated Value</span>
          <span class="detail-value" style="color: #10B981; font-weight: bold;">$${pickup.totalValue.toFixed(2)}</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">⭐ Reward Points</span>
          <span class="detail-value" style="color: #10B981; font-weight: bold;">${pickup.rewardPoints} points</span>
        </div>
      </div>
      
      <div class="info-box" style="margin: 20px 0;">
        <p style="margin: 0;"><strong>📍 Pickup Address:</strong></p>
        <p style="margin: 10px 0 0 0; line-height: 1.6;">
          ${pickup.address}<br>
          ${pickup.city}, ${pickup.state} ${pickup.zipCode}
        </p>
      </div>
      
      ${pickup.instructions ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>📝 Special Instructions:</strong></p>
          <p style="margin: 10px 0 0 0;">${pickup.instructions}</p>
        </div>
      ` : ''}
      
      <div class="info-box" style="margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>📋 What to Prepare:</strong></p>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Have all ${pickup.totalItems} package(s) ready at the pickup address</li>
          <li>Ensure packages are clean and free of contents</li>
          <li>Keep this tracking code handy: <strong>${pickup.trackingCode}</strong></li>
          <li>Someone should be available during the scheduled time slot</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/pickups/${pickup.id}" class="button">📊 Track Your Pickup</a>
      </div>
      
      <p style="text-align: center; font-size: 13px; color: #6b7280; margin-top: 20px;">
        🌱 Thank you for contributing to a sustainable future! Each package you recycle makes a difference.
      </p>
    `)
  })
};

// Send email function with timeout
const sendEmail = async (to, template, data, options = {}) => {
  const emailContent = templates[template](...data);
  const timeout = options.timeout || 10000; // 10 second default timeout
  
  try {
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'noreply@rebox.com';
    
    console.log(`📧 Sending email [${template}]:`, {
      to,
      subject: emailContent.subject,
      from: fromAddress,
      provider: process.env.SENDGRID_API_KEY ? 'SendGrid' : 'SMTP'
    });
    
    // Use SendGrid if API key is available (more reliable)
    if (process.env.SENDGRID_API_KEY) {
      const msg = {
        to,
        from: fromAddress,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      };
      
      const response = await sgMail.send(msg);
      
      console.log('✅ Email sent via SendGrid:', {
        template,
        statusCode: response[0].statusCode,
        to
      });
      
      return { success: true, provider: 'SendGrid', statusCode: response[0].statusCode };
    }
    
    // Fallback to SMTP (nodemailer)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email send timeout')), timeout);
    });
    
    const info = await Promise.race([
      transporter.sendMail({
        from: fromAddress,
        to,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      }),
      timeoutPromise
    ]);
    
    console.log('✅ Email sent via SMTP:', {
      template,
      messageId: info.messageId,
      accepted: info.accepted?.length || 0,
      rejected: info.rejected?.length || 0
    });
    
    return { success: true, messageId: info.messageId, provider: 'SMTP' };
  } catch (error) {
    console.error(`❌ Email send failed [${template}]:`, {
      to,
      error: error.message,
      code: error.code,
      response: error.response?.body
    });
    
    // Don't fail the request if email fails
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  templates
};
