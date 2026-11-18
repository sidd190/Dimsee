const mongoose = require('mongoose');

jest.mock('connect-mongo', () => {
  const session = require('express-session');
  return {
    create: jest.fn().mockImplementation(() => new session.MemoryStore())
  };
});

const { createAuthBackend } = require('../index');

describe('Production Secrets Enforcement (Issue #33 & Issue #32)', () => {
  const originalEnv = process.env.NODE_ENV;
  let connectSpy;

  beforeAll(() => {
    connectSpy = jest.spyOn(mongoose, 'connect').mockResolvedValue(undefined);
  });

  afterAll(() => {
    connectSpy.mockRestore();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('allows default secrets in development mode', () => {
    process.env.NODE_ENV = 'development';
    expect(() => {
      createAuthBackend({
        mongoUri: 'mongodb://localhost:27017/test-dev'
      });
    }).not.toThrow();
  });

  it('throws an error in production if jwtSecret uses an insecure default', () => {
    process.env.NODE_ENV = 'production';
    expect(() => {
      createAuthBackend({
        jwtSecret: 'your-secret-key-change-in-production',
        jwtRefreshSecret: 'a-secure-production-refresh-secret-12345'
      });
    }).toThrow(/Insecure default or empty jwtSecret/i);
  });

  it('throws an error in production if jwtRefreshSecret uses an insecure default', () => {
    process.env.NODE_ENV = 'production';
    expect(() => {
      createAuthBackend({
        jwtSecret: 'a-secure-production-access-secret-12345',
        jwtRefreshSecret: 'your-secret-key-change-in-production'
      });
    }).toThrow(/Insecure default or empty jwtRefreshSecret/i);
  });

  it('throws an error in production if jwtSecret equals jwtRefreshSecret', () => {
    process.env.NODE_ENV = 'production';
    const sharedSecret = 'identical-secret-shared-across-both-tokens';
    expect(() => {
      createAuthBackend({
        jwtSecret: sharedSecret,
        jwtRefreshSecret: sharedSecret
      });
    }).toThrow(/jwtSecret and jwtRefreshSecret must be distinct/i);
  });

  it('succeeds in production with distinct, secure secrets', () => {
    process.env.NODE_ENV = 'production';
    expect(() => {
      createAuthBackend({
        jwtSecret: 'super-secure-production-access-key-abc-xyz',
        jwtRefreshSecret: 'another-super-secure-production-refresh-key-123-789'
      });
    }).not.toThrow();
  });
});
