const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
);

// List OAuth2 scopes we need
const REQUIRED_SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file'
];

// Generate test auth URL with both scopes
const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: REQUIRED_SCOPES,
    prompt: 'consent'
});

console.log(`
🔍 OAuth Configuration Check
===========================

Project Settings
---------------
Client ID: ${process.env.GOOGLE_OAUTH_CLIENT_ID}
Project Number: ${process.env.GOOGLE_OAUTH_CLIENT_ID.split('-')[0]}

Required Setup
-------------
1. Enable APIs
   https://console.cloud.google.com/apis/library/drive.googleapis.com
   - Make sure Google Drive API is enabled

2. OAuth Consent Screen
   https://console.cloud.google.com/apis/credentials/consent
   - Publishing Status should be either:
     * "Testing" with your email added as test user
     * "Published" for production use
   - Scopes needed:
     * ${REQUIRED_SCOPES.join('\n     * ')}

3. OAuth Client ID
   https://console.cloud.google.com/apis/credentials
   - Type: Web application
   - Authorized redirect URI:
     ${process.env.GOOGLE_OAUTH_REDIRECT_URI}

4. Test Auth URL (requires all above configured)
   ${authUrl}

Next Steps
----------
1. Open the Test Auth URL above in your browser
2. You should see the OAuth consent screen
3. If you see "access_denied":
   - Check if you're using a test user email
   - Verify Drive API is enabled
   - Ensure scopes are properly configured

Need to verify Drive API directly?
https://console.cloud.google.com/apis/api/drive.googleapis.com/metrics?project=${process.env.GOOGLE_OAUTH_CLIENT_ID.split('-')[0]}
`);

// Also check if we can access the Drive API
const drive = google.drive({ version: 'v3', auth: oauth2Client });
drive.about.get({ fields: 'user' })
    .then(() => console.log('✓ Drive API access test successful'))
    .catch(err => console.log('✗ Drive API test failed:', err.message));