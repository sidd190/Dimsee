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

describe('AuthForm Monochrome Theme', () => {
  it('renders with design="monochrome" root class in signin mode', () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { design: 'monochrome', mode: 'signin' }));
    expect(html).toContain('auth-container monochrome');
    expect(html).toContain('Sign In');
  });

  it('renders with design="monochrome" root class in signup mode', () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { design: 'monochrome', mode: 'signup' }));
    expect(html).toContain('auth-container monochrome');
    expect(html).toContain('Create Account');
  });
});
