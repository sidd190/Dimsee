const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
require('dotenv').config();

// Debug environment variables
console.log('Environment Variables Check:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not Set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set');
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'Set' : 'Not Set');
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Not Set');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const handleOAuthUser = async (profile, provider, done) => {
  try {
    const email = profile.emails[0].value;
    const providerId = `${provider}Id`; // 'googleId' or 'githubId'

    // First, try to find user by OAuth provider ID
    let user = await User.findOne({ [providerId]: profile.id });
    
    if (!user) {
      // If not found by provider ID, try to find by email
      user = await User.findOne({ email });
      
      if (user) {
        // User exists but hasn't used this OAuth provider before
        // Update their profile with the OAuth provider ID
        user[providerId] = profile.id;
        await user.save();
        return done(null, user);
      }

      // Create new user if doesn't exist
      user = new User({
        username: profile.displayName?.replace(/\s+/g, '_').toLowerCase() || 
                 profile.username?.toLowerCase() ||
                 email.split('@')[0],
        email,
        [providerId]: profile.id,
        authMethod: provider, // Track how the user was created
        hasPassword: false    // Indicate that this user can't use password login
      });

      await user.save();
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
};

const configureOAuthStrategies = (config = {}) => {
  // Google OAuth Strategy
  if (config.google?.clientId || process.env.GOOGLE_CLIENT_ID) {
    const googleConfig = {
      clientID: config.google?.clientId || process.env.GOOGLE_CLIENT_ID,
      clientSecret: config.google?.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: config.google?.callbackURL || "/api/auth/google/callback",
      scope: ['profile', 'email']
    };

    passport.use(new GoogleStrategy(googleConfig,
      async (accessToken, refreshToken, profile, done) => {
        await handleOAuthUser(profile, 'google', done);
      }
    ));
  } else {
    console.warn('Google OAuth credentials not found. Google sign-in will be disabled.');
  }

  // GitHub OAuth Strategy
  if (config.github?.clientId || process.env.GITHUB_CLIENT_ID) {
    const githubConfig = {
      clientID: config.github?.clientId || process.env.GITHUB_CLIENT_ID,
      clientSecret: config.github?.clientSecret || process.env.GITHUB_CLIENT_SECRET,
      callbackURL: config.github?.callbackURL || "/api/auth/github/callback",
      scope: ['user:email']
    };

    passport.use(new GitHubStrategy(githubConfig,
      async (accessToken, refreshToken, profile, done) => {
        await handleOAuthUser(profile, 'github', done);
      }
    ));
  } else {
    console.warn('GitHub OAuth credentials not found. GitHub sign-in will be disabled.');
  }
};

// Initialize with default configuration
configureOAuthStrategies();

// Export both passport and the configuration function
module.exports = { passport, configureOAuthStrategies }; 