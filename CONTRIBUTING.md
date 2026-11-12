# Contributing to Dimsee
First off - thank you! Dimsee is a drop-in authentication package for the MERN
stack (and Next.js), and it only gets better with community help. This guide
gets you from zero to your first merged PR.

> **New to open source?** Look for issues labelled
> [`good first issue`](https://github.com/sidd190/dimsee/labels/good%20first%20issue).
> They're self-contained, well-scoped, and a great way in.

---

## The contribution ladder

Dimsee is part of a wider set of projects. Pick a rung that matches your comfort
level - and climb:

1. **`good first issue`** - docs, a new theme, a small UI/a11y tweak. One file,
   clear acceptance criteria.
2. **`intermediate`** - tests, validation wiring, build hygiene, small refactors.
3. **`complex`** - architecture: unifying the server factory, token/secret
   hardening, CI, TypeScript types.

Shipped a theme? Try an intermediate issue next. The ladder is the point.

---

## Local setup

**Prerequisites:** Node.js >= 14, npm, and (for running the backend) a local or
hosted MongoDB instance.

```bash
# 1. Fork, then clone your fork
git clone https://github.com/<your-username>/dimsee.git
cd dimsee

# 2. Install dependencies (this also runs the build via the prepare hook)
npm install

# 3. Run the test suite
npm test

# 4. Build backend + frontend bundles
npm run build

# 5. Lint & format before committing
npm run lint
npm run format
```

To try the backend end-to-end, copy `backend/.env.example` to `backend/.env`,
fill in `MONGODB_URI` and a `JWT_SECRET`, and wire `createAuthBackend` into a
small `server.js` (see the README "Getting Started" section).

---

## Contributing a new theme (great first PR)

Themes are the easiest high-impact contribution. Each theme is a self-contained
block of CSS - no JavaScript changes required.

1. Open `frontend/src/components/AuthForm.css`.
2. Add your styles under a **unique theme class**, e.g. `.auth-container.sunset`.
   Scope *every* rule to that class so themes never leak into each other.
3. Test it in **both** `signin` and `signup` modes, including error states and on
   mobile widths.
4. Add the theme name to the `design` prop options table in `README.md`.
5. Submit a PR **with a screenshot** (both modes).

```css
/* Example: a new "sunset" theme */
.auth-container.sunset .auth-form {
  background: linear-gradient(135deg, #ff8a00, #e52e71);
}
.auth-container.sunset .form-input:focus {
  border-color: #ff8a00;
  box-shadow: 0 0 0 3px rgba(255, 138, 0, 0.3);
}
```

---

## Pull request process

1. **Create a branch** off `main`: `git checkout -b fix/short-description` or
   `feat/short-description`.
2. **Keep PRs focused** - one issue per PR. Smaller is easier to review.
3. **Reference the issue** you're closing: `Closes #123`.
4. **Run `npm test` and `npm run lint`** locally; make sure both pass.
5. **Describe your change** and, for any UI work, attach before/after screenshots.
6. A maintainer will review. Expect a round or two of feedback - that's normal
   and welcome.

### Commit messages

Use a short, conventional prefix:

- `feat:` a new capability (e.g. a new theme, a new prop)
- `fix:` a bug fix
- `docs:` documentation only
- `test:` adding or fixing tests
- `chore:` build/tooling/housekeeping

---

## Definition of done

A change is ready to merge when:

- [ ] `npm test` passes
- [ ] `npm run lint` is clean
- [ ] New behaviour has a test (where practical)
- [ ] Docs/README updated if the public API or props changed
- [ ] UI changes include a screenshot

---

## Reporting bugs & requesting features

[Open an issue](https://github.com/sidd190/dimsee/issues) and include:

- A clear description and steps to reproduce
- Expected vs. actual behaviour
- Relevant error messages / console logs
- Environment details (Node version, browser, OS)

---

## Code of conduct

Be kind, be constructive, assume good intent. We want Dimsee to be a welcoming
first open-source experience for everyone.

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).
