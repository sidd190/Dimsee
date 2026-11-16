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

describe('AuthForm Neobrutalist Theme', () => {
  it('renders with design="neobrutalist" root class in signin mode', () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { design: 'neobrutalist', mode: 'signin' }));
    expect(html).toContain('auth-container neobrutalist');
    expect(html).toContain('Sign In');
  });

  it('renders with design="neobrutalist" root class in signup mode', () => {
    const html = renderToStaticMarkup(React.createElement(AuthForm, { design: 'neobrutalist', mode: 'signup' }));
    expect(html).toContain('auth-container neobrutalist');
    expect(html).toContain('Create Account');
  });
});
