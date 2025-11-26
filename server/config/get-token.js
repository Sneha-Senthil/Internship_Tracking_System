const { google } = require('googleapis');
require('dotenv').config({ path: '../.env' });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('Authorize this app by visiting this url:\n', authUrl);

(async () => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question('\nEnter the code from that page here: ', async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\nTokens:', tokens);
    console.log('\nAdd this to your .env as:');
    console.log(`DRIVE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
    readline.close();
  });
})();
