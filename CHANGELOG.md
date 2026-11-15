# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Issue templates and pull request templates (`.github/`).
- `VISION.md` detailing project direction, roadmap, and preset philosophy.

### Fixed
- Environment variables and secret keys documentation in `.env.example`.
- Repository name placeholder in documentation.

## [0.6.9] - 2026-11-12

### Changed
- Package revitalization: repaired build breakage, improved project hygiene, and refreshed documentation.

## [0.6.8] - 2025-06-27

### Added
- Direct export of `User` model from package backend.
- Rate limiting middleware on `/signin` and `/signup` endpoints with accompanying tests.

### Fixed
- Added argument passing in `authMiddleware`.
- Ensured valid `expiresIn` is always passed to `jwt.sign` in signin route.

## [0.6.4] - 2025-06-17

### Added
- Re-added refresh token support and rotation logic.

### Fixed
- Fixed JWT issuance in cookie after local signup and signin (closes #4).

## [0.6.2] - 2025-06-13

### Added
- Added `readmeFilename` to `package.json` to ensure README inclusion in published packages.
- Streamlined cookie setting and added cookie support for local signups.

## [0.6.1] - 2025-06-13

### Changed
- Cleaned up documentation and removed preconfigured auth mentions.
- Enhanced README guides and updated component styles.

## [0.6.0] - 2025-06-07

### Added
- Conditional OAuth buttons for Google and GitHub in `AuthForm`.
