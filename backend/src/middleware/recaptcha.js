/**
 * Google reCAPTCHA Middleware
 * Verifies reCAPTCHA tokens from frontend
 */

const axios = require('axios');

/**
 * Verify reCAPTCHA token with Google
 * @param {string} token - reCAPTCHA token from frontend
 * @param {string} remoteIp - Client IP address (optional)
 * @returns {Promise<Object>} Verification result
 */
const verifyRecaptcha = async (token, remoteIp = null) => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.warn('reCAPTCHA secret key not configured');
      // In development, allow bypass if not configured
      if (process.env.NODE_ENV === 'development') {
        return { success: true, score: 1.0, bypass: true };
      }
      return { success: false, error: 'reCAPTCHA not configured' };
    }

    if (!token) {
      return { success: false, error: 'reCAPTCHA token missing' };
    }

    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await axios.post(verificationUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { success: false, error: 'Verification failed' };
  }
};

/**
 * Middleware to verify reCAPTCHA v2 checkbox
 * Expects recaptchaToken in request body
 */
const verifyRecaptchaV2 = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    const result = await verifyRecaptcha(recaptchaToken, clientIp);

    if (!result.success) {
      // Check for specific error codes
      const errorCodes = result['error-codes'] || [];
      let message = 'reCAPTCHA verification failed';

      if (errorCodes.includes('missing-input-secret')) {
        message = 'reCAPTCHA configuration error';
      } else if (errorCodes.includes('invalid-input-secret')) {
        message = 'Invalid reCAPTCHA secret key';
      } else if (errorCodes.includes('missing-input-response')) {
        message = 'Please complete the reCAPTCHA challenge';
      } else if (errorCodes.includes('invalid-input-response')) {
        message = 'Invalid reCAPTCHA response';
      } else if (errorCodes.includes('timeout-or-duplicate')) {
        message = 'reCAPTCHA expired or already used';
      }

      return res.status(400).json({
        success: false,
        message,
        recaptchaError: true,
      });
    }

    // Bypass in development if not configured
    if (result.bypass) {
      console.log('reCAPTCHA bypassed in development mode');
    }

    req.recaptchaVerified = true;
    next();
  } catch (error) {
    console.error('reCAPTCHA middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'reCAPTCHA verification error',
    });
  }
};

/**
 * Middleware to verify reCAPTCHA v3 with score threshold
 * Expects recaptchaToken in request body
 * @param {number} minScore - Minimum acceptable score (0.0 to 1.0)
 */
const verifyRecaptchaV3 = (minScore = 0.5) => {
  return async (req, res, next) => {
    try {
      const { recaptchaToken } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress;

      const result = await verifyRecaptcha(recaptchaToken, clientIp);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'reCAPTCHA verification failed',
          recaptchaError: true,
        });
      }

      // Bypass in development if not configured
      if (result.bypass) {
        console.log('reCAPTCHA bypassed in development mode');
        req.recaptchaVerified = true;
        req.recaptchaScore = 1.0;
        return next();
      }

      // Check score for v3
      const score = result.score || 0;
      
      if (score < minScore) {
        return res.status(400).json({
          success: false,
          message: 'reCAPTCHA score too low. Please try again.',
          recaptchaError: true,
          score,
        });
      }

      req.recaptchaVerified = true;
      req.recaptchaScore = score;
      next();
    } catch (error) {
      console.error('reCAPTCHA v3 middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'reCAPTCHA verification error',
      });
    }
  };
};

/**
 * Optional reCAPTCHA middleware - only verifies if token is present
 * Useful for optional reCAPTCHA on less sensitive endpoints
 */
const optionalRecaptcha = async (req, res, next) => {
  const { recaptchaToken } = req.body;

  // If no token provided, skip verification
  if (!recaptchaToken) {
    req.recaptchaVerified = false;
    return next();
  }

  try {
    const clientIp = req.ip || req.connection.remoteAddress;
    const result = await verifyRecaptcha(recaptchaToken, clientIp);

    req.recaptchaVerified = result.success;
    req.recaptchaScore = result.score || null;
    next();
  } catch (error) {
    console.error('Optional reCAPTCHA error:', error);
    req.recaptchaVerified = false;
    next();
  }
};

module.exports = {
  verifyRecaptcha,
  verifyRecaptchaV2,
  verifyRecaptchaV3,
  optionalRecaptcha,
};
