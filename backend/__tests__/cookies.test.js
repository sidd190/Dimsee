const request = require('supertest');
const express = require('express');
const authRouter = require('../routes/auth');

describe('Auth cookie flags', () => {
  const originalEnv = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  const buildApp = () => {
    const app = express();
    app.use((req, res, next) => {
      req.logout = (cb) => cb();
      next();
    });
    app.use('/api/auth', authRouter);
    return app;
  };

  it('clears cookies with SameSite=Lax outside production', async () => {
    process.env.NODE_ENV = 'development';
    const res = await request(buildApp()).post('/api/auth/signout');
    expect(res.statusCode).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toHaveLength(2);
    cookies.forEach((c) => {
      expect(c).toMatch(/HttpOnly/);
      expect(c).toMatch(/SameSite=Lax/);
      expect(c).not.toMatch(/Secure/);
    });
  });

  it('clears cookies with Secure and SameSite=Strict in production', async () => {
    process.env.NODE_ENV = 'production';
    const res = await request(buildApp()).post('/api/auth/signout');
    const cookies = res.headers['set-cookie'];
    cookies.forEach((c) => {
      expect(c).toMatch(/HttpOnly/);
      expect(c).toMatch(/Secure/);
      expect(c).toMatch(/SameSite=Strict/);
    });
  });
});
