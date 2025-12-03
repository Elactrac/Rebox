const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For development/testing, use Ethereal Email
  // For production, use real SMTP service (SendGrid, AWS SES, etc.)
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    console.log('📧 Initializing SMTP transporter with:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      secure: process.env.SMTP_SECURE === 'true'
    });
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates in development
      }
    });
    
    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP connection verification failed:', error);
      } else {
        console.log('✅ SMTP server is ready to send emails');
      }
    });
    
    return transporter;
  }

  // Development - log to console
  console.log('⚠️  Running in DEVELOPMENT mode - emails will be logged to console only');
  return {
    sendMail: async (options) => {
      console.log('=== Email Send (Development Mode) ===');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Text:', options.text);
      if (options.html) {
        console.log('HTML: (see below)');
        console.log(options.html.substring(0, 500) + '...');
      }
      console.log('=====================================');
      return { messageId: 'dev-' + Date.now() };
    }
  };
};

const transporter = createTransporter();

// Base email template with consistent branding
const getEmailTemplate = (content, headerColor = '#10B981') => `
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
      background-color: #f3f4f6;
      padding: 20px 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: ${headerColor};
      background: linear-gradient(135deg, ${headerColor} 0%, #059669 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .tagline {
      font-size: 14px;
      opacity: 0.95;
      font-weight: 500;
    }
    .email-body {
      padding: 40px 30px;
      background: #ffffff;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 20px;
    }
    .content-text {
      font-size: 15px;
      line-height: 1.7;
      color: #374151;
      margin-bottom: 16px;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background: ${headerColor};
      color: white !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.2s;
      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
    }
    .button:hover {
      background: #059669;
      box-shadow: 0 6px 8px rgba(16, 185, 129, 0.3);
    }
    .info-box {
      background: #f0fdf4;
      border-left: 4px solid ${headerColor};
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .warning-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .detail-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 14px;
    }
    .detail-value {
      color: #111827;
      font-size: 14px;
      font-weight: 500;
      text-align: right;
    }
    .tracking-code {
      font-size: 24px;
      font-weight: 700;
      color: ${headerColor};
      text-align: center;
      letter-spacing: 1px;
      margin: 24px 0;
      padding: 16px;
      background: #f0fdf4;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
    }
    .link-box {
      background: #f3f4f6;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 16px 0;
      word-break: break-all;
      font-size: 13px;
      color: #6b7280;
      font-family: 'Courier New', monospace;
    }
    .email-footer {
      background: #1f2937;
      color: #9ca3af;
      padding: 30px;
      text-align: center;
    }
    .footer-links {
      margin: 16px 0;
    }
    .footer-link {
      color: #10B981;
      text-decoration: none;
      margin: 0 12px;
      font-size: 13px;
    }
    .social-icons {
      margin: 20px 0;
    }
    .social-icon {
      display: inline-block;
      width: 32px;
      height: 32px;
      margin: 0 6px;
      background: #374151;
      border-radius: 50%;
      line-height: 32px;
      color: white;
      text-decoration: none;
    }
    .copyright {
      font-size: 12px;
      color: #6b7280;
      margin-top: 16px;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e5e7eb, transparent);
      margin: 24px 0;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        border-radius: 0;
      }
      .email-header {
        padding: 30px 20px;
      }
      .email-body {
        padding: 30px 20px;
      }
      .logo {
        font-size: 28px;
      }
      .greeting {
        font-size: 18px;
      }
      .detail-row {
        flex-direction: column;
        gap: 4px;
      }
      .detail-value {
        text-align: left;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <div class="logo">♻️ ReBox</div>
        <div class="tagline">Sustainable Packaging Marketplace</div>
      </div>
      <div class="email-body">
        ${content}
      </div>
      <div class="email-footer">
        <div class="footer-links">
          <a href="${process.env.FRONTEND_URL || 'https://rebox-wd.vercel.app'}" class="footer-link">Home</a>
          <a href="${process.env.FRONTEND_URL || 'https://rebox-wd.vercel.app'}/impact" class="footer-link">Our Impact</a>
          <a href="${process.env.FRONTEND_URL || 'https://rebox-wd.vercel.app'}/help" class="footer-link">Help</a>
        </div>
        <div class="divider"></div>
        <p class="copyright">
          © ${new Date().getFullYear()} ReBox. All rights reserved.<br>
          Making packaging recycling simple and rewarding.
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
    subject: 'Verify your ReBox account',
    text: `Hi ${name},\n\nPlease verify your email by clicking this link: ${verifyUrl}\n\nThis link expires in 24 hours.\n\nThanks,\nThe ReBox Team`,
    html: getEmailTemplate(`
      <div class="greeting">Welcome to ReBox, ${name}! 🎉</div>
      <p class="content-text">
        Thank you for joining our mission to make packaging recycling simple, rewarding, and sustainable.
      </p>
      <p class="content-text">
        To get started, please verify your email address by clicking the button below:
      </p>
      <div class="button-container">
        <a href="${verifyUrl}" class="button">Verify Email Address</a>
      </div>
      <p class="content-text">
        Or copy and paste this link into your browser:
      </p>
      <div class="link-box">${verifyUrl}</div>
      <div class="warning-box">
        <strong>⏰ Important:</strong> This verification link will expire in 24 hours.
      </div>
      <p class="content-text">
        Once verified, you can start listing packaging, scheduling pickups, and earning rewards!
      </p>
      <div class="divider"></div>
      <p class="content-text" style="font-size: 13px; color: #6b7280;">
        If you didn't create this account, you can safely ignore this email.
      </p>`)
  }),

  resetPassword: (name, resetUrl) => ({
    subject: 'Reset your ReBox password',
    text: `Hi ${name},\n\nYou requested to reset your password. Click this link to set a new password: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nThanks,\nThe ReBox Team`,
    html: getEmailTemplate(`
      <p>Hi <strong>${name}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      
      <div class="warning-box">
        <p><strong>⏰ This link expires in 1 hour</strong></p>
        <p style="margin-top: 10px;">For your security, this password reset link will expire soon. If you need a new link, you can request another password reset.</p>
      </div>
      
      <p style="margin-top: 20px;">Or copy and paste this link in your browser:</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 12px; color: #4b5563; margin: 15px 0;">
        ${resetUrl}
      </div>
      
      <div class="info-box" style="margin-top: 30px;">
        <p><strong>🔒 Didn't request this?</strong></p>
        <p style="margin-top: 10px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.</p>
      </div>
    `, '#EF4444')
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
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  const emailContent = templates[template](...data);
  
  try {
    // Gmail requires "From" to match authenticated user, but we can set a display name
    const fromAddress = process.env.EMAIL_FROM || `"ReBox" <${process.env.SMTP_USER}>`;
    
    console.log(`📧 Attempting to send email:`, {
      to,
      template,
      subject: emailContent.subject,
      from: fromAddress
    });
    
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });
    
    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  templates
};
