const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

describe('authMiddleware (Issue #19 & Issue #32)', () => {
  const jwtSecret = 'test-distinct-access-secret-123';
  const jwtRefreshSecret = 'test-distinct-refresh-secret-456';
  let app;

  beforeEach(() => {
    app = express();
    app.use(cookieParser());
    app.locals.authConfig = {
      jwtSecret,
      jwtRefreshSecret
    };

    app.get('/api/protected', authMiddleware, (req, res) => {
      res.json({
        success: true,
        user: req.user
      });
    });
  });

  it('allows access with a valid token in authToken cookie and attaches req.user', async () => {
    const validToken = jwt.sign({ userId: 'user-789', role: 'admin' }, jwtSecret, { expiresIn: '15m' });
    const res = await request(app)
      .get('/api/protected')
      .set('Cookie', [`authToken=${validToken}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.userId).toBe('user-789');
    expect(res.body.user.role).toBe('admin');
  });

  it('allows access with a valid token in Authorization Bearer header', async () => {
    const validToken = jwt.sign({ userId: 'user-bearer-1', role: 'member' }, jwtSecret, { expiresIn: '15m' });
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.userId).toBe('user-bearer-1');
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/protected');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/No token provided/i);
  });

  it('returns 401 when token is malformed', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Cookie', ['authToken=not-a-valid-jwt-token']);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid token');
  });

  it('returns 401 when token is signed with a different secret', async () => {
    const wrongSecretToken = jwt.sign({ userId: 'user-wrong' }, 'completely-wrong-secret');
    const res = await request(app)
      .get('/api/protected')
      .set('Cookie', [`authToken=${wrongSecretToken}`]);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid token');
  });

  it('returns 401 when token is expired', async () => {
    const expiredToken = jwt.sign({ userId: 'user-expired' }, jwtSecret, { expiresIn: -10 });
    const res = await request(app)
      .get('/api/protected')
      .set('Cookie', [`authToken=${expiredToken}`]);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid token');
  });

  it('prevents refresh tokens from being accepted as access tokens (Issue #32)', async () => {
    // Sign a refresh token with jwtRefreshSecret
    const refreshToken = jwt.sign({ userId: 'user-refresh' }, jwtRefreshSecret, { expiresIn: '7d' });

    // Attempt to access protected route with the refresh token
    const res = await request(app)
      .get('/api/protected')
      .set('Cookie', [`authToken=${refreshToken}`]);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid token');
  });
});
