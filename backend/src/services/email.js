const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For development/testing, use Ethereal Email
  // For production, use real SMTP service (SendGrid, AWS SES, etc.)
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Development - log to console
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

// Email templates
const templates = {
  verifyEmail: (name, verifyUrl) => ({
    subject: 'Verify your ReBox account',
    text: `Hi ${name},\n\nPlease verify your email by clicking this link: ${verifyUrl}\n\nThis link expires in 24 hours.\n\nThanks,\nThe ReBox Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ReBox!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for signing up for ReBox! Please verify your email address to get started with sustainable packaging recycling.</p>
            <p style="text-align: center;">
              <a href="${verifyUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${verifyUrl}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>ReBox - Sustainable Packaging Marketplace</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  resetPassword: (name, resetUrl) => ({
    subject: 'Reset your ReBox password',
    text: `Hi ${name},\n\nYou requested to reset your password. Click this link to set a new password: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nThanks,\nThe ReBox Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <div class="warning">
              <strong>Didn't request this?</strong>
              <p style="margin: 5px 0 0 0;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
          </div>
          <div class="footer">
            <p>ReBox - Sustainable Packaging Marketplace</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  pickupConfirmation: (name, pickup) => ({
    subject: `Pickup Scheduled - ${pickup.trackingCode}`,
    text: `Hi ${name},\n\nYour pickup has been scheduled!\n\nTracking Code: ${pickup.trackingCode}\nDate: ${new Date(pickup.scheduledDate).toLocaleDateString()}\nTime Slot: ${pickup.scheduledSlot}\nAddress: ${pickup.address}, ${pickup.city}, ${pickup.state} ${pickup.zipCode}\n\nTrack your pickup at: ${process.env.FRONTEND_URL}/pickups/${pickup.id}\n\nThanks,\nThe ReBox Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .tracking-code { font-size: 24px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Pickup Scheduled!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Great news! Your packaging pickup has been scheduled.</p>
            <div class="tracking-code">${pickup.trackingCode}</div>
            <div class="details">
              <div class="detail-row"><span><strong>Date:</strong></span><span>${new Date(pickup.scheduledDate).toLocaleDateString()}</span></div>
              <div class="detail-row"><span><strong>Time Slot:</strong></span><span>${pickup.scheduledSlot}</span></div>
              <div class="detail-row"><span><strong>Items:</strong></span><span>${pickup.totalItems} package(s)</span></div>
              <div class="detail-row"><span><strong>Est. Value:</strong></span><span>$${pickup.totalValue.toFixed(2)}</span></div>
              <div class="detail-row"><span><strong>Points to Earn:</strong></span><span>${pickup.rewardPoints} points</span></div>
            </div>
            <p><strong>Pickup Address:</strong><br>${pickup.address}<br>${pickup.city}, ${pickup.state} ${pickup.zipCode}</p>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/pickups/${pickup.id}" class="button">Track Pickup</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  const emailContent = templates[template](...data);
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ReBox" <noreply@rebox.com>',
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });
    
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  templates
};
