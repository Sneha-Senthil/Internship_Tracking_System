const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDriveClient, createOAuth2Client } = require('../config/google-drive');

// Set up multer for test uploads
const upload = multer({ dest: path.join(__dirname, '../../uploads/') });

// Debug endpoint to check Drive client auth status
router.get('/auth-check', async (req, res) => {
  try {
    console.log('=== Drive Auth Check ===');

    // Check OAuth2 config
    const oauth2 = createOAuth2Client();
    console.log('OAuth2 client configured:', !!oauth2);
    if (oauth2) {
      console.log('OAuth2 config present:', {
        clientId: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: !!process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
        refreshToken: !!process.env.DRIVE_OAUTH_REFRESH_TOKEN,
      });
    }

    // Get Drive client and test a simple list operation
    const drive = getDriveClient();
    console.log('Drive client created');

    // Try to list files in the main folder (catches auth issues)
    const result = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_MAIN_FOLDER}' in parents`,
      pageSize: 1,
      supportsAllDrives: true,
      fields: 'files(id,name)',
    });

    console.log('List operation succeeded:', {
      filesFound: result.data.files.length,
      mainFolder: process.env.GOOGLE_DRIVE_MAIN_FOLDER
    });

    res.json({
      success: true,
      oauth2Configured: !!oauth2,
      driveClientCreated: !!drive,
      listOperationSuccess: true,
      filesFound: result.data.files.length
    });
  } catch (error) {
    console.error('Auth check error:', {
      message: error.message,
      response: error.response?.data,
      code: error.code,
    });

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || error.errors,
      code: error.code
    });
  }
});

// Simple upload test endpoint
router.post('/upload-test', upload.single('file'), async (req, res) => {
  try {
    console.log('=== Upload Test ===');
    console.log('File received:', req.file);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const drive = getDriveClient();
    console.log('Drive client created');

    // Upload to a test folder in the main directory
    const fileMetadata = {
      name: `test-${Date.now()}-${req.file.originalname}`,
      parents: [process.env.GOOGLE_DRIVE_MAIN_FOLDER],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    console.log('Attempting upload:', fileMetadata);
    const uploadedFile = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,name,webViewLink',
      supportsAllDrives: true,
    });

    console.log('Upload succeeded:', uploadedFile.data);

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      file: uploadedFile.data,
      message: 'Test upload successful'
    });
  } catch (error) {
    console.error('Upload test error:', {
      message: error.message,
      response: error.response?.data,
      code: error.code,
    });

    // Clean up temp file even if upload fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || error.errors,
      code: error.code
    });
  }
});

module.exports = router;