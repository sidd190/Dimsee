# Dimsee Architecture & Authentication Flows

This document details the architectural layout and core authentication workflows implemented in Dimsee.

---

## 1. High-Level System Architecture

```mermaid
flowchart LR
    subgraph Client["Frontend Client (React)"]
        AF["AuthForm / AuthStatus"]
        AC["AuthContext (Memory)"]
        HOOK["useAuth() hook"]
        COOKIE_JAR["HttpOnly Cookies (Browser Managed)"]
    end

    subgraph Backend["Dimsee Backend (Express.js)"]
        FACTORY["createAuthBackend()"]
        ROUTER["/api/auth Routes"]
        MIDDLEWARE["authMiddleware (JWT Verify)"]
        RATE["rateLimitMiddleware"]
        PASS["Passport.js Strategies"]
    end

    subgraph External["External Services & Storage"]
        MONGO[("MongoDB (User Schema)")]
        GOOGLE["Google OAuth 2.0"]
        GITHUB["GitHub OAuth"]
    end

    AF --> HOOK
    HOOK --> AC
    HOOK -- "HTTP Requests with Credentials" --> ROUTER
    COOKIE_JAR <--> ROUTER

    ROUTER --> RATE
    ROUTER --> PASS
    ROUTER --> MIDDLEWARE
    MIDDLEWARE --> MONGO
    PASS --> GOOGLE
    PASS --> GITHUB
    ROUTER --> MONGO
```

---

## 2. Local Signup & Signin Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser
    participant React as AuthForm / useAuth
    participant API as Dimsee Backend (/api/auth)
    participant DB as MongoDB

    User->>React: Enters username, email, password
    React->>API: POST /api/auth/signup (JSON)
    Note over API: Zod Validation (Username, Email, Password complexity)
    API->>DB: User.findOne({ $or: [email, username] })
    DB-->>API: Not found
    API->>DB: User.create({ password: bcryptHash(...) })
    DB-->>API: User created
    API-->>React: 201 Created (User info)

    User->>React: Enters credentials to Sign In
    React->>API: POST /api/auth/signin (JSON)
    Note over API: Rate limiter check & Passport Local authentication
    API->>DB: User.findOne({ email })
    DB-->>API: User record (with bcrypt hash)
    Note over API: bcrypt.compare(password, hash)
    API->>DB: user.refreshToken = newJwtRefreshToken; await user.save()
    Note over API: Generate authToken (15m) & refreshToken (7d)
    API-->>React: 200 OK + Set-Cookie: authToken & refreshToken (HttpOnly, Secure)
    React-->>User: Authenticated state rendered
```

---

## 3. OAuth Authentication Flow (Google / GitHub)

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Browser as Client Browser
    participant API as Dimsee Backend
    participant Provider as OAuth Provider (Google / GitHub)
    participant DB as MongoDB

    User->>Browser: Clicks "Continue with Google"
    Browser->>API: GET /api/auth/google?redirectUrl=/dashboard
    Note over API: Validates redirectUrl against corsOrigin
    API-->>Browser: 302 Redirect to Provider OAuth Consent Screen
    Browser->>Provider: Authorizes Dimsee Application
    Provider-->>Browser: 302 Redirect to /api/auth/google/callback?code=AUTH_CODE
    Browser->>API: GET /api/auth/google/callback?code=AUTH_CODE
    API->>Provider: Exchanges code for Profile & Tokens
    Provider-->>API: Returns verified user profile (email, id)
    API->>DB: Upserts User (sets authMethod, googleId, hasPassword: false)
    DB-->>API: User profile confirmed
    Note over API: Sets HttpOnly auth cookies (authToken, refreshToken)
    API-->>Browser: 302 Redirect to saved redirect destination (/dashboard)
    Browser->>User: Display authenticated dashboard
```

---

## 4. Refresh Token Rotation Flow

```mermaid
sequenceDiagram
    autonumber
    participant Client as React Client
    participant Interceptor as useAuth Fetch Interceptor
    participant API as Dimsee Backend (/api/auth)
    participant DB as MongoDB

    Client->>API: GET /api/protected (with expired authToken)
    API-->>Client: 401 Unauthorized (TokenExpiredError)
    Client->>Interceptor: Catches 401 response
    Interceptor->>API: POST /api/auth/refresh-token (Cookie: refreshToken)
    Note over API: Rate Limiter & JWT Verification
    API->>DB: User.findById(decoded.userId)
    DB-->>API: User with stored refreshToken
    Note over API: Compare stored refreshToken with incoming token
    Note over API: Generate new authToken (15m) and rotate refreshToken (7d)
    API->>DB: Save updated refreshToken
    API-->>Interceptor: 200 OK + Set-Cookie: new authToken & refreshToken
    Interceptor->>API: Re-executes original request GET /api/protected
    API-->>Client: 200 OK (Protected data)
```

---

## 5. Session Termination (Signout) Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant React as LogoutButton / useAuth
    participant API as Dimsee Backend (/api/auth)
    participant DB as MongoDB

    User->>React: Clicks "Sign Out"
    React->>API: POST /api/auth/signout (credentials: 'include')
    API->>DB: Invalidate stored refreshToken for current user
    DB-->>API: Updated
    Note over API: Clears authToken and refreshToken cookies (expires: Epoch 0)
    API-->>React: 200 OK { success: true, message: "Logged out successfully" }
    React->>React: Clear in-memory user & auth state
    React-->>User: Render unauthenticated view
```
