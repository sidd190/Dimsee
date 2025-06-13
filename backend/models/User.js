// backend/models/User.js - User Model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId; // Only required if not using OAuth
    },
    minlength: 6
  },
  refreshToken: {
    type: String
  }, // For refreshtokens to generate new accesstokens
  googleId: String,
  githubId: String,
  authMethod: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  hasPassword: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false; // Can't login with password if none exists
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to set password for OAuth users
userSchema.methods.setPassword = async function(password) {
  this.password = password;
  this.hasPassword = true;
  await this.save();
};

// Method to check if user can use password login
userSchema.methods.canUsePasswordLogin = function() {
  return this.hasPassword;
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
