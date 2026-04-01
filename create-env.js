const fs = require('fs');

// Copy ALL Railway env variables into .env
const envVars = Object.entries(process.env)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync('.env', envVars);

console.log('✅ .env fully synced with Railway variables');
