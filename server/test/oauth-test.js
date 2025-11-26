const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const { default: open } = require('open');

// Load environment variables from parent directory's .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = 5000;

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    'http://localhost:5000/oauth/callback'  // Simplified redirect URI for testing
);

// Generate auth url
const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive'],
    prompt: 'consent'  // Force consent screen to get refresh token
});

app.get('/', (req, res) => {
    console.log('\nClick this URL to start the OAuth flow:');
    console.log(authUrl);
    res.send(`
        <h1>Drive OAuth Test</h1>
        <p>Click the button below to start OAuth flow:</p>
        <button onclick="window.location.href='${authUrl}'">Start OAuth Flow</button>
        
        <h2>Debug Info:</h2>
        <pre>
Client ID: ${process.env.GOOGLE_OAUTH_CLIENT_ID?.substring(0, 8)}...
Redirect URI: http://localhost:5000/oauth/callback
        </pre>
    `);
});

app.get('/oauth/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.status(400).send('No authorization code received');
    }

    try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        
        console.log('\nOAuth flow successful! Add these tokens to your .env file:\n');
        console.log('DRIVE_OAUTH_ACCESS_TOKEN=' + tokens.access_token);
        console.log('DRIVE_OAUTH_REFRESH_TOKEN=' + tokens.refresh_token);
        console.log('\nRefresh token is what you need for long-term access.');
        
        res.send(`
            <h1>Success!</h1>
            <p>Check the console for your tokens.</p>
            <p>Add the refresh token to your .env file as DRIVE_OAUTH_REFRESH_TOKEN</p>
            
            <h2>Your Tokens:</h2>
            <pre>
DRIVE_OAUTH_ACCESS_TOKEN=${tokens.access_token}
DRIVE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}
            </pre>
        `);
    } catch (err) {
        console.error('Error exchanging code for tokens:', err);
        res.status(500).send(`
            <h1>Error</h1>
            <pre>${err.message}</pre>
            <h2>Full Error:</h2>
            <pre>${JSON.stringify(err.response?.data || err, null, 2)}</pre>
        `);
    }
});

app.listen(PORT, () => {
    console.log(`
🔑 OAuth Test Server
===================
1. Server running on http://localhost:${PORT}
2. Make sure these are set in your Google Cloud Console:
   - Authorized redirect URIs:
     http://localhost:5000/oauth/callback
   - Authorized JavaScript origins:
     http://localhost:5000

Your current OAuth settings:
- Client ID: ${process.env.GOOGLE_OAUTH_CLIENT_ID ? '✓ Set' : '✗ Missing'}
- Client Secret: ${process.env.GOOGLE_OAUTH_CLIENT_SECRET ? '✓ Set' : '✗ Missing'}

Opening browser to start OAuth flow...
    `);
    
    // Open the browser to start the flow
    open('http://localhost:5000');
});