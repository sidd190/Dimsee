const request = require('supertest');
const express = require('express');
const session = require('express-session');

jest.mock('../models/User', () => {
  const User = jest.fn();
  User.findOne = jest.fn();
  return User;
});
jest.mock('passport', () => ({
  authenticate: jest.fn((provider, options) => (req, res, next) => {
    if (typeof options === 'function') return options(null, req.testUser);
    if (req.path.endsWith('/callback')) {
      req.user = req.testUser;
      // Passport 0.7 regenerates the session during successful login.
      return req.session.regenerate(next);
    }
    res.redirect(`https://provider.example/${provider}`);
  })
}));

const User = require('../models/User');
const passport = require('passport');
const authRoutes = require('../routes/auth');

describe('Authentication routes', () => {
  let app;
  let user;
  const signup = {
    username: 'alice', email: 'alice@example.com',
    password: 'Password1', confirmPassword: 'Password1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    user = {
      _id: 'user-1', save: jest.fn().mockResolvedValue(undefined),
      toJSON: () => ({ username: 'alice' })
    };
    User.mockImplementation(() => user);
    User.findOne.mockResolvedValue(null);
    app = express();
    app.locals.authConfig = {
      enableOAuth: true, corsOrigin: 'https://app.example.com',
      jwtSecret: 'test-access-secret', jwtRefreshSecret: 'test-refresh-secret',
      cookieMaxAge: 60000
    };
    app.use(express.json());
    app.use(session({ secret: 'test-session-secret', resave: false, saveUninitialized: false }));
    app.use((req, res, next) => {
      req.testUser = user;
      req.login = (value, done) => done();
      next();
    });
    app.use('/api/auth', authRoutes);
  });

  it.each([
    ['username', 'ab'], ['username', 'a'.repeat(21)], ['username', 'bad name'],
    ['email', 'invalid'], ['password', 'abcdef'], ['password', 123456],
    ['confirmPassword', 'different'], ['confirmPassword', undefined]
  ])('rejects invalid signup %s (%s) before querying users', async (field, value) => {
    const res = await request(app).post('/api/auth/signup').send({ ...signup, [field]: value });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field })]));
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it('signs up a valid user', async () => {
    const res = await request(app).post('/api/auth/signup').send(signup);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(User).toHaveBeenCalledWith({ username: signup.username, email: signup.email, password: signup.password });
  });

  it.each([{ email: 'bad', password: 'pass' }, { email: signup.email }, { email: signup.email, password: 123 }])(
    'rejects invalid signin input before calling Passport: %j', async (body) => {
      const res = await request(app).post('/api/auth/signin').send(body);
      expect(res.statusCode).toBe(400);
      expect(passport.authenticate).not.toHaveBeenCalled();
    }
  );

  it('allows existing short passwords through signin validation', async () => {
    const res = await request(app).post('/api/auth/signin').send({ email: signup.email, password: 'old' });
    expect(res.statusCode).toBe(200);
    expect(passport.authenticate).toHaveBeenCalledWith('local', expect.any(Function));
  });

  describe.each(['google', 'github'])('%s OAuth redirects', (provider) => {
    it.each(['/dashboard?tab=profile#details', 'https://app.example.com/welcome'])(
      'remembers a frontend destination through the callback: %s', async (redirectUrl) => {
        const agent = request.agent(app);
        const start = await agent.get(`/api/auth/${provider}`).query({ redirectUrl });
        expect(start.statusCode).toBe(302);
        const callback = await agent.get(`/api/auth/${provider}/callback`);
        expect(callback.headers.location).toBe(new URL(redirectUrl, app.locals.authConfig.corsOrigin).href);
        const repeat = await agent.get(`/api/auth/${provider}/callback`);
        expect(repeat.headers.location).toBe(app.locals.authConfig.corsOrigin);
      }
    );

    it.each(['https://evil.example/path', '//evil.example', 'javascript:alert(1)', 'https://app.example.com.evil.example', 'https://user:pass@app.example.com']) (
      'rejects unsafe destinations: %s', async (redirectUrl) => {
        const res = await request(app).get(`/api/auth/${provider}`).query({ redirectUrl });
        expect(res.statusCode).toBe(400);
        expect(passport.authenticate).not.toHaveBeenCalled();
      }
    );

    it('defaults to the frontend when no redirect is supplied', async () => {
      const agent = request.agent(app);
      await agent.get(`/api/auth/${provider}`);
      const res = await agent.get(`/api/auth/${provider}/callback`);
      expect(res.headers.location).toBe(app.locals.authConfig.corsOrigin);
    });

    it('rejects initiation when OAuth is disabled', async () => {
      app.locals.authConfig.enableOAuth = false;
      const res = await request(app).get(`/api/auth/${provider}`);
      expect(res.statusCode).toBe(403);
      expect(passport.authenticate).not.toHaveBeenCalled();
    });
  });
});
