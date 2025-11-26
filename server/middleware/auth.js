const User = require("../models/User");

module.exports = function(req, res, next) {
  // Get user ID from session
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  // Find user by ID
  User.findById(userId)
    .then(user => {
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
      req.user = user;
      next();
    })
    .catch(err => {
      console.error("Auth middleware error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    });
}; 