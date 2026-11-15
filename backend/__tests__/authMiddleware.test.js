const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

describe('authMiddleware', () => {
  let app;
  const testSecret = 'test-jwt-secret-key-12345';

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());

    // Mock app.locals.authConfig
    app.locals.authConfig = {
      jwtSecret: testSecret,
      jwtExpiry: '15m'
    };

    // Protected test route
    app.get('/api/test-protected', authMiddleware, (req, res) => {
      res.json({
        success: true,
        user: req.user
      });
    });
  });

  it('allows access with a valid token and sets req.user', async () => {
    const payload = { userId: 'user-12345', email: 'test@example.com' };
    const validToken = jwt.sign(payload, testSecret, { expiresIn: '15m' });

    const res = await request(app)
      .get('/api/test-protected')
      .set('Cookie', [`authToken=${validToken}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toMatchObject(payload);
  });

  it('rejects request with 401 when no token cookie is provided', async () => {
    const res = await request(app).get('/api/test-protected');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Access denied. No token provided.');
  });

  it('rejects request with 401 when token is invalid or tampered', async () => {
    const invalidToken = 'this-is-not-a-valid-jwt-token';

    const res = await request(app)
      .get('/api/test-protected')
      .set('Cookie', [`authToken=${invalidToken}`]);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid token');
  });

  it('rejects request with 401 when token is signed with a different secret', async () => {
    const wrongSecretToken = jwt.sign({ userId: 'user-1' }, 'different-secret');

    const res = await request(app)
      .get('/api/test-protected')
      .set('Cookie', [`authToken=${wrongSecretToken}`]);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid token');
  });

  it('rejects request with 401 when token has expired', async () => {
    // Generate token that expired 1 second ago
    const expiredToken = jwt.sign({ userId: 'user-1' }, testSecret, { expiresIn: '-1s' });

    const res = await request(app)
      .get('/api/test-protected')
      .set('Cookie', [`authToken=${expiredToken}`]);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid token');
  });
});
