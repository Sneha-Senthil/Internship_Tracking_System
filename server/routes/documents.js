const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { exec } = require('child_process');
const auth = require('../middleware/auth');
const User = require('../models/User');
const xlsx = require('xlsx');
const { spawn } = require('child_process');
const { getDriveClient } = require('../config/google-drive');

// Set up multer for file uploads
const upload = multer({ dest: path.join(__dirname, '../../uploads/') });

// Do not instantiate a Drive client at module load time. Call getDriveClient()
// inside handlers so newly saved OAuth refresh tokens are picked up.

// Document classification keywords
const documentTypes = [
  { type: 'Permission Letter', keywords: ['Permission Letter'] },
  { type: 'Offer Letter', keywords: ['Offer Letter'] },
  { type: 'Completion Certificate', keywords: ['Completion Certificate'] },
  { type: 'Student Feedback', keywords: ['Student Feedback'] },
  { type: 'Employee Feedback', keywords: ['Employee Feedback'] },
  { type: 'Internship Report', keywords: ['Internship Report'] },
  { type: 'Resume', keywords: ['Resume', 'Curriculum Vitae', 'CV'] },
];

// Extract text using Python script
const extractTextFromDocument = (filePath) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(
      __dirname,
      '../scripts/extract_text.py'
    );
    console.log(`Executing script at: ${scriptPath}`);
    const pythonPath = path.resolve(__dirname, '../venv/bin/python');
    exec(`"${pythonPath}" "${scriptPath}" "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`OCR Error: ${stderr}`);
        reject('OCR extraction failed');
      } else {
        resolve(stdout.trim());
      }
    });
  });
};

// Classify document type
const classifyDocumentType = (extractedText) => {
  console.log('Classifying document with text:', extractedText);

  for (const doc of documentTypes) {
    const matches = doc.keywords.filter((keyword) =>
      extractedText.toLowerCase().includes(keyword.toLowerCase())
    );

    if (matches.length > 0) {
      console.log(
        `Document classified as: ${doc.type} (matched keywords: ${matches.join(
          ', '
        )})`
      );
      return doc.type;
    }
  }

  console.log('Document could not be classified, using default type');
  return 'Unknown Document';
};


// @route   POST api/documents/upload
// @desc    Upload documents to Google Drive
// @access  Public
router.post('/upload', [upload.array('files')], async (req, res) => {
  try {
    const username = req.body.username;
    if (!username) {
      return res
        .status(400)
        .json({ success: false, message: 'Username is required' });
    }

    // Get user's folder ID
    const user = await User.findOne({ username });
    if (!user || !user.folderId) {
      return res
        .status(400)
        .json({ success: false, message: 'User folder not found' });
    }

    const folderId = user.folderId;
    const regSuffix = username.slice(-4);

    let uploadedFiles = [];

    for (const file of req.files) {
      const filePath = path.resolve(file.path);
      let extractedText = '';

      try {
        extractedText = await extractTextFromDocument(filePath);
      } catch (err) {
        console.error(`Text extraction failed for ${file.originalname}:`, err);
      }

      let docType = req.body.docType;
      let extension = path.extname(file.originalname);
      let renamedFile = `${regSuffix}-${req.body.companyName}-${docType}${extension}`;

      const fileMetadata = {
        name: renamedFile,
        parents: [folderId],
      };

      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(filePath),
      };

      try {
        // Resolve a fresh drive client (this will prefer OAuth if configured)
        const drive = getDriveClient();
        const uploadedFile = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id,name,webViewLink',
          // support Shared Drives when using OAuth/service account
          supportsAllDrives: true,
        });

        uploadedFiles.push({
          fileId: uploadedFile.data.id,
          fileName: uploadedFile.data.name,
          webViewLink: uploadedFile.data.webViewLink,
        });

        // Clean up the temporary file
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to upload ${file.originalname}:`, err);
        // Clean up the temporary file even if upload fails
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw err;
      }
    }

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      uploadedFiles,
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: err.message,
    });
  }
});

// Load Google Drive credentials
const USERS_FILE = path.join(__dirname, '../../users.json');

// Helper function to get user's folder ID
const getUserFolderId = (username) => {
  if (!fs.existsSync(USERS_FILE)) return null;
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  const user = users.find((user) => user.username === username);
  return user ? user.folderId : null;
};

// Helper function to download file from Drive
const downloadFile = async (fileId) => {
  // When downloading from a Shared Drive, include supportsAllDrives
  // Resolve a fresh drive client and download. Include supportsAllDrives for Shared Drives.
  const drive = getDriveClient();
  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream' }
  );

  const tempPath = path.join(__dirname, '../../uploads', `${fileId}.pdf`);
  const writer = fs.createWriteStream(tempPath);

  return new Promise((resolve, reject) => {
    res.data
      .pipe(writer)
      .on('finish', () => resolve(tempPath))
      .on('error', reject);
  });
};

