const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const net = require('net');

// Load environment variables from parent directory's .env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import test routes
const uploadTestRoutes = require('./upload-test');

// Mount test routes at /api/test
app.use('/api/test', uploadTestRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Test server error:', err);
  res.status(500).json({
    success: false,
    error: err.message,
    details: err.response?.data || err.errors,
    code: err.code
  });
});

// Function to find an available port
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port in use, try next port
        server.listen(++startPort);
      } else {
        reject(err);
      }
    });

    server.on('listening', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });

    server.listen(startPort);
  });
};

// Start test server with port finding
const startServer = async () => {
  try {
    // Try ports starting from TEST_PORT or 5001
    const startPort = process.env.TEST_PORT || 5001;
    const port = await findAvailablePort(startPort);
    
    app.listen(port, () => {
      console.log(`
🧪 Drive Upload Test Server
==========================
- Test server running on port ${port}
- Environment loaded from: ${path.join(__dirname, '../.env')}
- Available routes:
  GET  /api/test/auth-check   Test Drive authentication
  POST /api/test/upload-test  Test file upload to Drive

Environment Status:
- OAuth Client ID: ${process.env.GOOGLE_OAUTH_CLIENT_ID ? '✓ Set' : '✗ Missing'}
- OAuth Client Secret: ${process.env.GOOGLE_OAUTH_CLIENT_SECRET ? '✓ Set' : '✗ Missing'}
- OAuth Redirect URI: ${process.env.GOOGLE_OAUTH_REDIRECT_URI ? '✓ Set' : '✗ Missing'}
- Drive Main Folder: ${process.env.GOOGLE_DRIVE_MAIN_FOLDER ? '✓ Set' : '✗ Missing'}
- OAuth Refresh Token: ${process.env.DRIVE_OAUTH_REFRESH_TOKEN ? '✓ Set' : '✗ Missing'}
- Service Account Present: ${process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY ? '✓ Yes' : '✗ No'}

${!process.env.DRIVE_OAUTH_REFRESH_TOKEN ? `
⚠️ OAuth Refresh Token Missing
-----------------------------
To get a refresh token:
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create an OAuth 2.0 Client ID if you haven't already
3. Use the OAuth 2.0 Playground (https://developers.google.com/oauthplayground):
   - Click the gear icon (settings) and check "Use your own OAuth credentials"
   - Enter your OAuth Client ID and Secret
   - Select and authorize Drive API v3 scope: https://www.googleapis.com/auth/drive
   - Exchange authorization code for tokens
   - Copy the refresh token to your .env file as DRIVE_OAUTH_REFRESH_TOKEN` : ''}

📋 Test Commands
-------------
1. Check auth status (run this first):
   curl http://localhost:${port}/api/test/auth-check

   If this fails:
   - Check that all environment variables above are set
   - Make sure your OAuth Client has the right redirect URI
   - Verify your refresh token is valid

2. Upload a simple test file:
   curl -F "file=@\"test.txt\"" http://localhost:${port}/api/test/upload-test

3. Upload PDF with spaces in filename:
   curl -F "file=@\"boom company employer feedback.pdf\"" http://localhost:${port}/api/test/upload-test
`);
    });
  } catch (err) {
    console.error('Failed to start test server:', err);
    process.exit(1);
  }
};

// Start the server
startServer();