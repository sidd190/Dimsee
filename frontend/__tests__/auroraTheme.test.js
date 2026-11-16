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

describe('AuthForm Aurora Theme', () => {
  it('renders with design="aurora" root class in signin mode', () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { design: 'aurora', mode: 'signin' }));
    expect(html).toContain('auth-container aurora');
    expect(html).toContain('Sign In');
  });

  it('renders with design="aurora" root class in signup mode', () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { design: 'aurora', mode: 'signup' }));
    expect(html).toContain('auth-container aurora');
    expect(html).toContain('Create Account');
  });
});
