const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');
const express = require('express');

// Load environment variables from parent directory's .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = 5000;

// Create OAuth2 client with the EXACT redirect URI from .env
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI  // Using the exact URI from .env
);

// Generate auth url with the correct redirect URI
const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive'],
    prompt: 'consent'  // Force consent screen to get refresh token
});

// Serve a simple HTML page with the auth link
app.get('/', (req, res) => {
    res.send(`
        <h1>Drive OAuth Test</h1>
        <p>Using redirect URI: ${process.env.GOOGLE_OAUTH_REDIRECT_URI}</p>
        <p><a href="${authUrl}">Start OAuth Flow</a></p>
    `);
});

// Handle the OAuth callback
app.get('/api/drive/oauth/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.status(400).send('No authorization code received');
    }

    try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        
        res.send(`
            <h1>Success!</h1>
            <p>Tokens received:</p>
            <pre>
DRIVE_OAUTH_ACCESS_TOKEN=${tokens.access_token}
DRIVE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}
            </pre>
            <p>Add the refresh token to your .env file</p>
        `);

        // Also log tokens to console
        console.log('\nOAuth flow successful! Add these tokens to your .env file:\n');
        console.log('DRIVE_OAUTH_ACCESS_TOKEN=' + tokens.access_token);
        console.log('DRIVE_OAUTH_REFRESH_TOKEN=' + tokens.refresh_token);
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
🔑 OAuth Test Server (Using .env URI)
===================================
Server running at: http://localhost:${PORT}

Current OAuth Settings:
- Client ID: ${process.env.GOOGLE_OAUTH_CLIENT_ID ? '✓ Set' : '✗ Missing'}
- Client Secret: ${process.env.GOOGLE_OAUTH_CLIENT_SECRET ? '✓ Set' : '✗ Missing'}
- Redirect URI: ${process.env.GOOGLE_OAUTH_REDIRECT_URI}

Test Steps:
1. Open http://localhost:${PORT} in your browser
2. Click the "Start OAuth Flow" link
3. Complete Google sign-in
4. You should be redirected back to /api/drive/oauth/callback
`);
});