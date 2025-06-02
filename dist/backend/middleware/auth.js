"use strict";

// backend/middleware/auth.js - Auth Middleware
var jwt = require('jsonwebtoken');
var authMiddleware = function authMiddleware(req, res, next) {
  try {
    var jwtSecret = req.app.locals.authConfig.jwtSecret;
    var token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    var decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
module.exports = authMiddleware;