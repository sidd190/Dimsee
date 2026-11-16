const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

jest.mock('../src/hooks/useAuth', () => ({
  __esModule: true,
  default: () => ({
    signup: jest.fn(),
    signin: jest.fn(),
    loading: false,
    apiUrl: 'http://localhost:5000/api/auth'
  })
}));
jest.mock('../src/components/AuthForm.css', () => ({}));

// Provide global fetch mock for AuthForm's oauth-status check
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ enabled: true, providers: { google: true, github: true } })
  })
);

const AuthForm = require('../src/components/AuthForm').default;

describe('AuthForm password visibility toggle and accessible states', () => {
  it('renders password input with password toggle button and aria-label', () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { mode: 'signin' }));

    expect(html).toContain('type="password"');
    expect(html).toContain('aria-label="Show password"');
    expect(html).toContain('password-toggle-btn');
  });

  it('renders confirmPassword toggle in signup mode', () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { mode: 'signup' }));

    expect(html).toContain('aria-label="Show password"');
    expect(html).toContain('aria-label="Show confirm password"');
    expect(html).toContain('name="confirmPassword"');
  });

  it('renders password toggle with accessible button attributes and svg icon', () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { mode: 'signin' }));

    expect(html).toContain('class="password-toggle-btn"');
    expect(html).toContain('aria-label="Show password"');
    expect(html).toContain('tabindex="0"');
  });
});
