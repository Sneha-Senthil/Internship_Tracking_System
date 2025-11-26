/**
 * Google Drive Authentication Configuration
 * 
 * This file centralizes the Google Drive API authentication configuration
 * using environment variables instead of a JSON key file.
 */

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Path to persisted OAuth token (refresh token)
const OAUTH_STORE = path.join(__dirname, '..', 'drive_oauth.json');

// Create JWT auth client using service account environment variables (existing behavior)
// const createServiceAccountAuth = () => {
//   try {
//     const auth = new google.auth.JWT(
//       process.env.GOOGLE_CLIENT_EMAIL,
//       null,
//       process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//       ['https://www.googleapis.com/auth/drive']
//     );

//     return auth;
//   } catch (error) {
//     console.error('Error creating Google Drive service-account auth client:', error);
//     throw error;
//   }
// };

// Create OAuth2 client for Drive using env vars
const createOAuth2Client = () => {
  const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) return null;

  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
};

// Attempt to load a refresh token from env or persisted file
const loadRefreshToken = () => {
  if (process.env.DRIVE_OAUTH_REFRESH_TOKEN) {
    return process.env.DRIVE_OAUTH_REFRESH_TOKEN;
  }

  try {
    if (fs.existsSync(OAUTH_STORE)) {
      const raw = fs.readFileSync(OAUTH_STORE, 'utf8');
      const obj = JSON.parse(raw || '{}');
      return obj.refresh_token || null;
    }
  } catch (err) {
    console.warn('Could not read OAuth store:', err.message);
  }

  return null;
};

const saveRefreshToken = (refreshToken) => {
  try {
    fs.writeFileSync(OAUTH_STORE, JSON.stringify({ refresh_token: refreshToken }, null, 2), { mode: 0o600 });
    console.log('✅ Saved Drive OAuth refresh token to', OAUTH_STORE);
    return true;
  } catch (err) {
    console.error('❌ Failed to save refresh token:', err);
    return false;
  }
};

// Create and export Google Drive client. Priority:
// 1) If OAuth client config is present and a refresh token exists -> use OAuth2 client
// 2) Else fallback to service account JWT client
const getDriveClient = (opts = {}) => {
  // Allow caller to pass an explicit refreshToken (e.g., per-user)
  const explicitRefresh = opts.refreshToken;

  const oauth2Client = createOAuth2Client();
  const refreshToken = explicitRefresh || loadRefreshToken();

  if (oauth2Client && refreshToken) {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  // Fallback to service account JWT
  const serviceAuth = createServiceAccountAuth();
  return google.drive({ version: 'v3', auth: serviceAuth });
};

module.exports = {
  createOAuth2Client,
  getDriveClient,
  saveRefreshToken,
  OAUTH_STORE,
};