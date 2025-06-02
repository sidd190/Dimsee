// Root index.js - Universal Entry Point
'use strict';

const backend = require('./backend');

module.exports = {
  ...backend,
  // Frontend components are imported dynamically when using the /frontend subpath
};
