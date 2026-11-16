const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');

describe('GET /oauth-status', () => {
  let app;

  it('reports providers enabled when configured via authConfig oauth object', async () => {
    app = express();
    app.use(express.json());

    app.locals.authConfig = {
      enableOAuth: true,
      oauth: {
        google: { clientId: 'test-google-id', clientSecret: 'test-google-secret' },
        github: { clientId: 'test-github-id', clientSecret: 'test-github-secret' }
      },
      configuredProviders: {
        google: true,
        github: true
      }
    };

    app.use('/api/auth', authRoutes);

    const res = await request(app).get('/api/auth/oauth-status');

    expect(res.statusCode).toBe(200);
    expect(res.body.enabled).toBe(true);
    expect(res.body.providers.google).toBe(true);
    expect(res.body.providers.github).toBe(true);
  });

  it('reports disabled when enableOAuth is false', async () => {
    app = express();
    app.use(express.json());

    app.locals.authConfig = {
      enableOAuth: false,
      oauth: {
        google: { clientId: 'test-google-id' }
      },
      configuredProviders: {
        google: false,
        github: false
      }
    };

    app.use('/api/auth', authRoutes);

    const res = await request(app).get('/api/auth/oauth-status');

    expect(res.statusCode).toBe(200);
    expect(res.body.enabled).toBe(false);
    expect(res.body.providers.google).toBe(false);
    expect(res.body.providers.github).toBe(false);
  });
});
