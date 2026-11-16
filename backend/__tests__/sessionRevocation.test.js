const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');

jest.mock('../models/User', () => {
  const User = jest.fn();
  User.findById = jest.fn();
  return User;
});

const User = require('../models/User');
const authRoutes = require('../routes/auth');

describe('Session & Token Invalidation on Password Set (Issue #35)', () => {
  let app;
  let mockUser;
  const oldRefreshToken = 'old-stale-refresh-token-prior-to-change';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      _id: 'user-456',
      id: 'user-456',
      refreshToken: oldRefreshToken,
      setPassword: jest.fn(async function(pwd) {
        this.password = pwd;
        this.hasPassword = true;
        this.refreshToken = null;
      }),
      save: jest.fn().mockResolvedValue(undefined),
      toJSON: () => ({ id: 'user-456', username: 'bob' })
    };

    User.findById.mockResolvedValue(mockUser);

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(session({ secret: 'test-session', resave: false, saveUninitialized: false }));

    app.locals.authConfig = {
      enableOAuth: false,
      corsOrigin: 'https://app.example.com',
      jwtSecret: 'test-access-secret',
      jwtRefreshSecret: 'test-refresh-secret',
      cookieMaxAge: 60000
    };

    // Authenticated mock session
    app.use((req, res, next) => {
      req.isAuthenticated = () => true;
      req.user = mockUser;
      next();
    });

    app.use('/api/auth', authRoutes);
  });

  it('revokes previous refresh token and sets fresh cookies upon set-password', async () => {
    const res = await request(app)
      .post('/api/auth/set-password')
      .send({ password: 'BrandNewSecurePassword123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockUser.setPassword).toHaveBeenCalledWith('BrandNewSecurePassword123');

    // Verify cookies were updated with new rotated tokens
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const hasNewRefreshToken = cookies.some(c => c.startsWith('refreshToken='));
    expect(hasNewRefreshToken).toBe(true);

    // Verify mockUser's refreshToken in DB was rotated and is no longer the old one
    expect(mockUser.refreshToken).not.toBe(oldRefreshToken);
  });

  it('rejects subsequent refresh requests using the old invalidated refresh token', async () => {
    // 1. User sets password
    await request(app)
      .post('/api/auth/set-password')
      .send({ password: 'BrandNewSecurePassword123' });

    // The user now has a new rotated refresh token in DB:
    const rotatedTokenInDb = mockUser.refreshToken;

    // 2. Attacker tries to use the prior/different token
    const oldSignedToken = jwt.sign(
      { userId: 'user-456', nonce: 'prior-session-nonce' },
      app.locals.authConfig.jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    const refreshRes = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', [`refreshToken=${oldSignedToken}`]);

    // Should be rejected because old token does not match rotatedTokenInDb
    expect(refreshRes.statusCode).toBe(401);
    expect(refreshRes.body.success).toBe(false);
    expect(refreshRes.body.message).toMatch(/invalid or reused/i);
    expect(mockUser.refreshToken).not.toBe(oldSignedToken);
    expect(mockUser.refreshToken).not.toBe(rotatedTokenInDb); // Stored token invalidated on reuse detection
  });
});
