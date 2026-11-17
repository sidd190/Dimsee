const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Real User model for schema method testing
const User = require('../models/User');
const { tokenDenylist } = require('../services/tokenDenylist');
const authRoutes = require('../routes/auth');

describe('Hardened Refresh Token Rotation, Hashing, Replay Detection & Revocation (Issue #104)', () => {
  beforeEach(() => {
    tokenDenylist.clear();
  });

  describe('User Model Hashing & Rotation Methods', () => {
    it('stores refresh tokens as SHA-256 hex hashes and never plaintext', async () => {
      const user = new User({
        username: 'alice',
        email: 'alice@example.com',
        password: 'ValidPassword123'
      });

      const rawToken = 'header.payload.signature-refresh-token';
      await user.setRefreshToken(rawToken);

      expect(user.refreshToken).not.toBe(rawToken);
      expect(user.refreshToken).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(user.refreshToken)).toBe(true);

      const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      expect(user.refreshToken).toBe(expectedHash);
    });

    it('verifies valid refresh token and rejects invalid token', async () => {
      const user = new User({
        username: 'alice',
        email: 'alice@example.com',
        password: 'ValidPassword123'
      });

      const rawToken = 'correct-token-string';
      await user.setRefreshToken(rawToken);

      expect(user.verifyRefreshToken(rawToken)).toBe(true);
      expect(user.verifyRefreshToken('wrong-token-string')).toBe(false);
      expect(user.verifyRefreshToken('')).toBe(false);
    });

    it('rotates active token into previousRefreshToken for replay tracking', async () => {
      const user = new User({
        username: 'alice',
        email: 'alice@example.com',
        password: 'ValidPassword123'
      });

      const token1 = 'first-token-generation';
      const token2 = 'second-token-generation';

      await user.setRefreshToken(token1);
      const hash1 = user.refreshToken;
      expect(user.previousRefreshToken).toBeUndefined();

      await user.setRefreshToken(token2);
      const hash2 = user.refreshToken;

      expect(user.refreshToken).toBe(hash2);
      expect(user.previousRefreshToken).toBe(hash1);

      expect(user.verifyRefreshToken(token2)).toBe(true);
      expect(user.verifyRefreshToken(token1)).toBe(false);
      expect(user.verifyPreviousRefreshToken(token1)).toBe(true);
      expect(user.verifyPreviousRefreshToken(token2)).toBe(false);
    });

    it('clears all active and rotated tokens on revokeAllRefreshTokens', async () => {
      const user = new User({
        username: 'alice',
        email: 'alice@example.com',
        password: 'ValidPassword123'
      });

      await user.setRefreshToken('token1');
      await user.setRefreshToken('token2');
      expect(user.refreshToken).toBeDefined();
      expect(user.previousRefreshToken).toBeDefined();

      await user.revokeAllRefreshTokens();
      expect(user.refreshToken).toBeNull();
      expect(user.previousRefreshToken).toBeNull();
      expect(user.verifyRefreshToken('token2')).toBe(false);
      expect(user.verifyPreviousRefreshToken('token1')).toBe(false);
    });

    it('strips refreshToken and previousRefreshToken from JSON output', async () => {
      const user = new User({
        username: 'alice',
        email: 'alice@example.com',
        password: 'ValidPassword123'
      });

      await user.setRefreshToken('secret-token-value');
      const json = user.toJSON();

      expect(json.password).toBeUndefined();
      expect(json.refreshToken).toBeUndefined();
      expect(json.previousRefreshToken).toBeUndefined();
      expect(json.username).toBe('alice');
      expect(json.email).toBe('alice@example.com');
    });
  });

  describe('Route-Level Token Rotation, Replay Detection & Revocation', () => {
    let app;
    let mockUser;
    const jwtRefreshSecret = 'super-secure-refresh-secret-dimsee-2026';
    const jwtSecret = 'super-secure-access-secret-dimsee-2026';

    beforeEach(() => {
      mockUser = {
        _id: '507f191e810c19729de860ea',
        id: '507f191e810c19729de860ea',
        username: 'securitytest',
        email: 'sec@example.com',
        refreshToken: null,
        previousRefreshToken: null,
        setRefreshToken: jest.fn(async function(rawToken) {
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
        }),
        verifyRefreshToken: jest.fn(function(rawToken) {
          if (!this.refreshToken || !rawToken) return false;
          const incomingHash = crypto.createHash('sha256').update(rawToken).digest('hex');
          return this.refreshToken === incomingHash;
        }),
        verifyPreviousRefreshToken: jest.fn(function(rawToken) {
          if (!this.previousRefreshToken || !rawToken) return false;
          const incomingHash = crypto.createHash('sha256').update(rawToken).digest('hex');
          return this.previousRefreshToken === incomingHash;
        }),
        revokeAllRefreshTokens: jest.fn(async function() {
          this.refreshToken = null;
          this.previousRefreshToken = null;
        }),
        toJSON: () => ({ id: '507f191e810c19729de860ea', username: 'securitytest' })
      };

      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      app = express();
      app.use(express.json());
      app.use(cookieParser());
      app.use(session({ secret: 'test-session', resave: false, saveUninitialized: false }));

      app.locals.authConfig = {
        enableOAuth: false,
        corsOrigin: 'https://app.example.com',
        jwtSecret,
        jwtExpiry: '15m',
        jwtRefreshSecret,
        jwtRefreshExpiry: '7d',
        cookieMaxAge: 604800000
      };

      app.use((req, res, next) => {
        req.isAuthenticated = () => true;
        req.logout = (cb) => cb(null);
        req.user = mockUser;
        next();
      });

      app.use('/api/auth', authRoutes);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('rotates refresh token and returns new access and refresh tokens', async () => {
      const initialToken = jwt.sign({ userId: mockUser.id }, jwtRefreshSecret, { expiresIn: '7d' });
      await mockUser.setRefreshToken(initialToken);

      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: initialToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.refreshToken).not.toBe(initialToken);

      // Old token should now be denylisted
      expect(tokenDenylist.isRevoked(initialToken)).toBe(true);
    });

    it('detects replay attack when a previously rotated token is re-submitted', async () => {
      const tokenA = jwt.sign({ userId: mockUser.id, nonce: 'nonce-a' }, jwtRefreshSecret, { expiresIn: '7d' });
      const tokenB = jwt.sign({ userId: mockUser.id, nonce: 'nonce-b' }, jwtRefreshSecret, { expiresIn: '7d' });

      // Simulate prior rotation from Token A to Token B
      await mockUser.setRefreshToken(tokenA);
      await mockUser.setRefreshToken(tokenB);

      // Attacker replays Token A
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: tokenA });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Refresh token reuse detected');

      // Crucial: all active sessions for this user must be terminated
      expect(mockUser.revokeAllRefreshTokens).toHaveBeenCalled();
      expect(tokenDenylist.isRevoked(tokenA)).toBe(true);
    });

    it('rejects a revoked token immediately via the denylist', async () => {
      const activeToken = jwt.sign({ userId: mockUser.id }, jwtRefreshSecret, { expiresIn: '7d' });
      await mockUser.setRefreshToken(activeToken);

      // Revoke token server-side
      tokenDenylist.revoke(activeToken);

      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: activeToken });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('revoked');
    });

    it('clears user refresh token in DB and denylists token on /signout', async () => {
      const activeToken = jwt.sign({ userId: mockUser.id }, jwtRefreshSecret, { expiresIn: '7d' });
      await mockUser.setRefreshToken(activeToken);

      const res = await request(app)
        .post('/api/auth/signout')
        .send({ refreshToken: activeToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockUser.revokeAllRefreshTokens).toHaveBeenCalled();
      expect(tokenDenylist.isRevoked(activeToken)).toBe(true);
    });

    it('revokes tokens via dedicated /revoke-token endpoint', async () => {
      const activeToken = jwt.sign({ userId: mockUser.id }, jwtRefreshSecret, { expiresIn: '7d' });
      await mockUser.setRefreshToken(activeToken);

      const res = await request(app)
        .post('/api/auth/revoke-token')
        .send({ refreshToken: activeToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('revoked');
      expect(tokenDenylist.isRevoked(activeToken)).toBe(true);
    });
  });
});
