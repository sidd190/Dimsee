const User = require('../models/User');

describe('User Schema Verification (Issue #15 & Issue #92)', () => {
  it('has timestamps enabled in schema options without manual createdAt duplicate', () => {
    expect(User.schema.options.timestamps).toBe(true);
    expect(User.schema.paths.createdAt).toBeDefined();
    expect(User.schema.paths.updatedAt).toBeDefined();
    // Verify that createdAt is handled by Mongoose timestamps, not custom default
    expect(User.schema.paths.createdAt.defaultValue).toBeUndefined();
  });

  it('declares indexes on hot paths without duplicate specifications (Issue #92)', () => {
    const indexes = User.schema.indexes();
    
    // Each index entry is [fieldsObject, optionsObject]
    const emailIndex = indexes.find(([fields]) => fields.email !== undefined);
    const usernameIndex = indexes.find(([fields]) => fields.username !== undefined);
    const refreshTokenIndex = indexes.find(([fields]) => fields.refreshToken !== undefined);

    expect(emailIndex).toBeDefined();
    expect(emailIndex[1].unique).toBe(true);

    expect(usernameIndex).toBeDefined();
    expect(usernameIndex[1].unique).toBe(true);

    expect(refreshTokenIndex).toBeDefined();

    // Verify there are no duplicate index specifications for any field
    const indexedKeys = indexes.map(([fields]) => Object.keys(fields).sort().join(','));
    const uniqueKeys = new Set(indexedKeys);
    expect(indexedKeys.length).toBe(uniqueKeys.size);
  });
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
