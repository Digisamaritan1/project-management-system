const fs = require('fs');

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  fs.writeFileSync(
    './firebase-adminsdk.json',
    process.env.FIREBASE_SERVICE_ACCOUNT
  );
  console.log('Firebase JSON file created');
}
