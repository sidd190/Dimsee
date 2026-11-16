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

const AuthForm = require('../src/components/AuthForm').default;

describe('AuthForm Glass Theme', () => {
  it('renders with design="glass" root class in signin mode', () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { design: 'glass', mode: 'signin' }));
    expect(html).toContain('auth-container glass');
    expect(html).toContain('Sign In');
  });

  it('renders with design="glass" root class in signup mode', () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { design: 'glass', mode: 'signup' }));
    expect(html).toContain('auth-container glass');
    expect(html).toContain('Create Account');
  });
});
