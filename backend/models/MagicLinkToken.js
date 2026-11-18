// backend/models/MagicLinkToken.js
// Stores one-time magic-link tokens with an automatic TTL index.

'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');

const magicLinkTokenSchema = new mongoose.Schema({
  // The raw token stored hashed so a DB leak can't be used to sign in.
  tokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  // MongoDB TTL index — the document is automatically removed after expiresAt.
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // 0 = expire at the value stored in expiresAt
  },
}, { timestamps: true });

/**
 * Hash a plain-text token before storing / querying.
 * @param {string} token
 * @returns {string}
 */
magicLinkTokenSchema.statics.hashToken = function (token) {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Create a new signed token document.
 * @param {string} userId
 * @param {string} email
 * @param {number} [ttlSeconds=900] - Defaults to 15 minutes.
 * @returns {{ doc: MagicLinkToken, rawToken: string }}
 */
magicLinkTokenSchema.statics.createToken = async function (userId, email, ttlSeconds = 900) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = this.hashToken(rawToken);
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  const doc = await this.create({ tokenHash, userId, email, expiresAt });
  return { doc, rawToken };
};

const MagicLinkToken = mongoose.model('MagicLinkToken', magicLinkTokenSchema);

module.exports = MagicLinkToken;