// Helper function to extract text from PDF
const extractTextFromPDF = (pdfPath) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '../scripts/extract_text.py');
    const pythonPath = path.resolve(__dirname, '../venv/bin/python');
    const pythonProcess = spawn(pythonPath, [
      scriptPath,
      pdfPath,
    ]);
    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${error}`));
      } else {
        resolve(output.trim());
      }
    });
  });
};

// Helper function to verify document content
const verifyDocument = (text, keywords, docType, companyName) => {
  console.log('Verifying document with keywords:', keywords);
  console.log('Extracted text:', text);
  console.log('Document type:', docType);
  console.log('Company name:', companyName);

  const lowerText = text.toLowerCase();
  
  // First verify document type keywords
  const docTypeKeywords = keywords.filter(k => 
    !k.toLowerCase().includes(companyName.toLowerCase())
  );
  
  // Check if ANY of the document type keywords are found
  const docTypeVerified = docTypeKeywords.some(keyword => {
    const found = lowerText.includes(keyword.toLowerCase());
    console.log(`Document type keyword "${keyword}": ${found ? 'found' : 'not found'}`);
    return found;
  });

  // Then verify company name if provided
  let companyVerified = false;
  if (companyName) {
    companyVerified = lowerText.includes(companyName.toLowerCase());
    console.log(`Company name "${companyName}": ${companyVerified ? 'found' : 'not found'}`);
  }

  // Log overall verification result
  console.log('Verification results:', {
    docTypeVerified,
    companyVerified,
    overallVerified: docTypeVerified && (companyVerified || !companyName)
  });

  return docTypeVerified && (companyVerified || !companyName);
};

// @route   POST api/documents/verify
// @desc    Verify document content
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const { fileId, docType, keywords } = req.body;
    console.log('Verifying document:', { fileId, docType, keywords });

    // Download the file from Drive
    const pdfPath = await downloadFile(fileId);
    console.log('File downloaded to:', pdfPath);

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(pdfPath);
    console.log('Text extracted from PDF');

    // Verify the content
    const verified = verifyDocument(extractedText, keywords, docType, req.body.companyName);
    console.log('Verification result:', verified);

    // Clean up temp file
    fs.unlinkSync(pdfPath);
    console.log('Temporary file cleaned up');

    // Update Excel file with verification status
    const excelPath = path.join('/home/qwerty/Desktop/InternTrack/student_data.xlsx');
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log('username', req.body.username);
    console.log('companyName', req.body.companyName);
    // Find and update the internship record
    const internshipIndex = data.findIndex(
      (item) =>
        item['Register No'] === req.body.username &&
        item['Company Name'] === req.body.companyName
    );

    if (internshipIndex !== -1) {
      data[internshipIndex][docType] = verified ? 'Yes' : 'No';

      // Write back to Excel
      const worksheet = xlsx.utils.json_to_sheet(data);
      workbook.Sheets[sheetName] = worksheet;
      xlsx.writeFile(workbook, excelPath);
      console.log('Excel file updated');
    } else {
      console.log('Internship record not found in Excel');
    }

    // If verification failed, we need to determine why and rename accordingly
    if (!verified) {
      // Check document type keywords separately
      const docTypeKeywords = keywords.filter(k => 
        !k.toLowerCase().includes(req.body.companyName.toLowerCase())
      );
      const docTypeVerified = docTypeKeywords.some(keyword => 
        extractedText.toLowerCase().includes(keyword.toLowerCase())
      );

      let newFileName;
      if (docTypeVerified) {
        // Document type matches but company doesn't - keep the doc type in name
        const regSuffix = req.body.username.slice(-4);
        newFileName = `${regSuffix}-${docType}.pdf`;
        console.log('Document type verified but company mismatch. Renaming with document type.');
      } else {
        // No keywords match at all - mark as unknown document
        newFileName = 'Unknown Document.pdf';
        console.log('No document type keywords found. Marking as unknown document.');
      }

      const drive = getDriveClient();
      await drive.files.update({
        fileId: fileId,
        resource: { name: newFileName },
        // ensure update works on files located in Shared Drives
        supportsAllDrives: true,
      });

      console.log(`File renamed to: ${newFileName}`);
    }

    res.json({
      success: true,
      verified,
      message: verified
        ? 'Document verified successfully'
        : 'Document verification failed',
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying document',
      error: error.message,
    });
  }
});

module.exports = router;
