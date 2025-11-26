const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

async function updatePasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);

    // Update each user's password
    for (const user of users) {
      // Skip if password is already hashed (starts with $2b$)
      if (user.password.startsWith('$2b$')) {
        console.log(`Skipping ${user.username} - password already hashed`);
        continue;
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      // Update the user
      user.password = hashedPassword;
      await user.save();
      console.log(`Updated password for ${user.username}`);
    }

    console.log('All passwords updated successfully');
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updatePasswords(); 