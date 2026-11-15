# Dimsee User Schema: Extension, Mongoose References & Population Guide

Dimsee is designed from the ground up for MongoDB and Mongoose. Unlike traditional authentication libraries that treat MongoDB as an abstract key-value store or shallow CRUD adapter, Dimsee provides a native Mongoose `User` model with real schemas, real `ObjectId` references, and full support for `.populate()`.

This guide documents the built-in `User` schema and provides comprehensive instructions and code examples for adding custom fields, linking related models via Mongoose references, and populating relations seamlessly.

---

## Table of Contents

- [Core Philosophy: Deep MongoDB Integration](#core-philosophy-deep-mongodb-integration)
- [The Built-In User Schema Reference](#the-built-in-user-schema-reference)
  - [Schema Fields](#schema-fields)
  - [Built-In Methods](#built-in-methods)
  - [Built-In Hooks](#built-in-hooks)
  - [Serialization Safety (`toJSON`)](#serialization-safety-tojson)
- [Pattern 1: Extending the User Schema (`User.schema.add`)](#pattern-1-extending-the-user-schema-userschemaadd)
  - [Adding Primitive Fields](#adding-primitive-fields)
  - [Adding Single Mongoose References (`ref`)](#adding-single-mongoose-references-ref)
  - [Adding Multi-Reference Arrays](#adding-multi-reference-arrays)
  - [Adding Embedded Subdocuments](#adding-embedded-subdocuments)
  - [Bootstrap Timing (When to Extend)](#bootstrap-timing-when-to-extend)
- [Pattern 2: Referencing `User` from Other Models](#pattern-2-referencing-user-from-other-models)
  - [Child-to-User References](#child-to-user-references)
  - [Many-to-Many Collaborations](#many-to-many-collaborations)
- [Pattern 3: Virtual Population (Unbounded Collections)](#pattern-3-virtual-population-unbounded-collections)
- [Keeping Fields and References Working with `populate()`](#keeping-fields-and-references-working-with-populate)
  - [Populating References on the User](#populating-references-on-the-user)
  - [Populating User References on Associated Models](#populating-user-references-on-associated-models)
  - [Deep / Multi-Level Population](#deep--multi-level-population)
  - [Populating Users in Protected Route Middleware](#populating-users-in-protected-route-middleware)
- [Complete End-to-End Implementation Example](#complete-end-to-end-implementation-example)
- [Common Pitfalls & Best Practices](#common-pitfalls--best-practices)

---

## Core Philosophy: Deep MongoDB Integration

Many auth libraries treat MongoDB as an afterthought, storing unstructured JSON blobs or forcing flat relational shims that prevent you from using Mongoose's most powerful capabilities:
- Native schema validation and custom types.
- Cryptographic pre-save middleware.
- Foreign key references (`mongoose.Schema.Types.ObjectId`).
- Cross-collection joins via `.populate()`.

Dimsee exports the live Mongoose `User` model directly:

```javascript
const { User, createAuthBackend, authMiddleware } = require('dimsee/backend');
```

Because `User` is an authentic Mongoose model registered with your application's Mongoose connection, you can query it, add schema paths, attach virtuals, and populate related collections using standard Mongoose syntax.

---

## The Built-In User Schema Reference

The core `User` model is defined in `backend/models/User.js`.

### Schema Fields

| Field | Type | Options & Constraints | Description |
| :--- | :--- | :--- | :--- |
| `username` | `String` | `required: true`, `unique: true`, `trim: true`, `minlength: 3` | Unique user handle. |
| `email` | `String` | `required: true`, `unique: true`, `trim: true`, `lowercase: true` | Primary email address used for sign-in and password resets. |
| `password` | `String` | `minlength: 6`, required if not using OAuth | Bcrypt hash of the user's password. Automatically hashed on save. |
| `refreshToken` | `String` | Optional | Stored hash of the current rotating refresh token. Used for refresh-token rotation and reuse detection. |
| `googleId` | `String` | Optional, indexed via OAuth | Unique subject ID provided by Google OAuth 2.0. |
| `githubId` | `String` | Optional, indexed via OAuth | Unique user ID provided by GitHub OAuth. |
| `authMethod` | `String` | `enum: ['local', 'google', 'github']`, `default: 'local'` | Identifies which provider initially registered the account. |
| `hasPassword` | `Boolean` | `default: true` | Flags whether a password is set. False for OAuth accounts until they invoke `/set-password`. |
| `createdAt` | `Date` | `default: Date.now` | Account creation timestamp (managed by `{ timestamps: true }`). |
| `updatedAt` | `Date` | Managed automatically | Last update timestamp (managed by `{ timestamps: true }`). |

### Built-In Methods

The `User` model exports the following instance methods on `userSchema.methods`:

- `user.comparePassword(candidatePassword)`: Uses `bcrypt.compare` to verify a plaintext password against the stored bcrypt hash. Returns a Promise resolving to `true` or `false`.
- `user.setPassword(password)`: Hashes and updates the password for an OAuth user, setting `hasPassword: true`.
- `user.canUsePasswordLogin()`: Returns boolean indicating whether password-based login is allowed.
- `user.toJSON()`: Serialization transform that automatically strips `password` before returning user data in HTTP responses.

### Built-In Hooks

- **`pre('save')`:** Automatically checks `this.isModified('password')`. If modified and present, generates a 10-round salt using `bcrypt.genSalt(10)` and hashes the password before saving to MongoDB.

### Serialization Safety (`toJSON`)

Whenever a Mongoose user document is converted to JSON (e.g. via `res.json(user)`), the built-in transform executes:

```javascript
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};
```

When you extend the schema and populate references, the populated subdocuments remain intact while sensitive credentials continue to be safely omitted.

---

## Pattern 1: Extending the User Schema (`User.schema.add`)

To add custom application fields or references directly to the `User` model without modifying Dimsee's internal source files, use `User.schema.add()`.

### Adding Primitive Fields

You can add standard MongoDB data types such as strings, numbers, booleans, and dates:

```javascript
const { User } = require('dimsee/backend');

User.schema.add({
  role: {
    type: String,
    enum: ['member', 'editor', 'admin', 'superadmin'],
    default: 'member'
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
});
```

### Adding Single Mongoose References (`ref`)

To establish a relationship where each user belongs to an external document (e.g., an `Organization`, `Company`, or `SubscriptionTier`), use `mongoose.Schema.Types.ObjectId` with the `ref` option:

```javascript
const mongoose = require('mongoose');
const { User } = require('dimsee/backend');

// 1. Define or import your related model
const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  plan: { type: String, enum: ['starter', 'pro', 'enterprise'], default: 'starter' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);

// 2. Add the reference field to the User schema
User.schema.add({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  }
});
```

### Adding Multi-Reference Arrays

To model one-to-many or many-to-many relationships (such as teams, projects, or assigned security groups), define an array of `ObjectId` references:

```javascript
User.schema.add({
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  favoriteProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }]
});
```

### Adding Embedded Subdocuments

For structured profile data that does not require a separate collection, embed subdocument schemas:

```javascript
User.schema.add({
  profile: {
    firstName: String,
    lastName: String,
    avatarUrl: {
      type: String,
      default: 'https://gravatar.com/avatar/?d=mp'
    },
    bio: {
      type: String,
      maxlength: 500
    },
    socialLinks: {
      website: String,
      twitter: String,
      github: String
    }
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    emailNotifications: { type: Boolean, default: true }
  }
});
```

### Bootstrap Timing (When to Extend)

> [!IMPORTANT]
> You must invoke `User.schema.add()` synchronously during application startup **before** your route handlers execute any queries against the `User` model.

Recommended project structure:

```
my-mern-app/
├── models/
│   ├── Organization.js
│   ├── Project.js
│   └── UserExtensions.js   <-- Call User.schema.add() here
├── server.js               <-- Require UserExtensions before createAuthBackend()
└── package.json
```

In `models/UserExtensions.js`:

```javascript
const mongoose = require('mongoose');
const { User } = require('dimsee/backend');

// Apply all custom fields and refs
User.schema.add({
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
});

module.exports = User;
```

In `server.js`:

```javascript
require('dotenv').config();
const express = require('express');

// 1. Initialize models and extend User BEFORE booting routes
require('./models/Organization');
require('./models/Team');
require('./models/UserExtensions');

// 2. Initialize Dimsee backend
const { createAuthBackend } = require('dimsee/backend');
const app = createAuthBackend({
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: 'http://localhost:3000'
});

app.listen(5000, () => console.log('Server running on port 5000'));
```

---

## Pattern 2: Referencing `User` from Other Models

In a typical MERN architecture, your business logic collections (posts, projects, comments, orders, audit logs) need to associate records with the authenticated Dimsee user.

### Child-to-User References

Set `ref: 'User'` in any model schema:

```javascript
// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Points directly to Dimsee's User model
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
```

### Many-to-Many Collaborations

For memberships, team rosters, or project collaborators:

```javascript
// models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'member', 'guest'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
```

---

## Pattern 3: Virtual Population (Unbounded Collections)

In MongoDB, storing an array of child `ObjectId` references directly inside the parent document (such as `user.projects = [id1, id2, ...]`) can lead to document size limit issues (16MB BSON limit) if a user creates thousands of records.

Instead, keep `owner: { type: ObjectId, ref: 'User' }` on the `Project` document, and attach a **Virtual Populate** definition to `User.schema`:

```javascript
const { User } = require('dimsee/backend');

// Define virtual 'projects' on User without storing arrays on the User document
User.schema.virtual('projects', {
  ref: 'Project',          // The child model to populate from
  localField: '_id',       // Find projects where project.owner === user._id
  foreignField: 'owner'    // Field on the Project model
});

// Ensure virtuals are serialized when converting to JSON or Objects
User.schema.set('toObject', { virtuals: true });
User.schema.set('toJSON', { virtuals: true });
```

Now you can populate all projects belonging to a user on demand:

```javascript
const userWithProjects = await User.findById(userId).populate('projects');
console.log(userWithProjects.projects); // Array of populated Project documents
```

---

## Keeping Fields and References Working with `populate()`

Mongoose's `.populate()` replaces specified `ObjectId` path references with the actual documents from referenced collections.

### Populating References on the User

When retrieving a user, chain `.populate('<fieldName>')`:

```javascript
const { User } = require('dimsee/backend');

// Single reference population
const user = await User.findById(req.user.userId)
  .populate('organization');

console.log(user.organization.name); // Access populated organization properties
```

#### Field Selection (Projection)

To optimize query payload size and avoid retrieving unnecessary fields from the referenced collection, specify a field selection projection:

```javascript
const user = await User.findById(req.user.userId)
  .populate('organization', 'name slug plan') // Only fetch name, slug, and plan
  .populate({
    path: 'teams',
    select: 'name members',
    options: { limit: 10 }
  });
```

### Populating User References on Associated Models

When querying business entities, populate the `User` reference to display author/owner information:

```javascript
const Project = require('./models/Project');

// Retrieve project and populate owner details safely
const project = await Project.findById(projectId)
  .populate('owner', 'username email profile');

console.log(project.owner.username); // "johndoe"
console.log(project.owner.password); // undefined (safely omitted)
```

> [!WARNING]
> When populating `User` from child documents, **always specify an explicit field selection** (e.g., `'username email profile'`). Never do a wildcard population of the auth collection without projection.

#### Populating Nested Arrays

To populate `User` references nested inside an array (e.g., team members):

```javascript
const Team = require('./models/Team');

const team = await Team.findById(teamId)
  .populate('organization', 'name slug')
  .populate({
    path: 'members.user',
    select: 'username email profile.avatarUrl'
  });

team.members.forEach(member => {
  console.log(member.user.username, member.role);
});
```

### Deep / Multi-Level Population

To populate a reference that itself has references (e.g., User -> Organization -> Billing Contact):

```javascript
const user = await User.findById(userId)
  .populate({
    path: 'organization',
    select: 'name plan owner',
    populate: {
      path: 'owner',
      model: 'User',
      select: 'username email'
    }
  });
```

### Populating Users in Protected Route Middleware

Dimsee's `authMiddleware` verifies the JWT access token from cookies and sets `req.user = { userId: '...' }`.

To make the fully populated Mongoose document available on `req.userDoc` throughout your route handlers, create a reusable middleware:

```javascript
// middleware/populateUser.js
const { User } = require('dimsee/backend');

const populateCurrentUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const user = await User.findById(req.user.userId)
      .populate('organization', 'name slug plan')
      .populate('teams', 'name');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found' });
    }

    // Attach the hydrated Mongoose document to the request
    req.userDoc = user;
    next();
  } catch (error) {
    console.error('Error populating user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = populateCurrentUser;
```

Attach it to your protected routes:

```javascript
const { authMiddleware } = require('dimsee/backend');
const populateCurrentUser = require('./middleware/populateUser');

app.get('/api/me/dashboard', authMiddleware, populateCurrentUser, (req, res) => {
  res.json({
    success: true,
    user: req.userDoc, // Serialized via toJSON(), sensitive fields excluded
    organization: req.userDoc.organization
  });
});
```

---

## Complete End-to-End Implementation Example

Below is a complete, self-contained Express server showing how to extend `User`, establish two-way references, and execute populated queries:

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { createAuthBackend, authMiddleware, User } = require('dimsee/backend');

// ============================================================
// 1. Define Associated Models
// ============================================================
const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  tier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' }
}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'active' }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

// ============================================================
// 2. Extend Dimsee's User Schema
// ============================================================
User.schema.add({
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  profile: {
    displayName: String,
    avatarUrl: String
  }
});

// Add virtual populate for projects
User.schema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'owner'
});
User.schema.set('toObject', { virtuals: true });
User.schema.set('toJSON', { virtuals: true });

// ============================================================
// 3. Initialize Dimsee Backend
// ============================================================
const app = createAuthBackend({
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/dimsee-extended',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-key',
  corsOrigin: 'http://localhost:3000'
});

// ============================================================
// 4. Custom Routes with Population
// ============================================================

// Route: Get current user profile with populated organization & projects
app.get('/api/profile/full', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('organization')
      .populate('projects');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route: Create a project linked to the authenticated user
app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const { title, organizationId } = req.body;

    const project = new Project({
      title,
      organization: organizationId,
      owner: req.user.userId // Associate with logged-in Dimsee user
    });

    await project.save();

    // Re-query with populated references
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'username email profile')
      .populate('organization', 'name slug tier');

    res.status(201).json({
      success: true,
      project: populatedProject
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Extended Dimsee server running on port ${PORT}`));
```

---

## Common Pitfalls & Best Practices

### 1. `MissingSchemaError: Schema hasn't been registered for model "..."`
- **Cause:** You called `.populate('Organization')`, but `mongoose.model('Organization', ...)` was never imported or compiled in your running process.
- **Fix:** Ensure all referenced model files are required/imported at application startup before any route triggers a query with `.populate()`.

### 2. Schema Extension Timing
- **Cause:** Calling `User.schema.add(...)` inside a route callback or asynchronously after queries have already run.
- **Fix:** Keep schema extensions in an initialization file (e.g. `models/UserExtensions.js`) and load it immediately when your application starts.

### 3. Exposing Sensitive Credentials via Populate
- **Cause:** Running `Project.find().populate('owner')` without specifying fields will return all paths on the `User` document.
- **Fix:** Always provide an explicit field whitelist when populating users:
  ```javascript
  .populate('owner', 'username email profile')
  ```
  Dimsee's built-in `toJSON()` method deletes `password` on serialization, but using projection prevents sensitive fields (e.g. `refreshToken`) from ever being retrieved from the database.

### 4. Overwriting Pre-Save Middleware
- **Caution:** Dimsee depends on its `userSchema.pre('save')` hook to salt and hash passwords with bcrypt. Never overwrite existing hooks. If you need additional pre-save behavior, append new middleware using:
  ```javascript
  User.schema.pre('save', function(next) {
    // Custom pre-save logic here
    next();
  });
  ```

### 5. Cleaning Up Cascade Relations
- If a user account is deleted, ensure associated foreign keys or owned projects are properly handled using a pre-delete hook or transaction:
  ```javascript
  User.schema.pre('findOneAndDelete', async function() {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
      await mongoose.model('Project').deleteMany({ owner: doc._id });
    }
  });
  ```
