// backend/services/tokenDenylist.js - Refresh Token Revocation Denylist
const crypto = require('crypto');

class TokenDenylist {
  constructor() {
    // Map of tokenHash -> expiration timestamp (ms)
    this.denylist = new Map();
    // Prune expired entries every 15 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 15 * 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref(); // Prevent keeping Node event loop open in tests
    }
  }

  hash(token) {
    if (!token) return '';
    // If it's already a 64-char hex string, treat it as already hashed
    if (token.length === 64 && /^[a-f0-9]{64}$/i.test(token)) {
      return token;
    }
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  revoke(rawOrHashedToken, expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000) {
    const key = this.hash(rawOrHashedToken);
    if (key) {
      const exp = typeof expiresAt === 'number' ? expiresAt : new Date(expiresAt).getTime();
      this.denylist.set(key, exp);
    }
  }

  isRevoked(rawOrHashedToken) {
    const key = this.hash(rawOrHashedToken);
    if (!key) return false;
    const expiry = this.denylist.get(key);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.denylist.delete(key);
      return false;
    }
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.denylist.entries()) {
      if (now > expiry) {
        this.denylist.delete(key);
      }
    }
  }

  clear() {
    this.denylist.clear();
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Export singleton instance and class
const tokenDenylist = new TokenDenylist();

module.exports = { tokenDenylist, TokenDenylist };
