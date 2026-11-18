// backend/models/User.js - User Model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    minlength: 8
  },
  refreshToken: {
    type: String,
    index: true
  }, // SHA-256 hash of active refresh token
  previousRefreshToken: {
    type: String
  }, // SHA-256 hash of immediately preceding refresh token for replay detection
  googleId: {
    type: String,
    sparse: true,
    index: true
  },
  githubId: {
    type: String,
    sparse: true,
    index: true
  },
  authMethod: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  hasPassword: {
    type: Boolean,
    default: true
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
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to set password for OAuth users
userSchema.methods.setPassword = async function(password) {
  this.password = password;
  this.hasPassword = true;
  this.refreshToken = null; // Revoke existing refresh token on credential change
  await this.save();
};

// Method to check if user can use password login
userSchema.methods.canUsePasswordLogin = function() {
  return this.hasPassword;
};

// Hash a raw refresh token using SHA-256 for secure at-rest storage
userSchema.statics.hashToken = function(token) {
  if (!token) return null;
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Set and hash the refresh token, rotating existing token into previousRefreshToken
userSchema.methods.setRefreshToken = async function(rawToken) {
  if (!rawToken) {
    this.previousRefreshToken = null;
    this.refreshToken = null;
  } else {
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    if (this.refreshToken && this.refreshToken !== hash) {
      this.previousRefreshToken = this.refreshToken;
    }
    this.refreshToken = hash;
  }
  if (typeof this.save === 'function' && (!this.db || this.db.readyState === 1)) {
    await this.save({ validateBeforeSave: false });
  }
};

// Constant-time verification of active refresh token
userSchema.methods.verifyRefreshToken = function(rawToken) {
  if (!this.refreshToken || !rawToken) return false;
  const incomingHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  if (this.refreshToken.length === 64) {
    const storedBuf = Buffer.from(this.refreshToken, 'utf8');
    const incomingBuf = Buffer.from(incomingHash, 'utf8');
    if (storedBuf.length === incomingBuf.length && crypto.timingSafeEqual(storedBuf, incomingBuf)) {
      return true;
    }
  }

  // Fallback for legacy unhashed tokens
  const legacyStored = Buffer.from(this.refreshToken, 'utf8');
  const incoming = Buffer.from(rawToken, 'utf8');
  if (legacyStored.length === incoming.length && crypto.timingSafeEqual(legacyStored, incoming)) {
    return true;
  }
  return false;
};

// Constant-time verification of previously rotated refresh token for replay detection
userSchema.methods.verifyPreviousRefreshToken = function(rawToken) {
  if (!this.previousRefreshToken || !rawToken) return false;
  const incomingHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  if (this.previousRefreshToken.length === 64) {
    const storedBuf = Buffer.from(this.previousRefreshToken, 'utf8');
    const incomingBuf = Buffer.from(incomingHash, 'utf8');
    if (storedBuf.length === incomingBuf.length && crypto.timingSafeEqual(storedBuf, incomingBuf)) {
      return true;
    }
  }

  // Fallback for legacy unhashed
  const legacyStored = Buffer.from(this.previousRefreshToken, 'utf8');
  const incoming = Buffer.from(rawToken, 'utf8');
  if (legacyStored.length === incoming.length && crypto.timingSafeEqual(legacyStored, incoming)) {
    return true;
  }
  return false;
};

// Invalidate all tokens for user across devices
userSchema.methods.revokeAllRefreshTokens = async function() {
  this.refreshToken = null;
  this.previousRefreshToken = null;
  if (typeof this.save === 'function' && (!this.db || this.db.readyState === 1)) {
    await this.save({ validateBeforeSave: false });
  }
};

// Remove password and token hashes from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.previousRefreshToken;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
