const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from parent directory's .env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Print OAuth configuration
console.log(`
📋 OAuth Configuration Check
===========================

Current Settings
---------------
Client ID: ${process.env.GOOGLE_OAUTH_CLIENT_ID?.substring(0, 15)}...
Redirect URI in .env: ${process.env.GOOGLE_OAUTH_REDIRECT_URI}

Test Info
---------
1. Go to Google Cloud Console:
   https://console.cloud.google.com/apis/credentials

2. Find your OAuth 2.0 Client ID and click edit

3. Make sure these EXACT URLs are in "Authorized redirect URIs":
   ${process.env.GOOGLE_OAUTH_REDIRECT_URI}
   http://localhost:5000/oauth/callback

4. Make sure these are in "Authorized JavaScript origins":
   http://localhost:5000
   http://localhost:3000

5. Current redirect URI from your .env:
   ${process.env.GOOGLE_OAUTH_REDIRECT_URI}
   - Protocol: ${new URL(process.env.GOOGLE_OAUTH_REDIRECT_URI).protocol}
   - Host: ${new URL(process.env.GOOGLE_OAUTH_REDIRECT_URI).host}
   - Path: ${new URL(process.env.GOOGLE_OAUTH_REDIRECT_URI).pathname}

❗Important
----------
- URIs must match EXACTLY (including http vs https, slashes, port)
- No trailing slashes unless specified
- Wait ~1 minute after saving changes in Google Console
- Check for any whitespace in the URIs

Need to update .env? Current value is:
GOOGLE_OAUTH_REDIRECT_URI=${process.env.GOOGLE_OAUTH_REDIRECT_URI}
`);

// Create an OAuth2 client to test configuration
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
);

// Generate auth URL to verify scopes
const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive']
});

console.log(`
🔗 Test Authorization URL
------------------------
${url}

To test:
1. Copy this URL
2. Open in browser
3. Should see Google consent screen
4. If you see redirect_uri_mismatch, compare the URI in the error message
   with your configured URI above
`);