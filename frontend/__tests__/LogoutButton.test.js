const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

jest.mock("../src/hooks/useAuth", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("../src/components/LogoutButton.css", () => ({}));

const useAuth = require("../src/hooks/useAuth").default;
const LogoutButton = require("../src/components/LogoutButton").default;

const renderButton = (props) =>
  renderToStaticMarkup(React.createElement(LogoutButton, props)).match(
    /<button[^>]*>/,
  )[0];

describe("LogoutButton", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { username: "demo" }, signout: jest.fn() });
  });

  it("uses the default design and size classes", () => {
    expect(renderButton()).toContain(
      'class="logout-button design-modern size-medium"',
    );
  });

  it.each(["modern", "minimal", "outline", "rounded"])(
    "applies the %s design class",
    (design) => {
      expect(renderButton({ design, size: "large" })).toContain(
        `design-${design} size-large`,
      );
    },
  );

  it("has no inline styles or pseudo-selectors on the button", () => {
    expect(renderButton()).not.toContain("style=");
    const html = renderToStaticMarkup(React.createElement(LogoutButton));
    expect(html).not.toContain(":hover");
    expect(html).not.toContain(":disabled");
  });

  it("renders nothing when the user is signed out", () => {
    useAuth.mockReturnValue({ user: null });
    expect(renderToStaticMarkup(React.createElement(LogoutButton))).toBe("");
  });

  it("is a non-submit button", () => {
    expect(renderButton()).toContain('type="button"');
  });
});
