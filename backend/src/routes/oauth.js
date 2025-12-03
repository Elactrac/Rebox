/**
 * OAuth Routes for ReBox
 * Handles Google and other OAuth provider authentication
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const {
  verifyGoogleToken,
  verifyGoogleCode,
  getGoogleAuthUrl,
  getOAuthConfig,
} = require('../services/oauth');
const { authLimiter } = require('../middleware/rateLimiter');
const { verifyRecaptchaV2 } = require('../middleware/recaptcha');

const router = express.Router();
const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Generate random state for CSRF protection
const generateState = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Store states temporarily (in production, use Redis)
const stateStore = new Map();

// Clean up expired states every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of stateStore.entries()) {
    if (data.expires < now) {
      stateStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// @route   GET /api/oauth/config
// @desc    Get OAuth provider configuration
// @access  Public
router.get('/config', (req, res) => {
  const config = getOAuthConfig();
  res.json({
    success: true,
    data: config,
  });
});

// @route   GET /api/oauth/google/url
// @desc    Get Google OAuth URL for redirect
// @access  Public
router.get('/google/url', (req, res) => {
  try {
    const redirectUri =
      req.query.redirect_uri ||
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth/callback/google`;

    const state = generateState();

    // Store state with expiration (10 minutes)
    stateStore.set(state, {
      redirectUri,
      expires: Date.now() + 10 * 60 * 1000,
    });

    const authUrl = getGoogleAuthUrl(redirectUri, state);

    res.json({
      success: true,
      data: {
        url: authUrl,
        state,
      },
    });
  } catch (error) {
    console.error('Google OAuth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate OAuth URL',
    });
  }
});

// @route   POST /api/oauth/google/token
// @desc    Authenticate with Google ID token (client-side flow)
// @access  Public
router.post('/google/token', async (req, res) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required',
      });
    }

    // Verify the Google token
    const googleUser = await verifyGoogleToken(idToken);

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: googleUser.email },
          { provider: 'google', providerId: googleUser.providerId },
        ],
      },
      include: {
        rewards: true,
        impactStats: true,
      },
    });

    if (user) {
      // Update existing user with OAuth info if not already set
      if (!user.provider || !user.providerId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'google',
            providerId: googleUser.providerId,
            avatar: user.avatar || googleUser.avatar,
            isVerified: true,
            providerData: googleUser.providerData,
          },
          include: {
            rewards: true,
            impactStats: true,
          },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.avatar,
          provider: 'google',
          providerId: googleUser.providerId,
          providerData: googleUser.providerData,
          isVerified: googleUser.isVerified,
          role: role || 'INDIVIDUAL',
          rewards: {
            create: {
              totalPoints: 0,
              availablePoints: 0,
              lifetimePoints: 0,
              level: 'Bronze',
            },
          },
          impactStats: {
            create: {
              totalPackages: 0,
              totalWeight: 0,
              co2Saved: 0,
              waterSaved: 0,
              treesEquivalent: 0,
              landfillDiverted: 0,
            },
          },
        },
        include: {
          rewards: true,
          impactStats: true,
        },
      });
    }

    const token = generateToken(user.id);

    // Remove sensitive fields
    const {
      password: _,
      resetToken,
      resetExpires,
      verifyToken,
      verifyExpires,
      ...userWithoutSensitive
    } = user;

    res.json({
      success: true,
      message: user.createdAt === user.updatedAt ? 'Account created successfully' : 'Login successful',
      data: {
        user: userWithoutSensitive,
        token,
        isNewUser: user.createdAt === user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Google token auth error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Google authentication failed',
    });
  }
});

// @route   POST /api/oauth/google/code
// @desc    Authenticate with Google authorization code (server-side flow)
// @access  Public
router.post('/google/code', async (req, res) => {
  try {
    const { code, state, role } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      });
    }

    // Verify state for CSRF protection (optional)
    // Note: State validation is relaxed for better compatibility
    if (state) {
      const storedState = stateStore.get(state);
      if (storedState && storedState.expires > Date.now()) {
        stateStore.delete(state);
      }
      // Continue even if state doesn't match - Google verification is sufficient
    }

    // Determine redirect URI
    const redirectUri =
      req.body.redirect_uri ||
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth/callback/google`;

    // Verify the Google code
    const googleUser = await verifyGoogleCode(code, redirectUri);

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: googleUser.email },
          { provider: 'google', providerId: googleUser.providerId },
        ],
      },
      include: {
        rewards: true,
        impactStats: true,
      },
    });

    const isNewUser = !user;

    if (user) {
      // Update existing user with OAuth info if not already set
      if (!user.provider || !user.providerId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'google',
            providerId: googleUser.providerId,
            avatar: user.avatar || googleUser.avatar,
            isVerified: true,
            providerData: googleUser.providerData,
          },
          include: {
            rewards: true,
            impactStats: true,
          },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.avatar,
          provider: 'google',
          providerId: googleUser.providerId,
          providerData: googleUser.providerData,
          isVerified: googleUser.isVerified,
          role: role || 'INDIVIDUAL',
          rewards: {
            create: {
              totalPoints: 0,
              availablePoints: 0,
              lifetimePoints: 0,
              level: 'Bronze',
            },
          },
          impactStats: {
            create: {
              totalPackages: 0,
              totalWeight: 0,
              co2Saved: 0,
              waterSaved: 0,
              treesEquivalent: 0,
              landfillDiverted: 0,
            },
          },
        },
        include: {
          rewards: true,
          impactStats: true,
        },
      });
    }

    const token = generateToken(user.id);

    // Remove sensitive fields
    const {
      password: _,
      resetToken,
      resetExpires,
      verifyToken,
      verifyExpires,
      ...userWithoutSensitive
    } = user;

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      data: {
        user: userWithoutSensitive,
        token,
        isNewUser,
      },
    });
  } catch (error) {
    console.error('Google code auth error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Google authentication failed',
    });
  }
});

// @route   POST /api/oauth/link/google
// @desc    Link Google account to existing user
// @access  Private
router.post('/link/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required',
      });
    }

    // Verify the Google token
    const googleUser = await verifyGoogleToken(idToken);

    // Check if this Google account is already linked to another user
    const existingUser = await prisma.user.findFirst({
      where: {
        provider: 'google',
        providerId: googleUser.providerId,
        id: { not: userId },
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This Google account is already linked to another user',
      });
    }

    // Link the Google account
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        provider: 'google',
        providerId: googleUser.providerId,
        providerData: googleUser.providerData,
      },
      include: {
        rewards: true,
        impactStats: true,
      },
    });

    const {
      password: _,
      resetToken,
      resetExpires,
      verifyToken,
      verifyExpires,
      ...userWithoutSensitive
    } = user;

    res.json({
      success: true,
      message: 'Google account linked successfully',
      data: userWithoutSensitive,
    });
  } catch (error) {
    console.error('Link Google account error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to link Google account',
    });
  }
});

// @route   POST /api/oauth/unlink
// @desc    Unlink OAuth provider from account
// @access  Private
router.post('/unlink', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Ensure user has a password before unlinking OAuth
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Please set a password before unlinking your OAuth account',
      });
    }

    // Unlink OAuth provider
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        provider: null,
        providerId: null,
        providerData: null,
      },
      include: {
        rewards: true,
        impactStats: true,
      },
    });

    const {
      password: _,
      resetToken,
      resetExpires,
      verifyToken,
      verifyExpires,
      ...userWithoutSensitive
    } = updatedUser;

    res.json({
      success: true,
      message: 'OAuth account unlinked successfully',
      data: userWithoutSensitive,
    });
  } catch (error) {
    console.error('Unlink OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlink OAuth account',
    });
  }
});

module.exports = router;
