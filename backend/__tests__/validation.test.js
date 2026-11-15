const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('../routes/auth');

describe('Zod Validation in Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.locals.authConfig = {
      jwtSecret: 'test-secret',
      jwtExpiry: '15m',
      jwtRefreshSecret: 'test-refresh-secret',
      jwtRefreshExpiry: '7d',
      cookieMaxAge: 10000,
      enableOAuth: false
    };
    app.use('/api/auth', authRoutes);
  });

  describe('POST /api/auth/signup validation', () => {
    it('returns 400 with field errors when username is too short', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'ab',
          email: 'valid@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.some(e => e.field === 'username')).toBe(true);
    });

    it('returns 400 with field errors when email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'validuser',
          email: 'not-an-email',
          password: 'password123',
          confirmPassword: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('returns 400 when password is under 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'validuser',
          email: 'valid@example.com',
          password: '123',
          confirmPassword: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
    });

    it('returns 400 when confirmPassword does not match password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'validuser',
          email: 'valid@example.com',
          password: 'password123',
          confirmPassword: 'differentpassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some(e => e.field === 'confirmPassword')).toBe(true);
    });
  });

  describe('POST /api/auth/signin validation', () => {
    it('returns 400 when email is invalid or missing', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'bad-email',
          password: 'somepassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('returns 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'valid@example.com',
          password: ''
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some(e => e.field === 'password')).toBe(true);
    });
  });
});
