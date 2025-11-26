const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");
const { getDriveClient, createOAuth2Client, saveRefreshToken } = require('../config/google-drive');

// Set up multer for file uploads
const upload = multer({ dest: path.join(__dirname, "../../uploads/") });


// OAuth endpoints to obtain and store a refresh token for Drive uploads.
// These are protected and intended for admin/teacher use only.
router.get('/oauth/url', auth, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ success: false, message: 'Access denied' });

  const oauth2 = createOAuth2Client();
  if (!oauth2) return res.status(500).json({ success: false, message: 'OAuth client not configured (set GOOGLE_OAUTH_CLIENT_ID/SECRET/REDIRECT_URI)' });

  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive'],
    prompt: 'consent'
  });

  res.json({ success: true, url });
});

// OAuth callback: exchange code for tokens and persist refresh_token
router.get('/oauth/callback', auth, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ success: false, message: 'Access denied' });
  const code = req.query.code;
  if (!code) return res.status(400).json({ success: false, message: 'Missing code parameter' });

  const oauth2 = createOAuth2Client();
  if (!oauth2) return res.status(500).json({ success: false, message: 'OAuth client not configured' });

  try {
    const { tokens } = await oauth2.getToken(code);
    // Persist refresh token if present
    if (tokens.refresh_token) {
      saveRefreshToken(tokens.refresh_token);
    }
    res.json({ success: true, tokens });
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).json({ success: false, message: 'Failed to exchange code', error: err.message });
  }
});

// Accept a refresh token via POST (admin convenience). Body: { refresh_token }
router.post('/token', auth, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ success: false, message: 'Access denied' });
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ success: false, message: 'refresh_token is required' });

  const ok = saveRefreshToken(refresh_token);
  if (!ok) return res.status(500).json({ success: false, message: 'Failed to save refresh token' });
  res.json({ success: true, message: 'Refresh token saved' });
});

// @route   POST api/drive/upload-excel
// @desc    Upload Excel file to Google Drive
// @access  Private (Teacher only)
router.post("/upload-excel", [auth, upload.single("file")], async (req, res) => {
  // Check if user is a teacher
  if (req.user.role !== "teacher") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const fileMetadata = {
      name: req.file.originalname,
      parents: [process.env.GOOGLE_DRIVE_MAIN_FOLDER],
    };

    const media = {
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      body: fs.createReadStream(req.file.path),
    };

    // Resolve a fresh drive client (this will prefer OAuth if configured)
    const drive = getDriveClient();
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
      // support Shared Drives when using OAuth/service account
      supportsAllDrives: true,
    });

    // Delete temp file after upload
    fs.unlinkSync(req.file.path);

    res.json({ success: true, fileId: file.data.id, message: "File uploaded successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "File upload failed", error: error.message });
  }
});

// @route   POST api/drive/create-folder
// @desc    Create a new folder in Google Drive
// @access  Private (Teacher only)
router.post("/create-folder", auth, async (req, res) => {
  // Check if user is a teacher
  if (req.user.role !== "teacher") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const folderMetadata = {
      name: req.body.folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [process.env.GOOGLE_DRIVE_MAIN_FOLDER],
    };

    // Resolve a fresh drive client (this will prefer OAuth if configured)
    const drive = getDriveClient();
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
      // support Shared Drives when using OAuth/service account
      supportsAllDrives: true,
    });

    res.json({ success: true, folderId: folder.data.id, message: "Folder created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create folder", error: error.message });
  }
});

module.exports = router;