# Dimsee API Reference

Exhaustive API documentation for Dimsee's authentication backend, endpoints, request/response formats, cookie semantics, and security headers.

---

## Overview & Base Configuration

Dimsee mounts its authentication router under the prefix `/api/auth` (configurable when using `createAuthBackend`).

### Common Response Formats

#### Success Response
```json
{
  "success": true,
  "message": "Human-readable description",
  "data": {}
}
```

#### Validation Error (HTTP 400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

#### Authentication Error (HTTP 401)
```json
{
  "success": false,
  "message": "Access denied. No token provided.",
  "errors": [
    {
      "field": "general",
      "message": "Invalid token"
    }
  ]
}
```

---

## Authentication Endpoints

### 1. `POST /api/auth/signup`
Registers a new user account with a username, email, and password.

- **Rate Limited**: Yes (5 attempts per minute window).
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  | Field | Type | Validation Rules | Description |
  | :--- | :--- | :--- | :--- |
  | `username` | `string` | 3–20 chars, alphanumeric + underscores | Unique handle |
  | `email` | `string` | Valid email format | Unique email address |
  | `password` | `string` | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit | Plaintext password |
  | `confirmPassword` | `string` | Must match `password` | Password confirmation |

- **Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "Signup successful",
    "user": {
      "_id": "67376a...",
      "username": "alice",
      "email": "alice@example.com",
      "hasPassword": true,
      "authMethod": "local",
      "createdAt": "2026-11-16T12:00:00.000Z",
      "updatedAt": "2026-11-16T12:00:00.000Z"
    }
  }
  ```
- **Cookies Set**:
  - `authToken`: HTTP-only JWT access token (`maxAge: 7 days` or configured `cookieMaxAge`).
  - `refreshToken`: HTTP-only JWT refresh token.

---

### 2. `POST /api/auth/signin`
Authenticates an existing user using credentials.

- **Rate Limited**: Yes (5 attempts per minute window).
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  | Field | Type | Description |
  | :--- | :--- | :--- |
  | `email` | `string` | Registered email address |
  | `password` | `string` | User password |

- **Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "user": {
      "_id": "67376a...",
      "username": "alice",
      "email": "alice@example.com",
      "hasPassword": true,
      "authMethod": "local"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing or non-string fields.
  - `401 Unauthorized`: `"Invalid credentials"` (constant-time, prevents user enumeration).

---

### 3. `POST /api/auth/signout`
Terminates the user's active session and clears authentication cookies.

- **Request Headers**: `Cookie: authToken=...; refreshToken=...`
- **Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "Signed out successfully"
  }
  ```
- **Cookies Cleared**:
  - `authToken`: Expired with past date, matching security attributes (`httpOnly: true`, `sameSite`).
  - `refreshToken`: Expired with past date.

---

### 4. `POST /api/auth/refresh-token`
Exchanges a valid refresh token for a fresh access token and rotated refresh token.

- **Authentication Required**: No (used when the access token has expired).
- **Credentials**: Read from `req.cookies.refreshToken` or `req.body.refreshToken`.
- **Rotation & Reuse Detection**:
  - If incoming refresh token matches the user's active token in DB:
    - Generates and saves a new `refreshToken`.
    - Generates a new `authToken`.
    - Updates cookies and returns the new `accessToken`.
  - If incoming refresh token does NOT match (potential token replay/theft):
    - Revokes the stored refresh token (`user.refreshToken = null`).
    - Returns `401 Unauthorized: Refresh token invalid or reused. Please log in again.`
- **Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "Tokens refreshed successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### 5. `POST /api/auth/set-password`
Allows OAuth users (or users without an existing local password) to set a permanent password.

- **Authentication Required**: Yes (session or `authToken`).
- **Request Body**:
  | Field | Type | Description |
  | :--- | :--- | :--- |
  | `password` | `string` | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit |
- **Security Action**:
  - Hashes new password with `bcryptjs`.
  - Sets `hasPassword: true`.
  - Revokes and rotates existing refresh tokens to prevent session hijacking.
- **Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "Password set successfully"
  }
  ```

---

### 6. `GET /api/auth/me`
Retrieves the profile of the currently authenticated user.

- **Authentication Required**: Yes.
- **Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "67376a...",
      "username": "alice",
      "email": "alice@example.com",
      "authMethod": "local",
      "hasPassword": true
    }
  }
  ```

---

### 7. `GET /api/auth/oauth-status`
Returns the status of configured OAuth providers.

- **Response (HTTP 200)**:
  ```json
  {
    "enabled": true,
    "providers": {
      "google": true,
      "github": false
    }
  }
  ```

---

### 8. OAuth Initiation & Callbacks
- `GET /api/auth/google?redirectUrl=/dashboard`
- `GET /api/auth/google/callback`
- `GET /api/auth/github?redirectUrl=/dashboard`
- `GET /api/auth/github/callback`

Validates that `redirectUrl` resolves within the configured `corsOrigin` to prevent Open Redirect vulnerabilities.

---

## Protected Route Middleware: `authMiddleware`

To protect custom application routes:
```javascript
const { authMiddleware } = require('dimsee');

app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```

`authMiddleware` extracts JWTs from:
1. `req.cookies.authToken`
2. `Authorization: Bearer <token>` header

Populates `req.user` with decoded token payload `{ userId, iat, exp }`.
