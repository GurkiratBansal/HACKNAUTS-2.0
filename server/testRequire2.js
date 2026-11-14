const path = require('path');
try {
  const modulePath = path.join(__dirname, 'src', 'db', 'schema', 'emergency');
  console.log('Checking path:', modulePath);
  const exists = require('fs').existsSync(modulePath + '.js');
  console.log('File exists:', exists);
  if (exists) {
    require(modulePath);
    console.log('Module loaded successfully');
  }
} catch (e) {
  console.error('Error:', e.message);
}