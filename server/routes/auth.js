const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const { getDriveClient } = require('../config/google-drive');


// Create a user folder in Google Drive
const createUserFolder = async (username) => {
  try {
    const folderMetadata = {
      name: username,
      mimeType: "application/vnd.google-apps.folder",
      parents: [process.env.GOOGLE_DRIVE_MAIN_FOLDER],
    };

    const drive = getDriveClient();
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
      // Support Shared Drives when using OAuth/service account (service account
      // must be a member of the shared drive defined by env var)
      supportsAllDrives: true,
    });

    console.log("✅ Folder created:", folder.data.id);
    return folder.data.id;
  } catch (error) {
    // Log the detailed error from Google API if available
    console.error("❌ Error creating folder:", error.response?.data || error.errors || error.message);
    return null;
  }
};

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    console.log("=== Registration Attempt ===");
    console.log("Request body:", req.body);

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("User already exists:", username);
      return res.json({ success: false, message: "User already exists!" });
    }

    // Create Google Drive folder
    console.log("Creating Google Drive folder for:", username);
    const folderId = await createUserFolder(username);
    if (!folderId) {
      console.log("Failed to create Google Drive folder");
      return res.json({ success: false, message: "Failed to create Google Drive folder!" });
    }
    console.log("Google Drive folder created with ID:", folderId);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Password hashed successfully");

    // Create user with hashed password
    console.log("Creating new user in MongoDB");
    const newUser = new User({ 
      username, 
      password: hashedPassword, // Store hashed password
      role, 
      folderId 
    });
    console.log("User object to save:", { ...newUser._doc, password: "[HIDDEN]" });
    
    try {
      await newUser.save();
      console.log("User successfully saved to MongoDB");
    } catch (saveError) {
      console.error("Error saving user to MongoDB:", saveError);
      throw saveError;
    }

    res.json({ 
      success: true, 
      message: "Registration successful!", 
      user: {
        username: newUser.username,
        role: newUser.role,
        folderId: newUser.folderId
      }
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.json({ success: false, message: "Registration failed!" });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user
// @access  Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  console.log("=== Login Attempt ===");
  console.log("Request body:", req.body);
  console.log("Username:", username);

  try {
    // First check if user exists
    const user = await User.findOne({ username });
    console.log("=== Database Query ===");
    console.log("User found:", user ? "Yes" : "No");
    
    if (user) {
      console.log("=== User Details ===");
      console.log("Username:", user.username);
      console.log("Stored password type:", typeof user.password);
      console.log("Stored password length:", user.password.length);
      
      // Compare password with hashed password in database
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (isMatch) {
        console.log("=== Login Success ===");
        res.json({ 
          success: true, 
          user: {
            username: user.username,
            role: user.role,
            folderId: user.folderId
          }
        });
      } else {
        console.log("=== Login Failed - Invalid Password ===");
        console.log("Password comparison failed");
        res.json({ success: false, message: "Invalid credentials!" });
      }
    } else {
      console.log("=== Login Failed - User Not Found ===");
      res.json({ success: false, message: "Invalid credentials!" });
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    res.json({ success: false, message: "Login failed!" });
  }
});

module.exports = router;