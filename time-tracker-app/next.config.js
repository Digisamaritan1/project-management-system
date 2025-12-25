const path = require('path');

module.exports = {
  // ... other config options
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, '.');
    return config;
  },
} 