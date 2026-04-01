const fs = require('fs');

if (fs.existsSync('.env')) {
  console.log('===== GENERATED ENV =====');
  console.log(fs.readFileSync('.env', 'utf-8'));
  console.log('=========================');
}
