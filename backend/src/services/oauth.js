/**
 * OAuth Service for ReBox
 * Handles Google and other OAuth provider authentication
 */

const { OAuth2Client } = require('google-auth-library');

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token and extract user info
 * @param {string} idToken - Google ID token from client
 * @returns {Object} User information from Google
 */
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return {
      provider: 'google',
      providerId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
      isVerified: payload.email_verified,
      providerData: {
        locale: payload.locale,
        givenName: payload.given_name,
        familyName: payload.family_name,
        hd: payload.hd, // hosted domain for Google Workspace
      },
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Invalid Google token');
  }
};

/**
 * Verify Google OAuth code and exchange for tokens
 * @param {string} code - Authorization code from Google
 * @param {string} redirectUri - Redirect URI used in OAuth flow
 * @returns {Object} User information from Google
 */
const verifyGoogleCode = async (code, redirectUri) => {
  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info using the access token
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`
    );
    const userInfo = await response.json();

    return {
      provider: 'google',
      providerId: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.picture,
      isVerified: userInfo.email_verified,
      providerData: {
        locale: userInfo.locale,
        givenName: userInfo.given_name,
        familyName: userInfo.family_name,
      },
      tokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date,
      },
    };
  } catch (error) {
    console.error('Google code verification error:', error);
    throw new Error('Failed to verify Google authorization code');
  }
};

/**
 * Generate Google OAuth URL for redirect
 * @param {string} redirectUri - Redirect URI after authentication
 * @param {string} state - State parameter for CSRF protection
 * @returns {string} Google OAuth URL
 */
const getGoogleAuthUrl = (redirectUri, state) => {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    state,
    prompt: 'consent',
  });
};

/**
 * Get OAuth provider configuration
 */
const getOAuthConfig = () => {
  return {
    google: {
      enabled: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      clientId: process.env.GOOGLE_CLIENT_ID,
    },
    // Add more providers here
    // facebook: {
    //   enabled: !!process.env.FACEBOOK_APP_ID,
    //   appId: process.env.FACEBOOK_APP_ID,
    // },
  };
};

module.exports = {
  verifyGoogleToken,
  verifyGoogleCode,
  getGoogleAuthUrl,
  getOAuthConfig,
};
