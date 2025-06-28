const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');

describe('Rate Limiting', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Apply rate limiter (same config as in your app.js)
    const authLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 3,
      message: { success: false, message: 'Too many attempts. Please try again later.' }
    });

    // Simulate signin route with limiter
    app.post('/api/auth/signin', authLimiter, (req, res) => {
      res.json({ success: true, message: 'Auth attempt accepted' });
    });
  });

  it('should block requests after limit is reached', async () => {
    // Send 3 allowed requests
    for (let i = 0; i < 3; i++) {
      const res = await request(app).post('/api/auth/signin');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/
