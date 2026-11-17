const request = require('supertest');
const express = require('express');
const session = require('express-session');

jest.mock('../models/User', () => {
  const User = jest.fn();
  User.findOne = jest.fn();
  User.findById = jest.fn();
  return User;
});
jest.mock('passport', () => ({
  authenticate: jest.fn(() => (req, res, next) => next())
}));

const User = require('../models/User');
const authRoutes = require('../routes/auth');

describe('Password Policy & Credential Validation (Issue #38)', () => {
  let app;
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      _id: 'user-123',
      id: 'user-123',
      setPassword: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined),
      toJSON: () => ({ username: 'alice', email: 'alice@example.com' })
    };
    User.mockImplementation(() => mockUser);
    User.findOne.mockResolvedValue(null);
    User.findById.mockResolvedValue(mockUser);

    app = express();
    app.locals.authConfig = {
      enableOAuth: false,
      corsOrigin: 'https://app.example.com',
      jwtSecret: 'test-access-secret',
      jwtRefreshSecret: 'test-refresh-secret',
      cookieMaxAge: 60000
    };
    app.use(express.json());
    app.use(session({ secret: 'test-session-secret', resave: false, saveUninitialized: false }));
    app.use((req, res, next) => {
      req.isAuthenticated = () => true;
      req.user = mockUser;
      req.login = (u, cb) => cb();
      next();
    });
    app.use('/api/auth', authRoutes);
  });

  describe('Signup Password Validation', () => {
    it.each([
      ['too short (6 chars)', 'Pass1a'],
      ['too short (7 chars)', 'Pass1aa'],
      ['no uppercase', 'password123'],
      ['no lowercase', 'PASSWORD123'],
      ['no number', 'PasswordOnly']
    ])('rejects non-compliant password: %s', async (desc, password) => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'validuser',
          email: 'valid@example.com',
          password,
          confirmPassword: password
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'password' })])
      );
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it('accepts compliant passwords with at least 8 chars, uppercase, lowercase, and digit', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'validuser',
          email: 'valid@example.com',
          password: 'ValidPassword123',
          confirmPassword: 'ValidPassword123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Set-Password Validation', () => {
    it.each([
      ['too short (<8 chars)', 'Short1'],
      ['no uppercase', 'weakpass123'],
      ['no number', 'NoDigitsHere']
    ])('rejects weak password on /set-password: %s', async (desc, password) => {
      const res = await request(app)
        .post('/api/auth/set-password')
        .send({ password });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'password' })])
      );
      expect(mockUser.setPassword).not.toHaveBeenCalled();
    });

    it('successfully updates password when compliant', async () => {
      const res = await request(app)
        .post('/api/auth/set-password')
        .send({ password: 'StrongNewPass123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockUser.setPassword).toHaveBeenCalledWith('StrongNewPass123');
    });
  });
});
