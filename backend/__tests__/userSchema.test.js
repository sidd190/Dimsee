const User = require('../models/User');

describe('User Schema Verification (Issue #15 & Issue #92)', () => {
  it('has timestamps enabled in schema options without manual createdAt duplicate', () => {
    expect(User.schema.options.timestamps).toBe(true);
    expect(User.schema.paths.createdAt).toBeDefined();
    expect(User.schema.paths.updatedAt).toBeDefined();
    // Verify that createdAt is handled by Mongoose timestamps, not custom default
    expect(User.schema.paths.createdAt.defaultValue).toBeUndefined();
  });

  it('declares indexes on hot paths: email, username, and refreshToken (Issue #92)', () => {
    const indexes = User.schema.indexes();
    const indexedFieldNames = indexes.map(([fields]) => Object.keys(fields)).flat();

    // Check individual indexed paths or schema indexes
    expect(indexedFieldNames).toContain('email');
    expect(indexedFieldNames).toContain('username');
    expect(indexedFieldNames).toContain('refreshToken');
  });

  it('omits password from JSON representation', () => {
    const user = new User({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'SamplePassword123'
    });

    const json = user.toJSON();
    expect(json.password).toBeUndefined();
    expect(json.username).toBe('johndoe');
    expect(json.email).toBe('john@example.com');
  });

  it('provides canUsePasswordLogin helper based on hasPassword state', () => {
    const localUser = new User({ hasPassword: true });
    expect(localUser.canUsePasswordLogin()).toBe(true);

    const oauthUser = new User({ hasPassword: false });
    expect(oauthUser.canUsePasswordLogin()).toBe(false);
  });
});
