const http = require('http');

const testData = {
  fullName: 'Test User Direct',
  username: 'testdirect' + Date.now(),
  email: 'testdirect' + Date.now() + '@example.com',
  phoneNumber: '1234567890',
  password: 'TestPassword123',
  confirmPassword: 'TestPassword123'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5150,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Accept': 'application/json'
  }
};

console.log('🧪 Testing direct register API call...');
console.log('📤 Sending data:', testData);

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Response:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Register API works directly!');
      console.log('💡 The issue is likely CORS or Angular configuration');
    } else {
      console.log('❌ Register API failed');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
});

req.write(postData);
req.end();