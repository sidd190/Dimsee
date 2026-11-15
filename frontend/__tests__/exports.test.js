jest.mock('../src/components/AuthForm.css', () => ({}));
jest.mock('../src/components/AuthStatus.css', () => ({}));
jest.mock('../src/components/SetPasswordButton.css', () => ({}));

const frontend = require('../index');
const source = require('../src/index');

it('loads both JavaScript frontend entry points and their JSX components', () => {
  for (const name of ['AuthProvider', 'AuthStatus', 'AuthForm', 'LogoutButton', 'useAuth']) {
    expect(typeof frontend[name]).toBe('function');
    expect(source[name]).toBe(frontend[name]);
    expect(frontend.default[name]).toBe(frontend[name]);
  }
});
