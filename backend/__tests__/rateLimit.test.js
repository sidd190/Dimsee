const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');

describe('Rate Limiting', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mirror the limiter used on the auth routes
    const authLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 3,
      message: { success: false, message: 'Too many attempts. Please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.post('/api/auth/signin', authLimiter, (req, res) => {
      res.json({ success: true, message: 'Auth attempt accepted' });
    });
  });

  it('allows requests up to the limit', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(app).post('/api/auth/signin');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    }
  });

  it('blocks requests after the limit is reached', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app).post('/api/auth/signin');
    }

    const res = await request(app).post('/api/auth/signin');
    expect(res.statusCode).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/too many attempts/i);
  });
});
