const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5150,
  path: '/api/health', // hoặc endpoint nào đó của backend
  method: 'GET',
  timeout: 5000
};

console.log('Testing backend connection...');

const req = http.request(options, (res) => {
  console.log(`✅ Backend is running! Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (err) => {
  console.log('❌ Backend connection failed:');
  console.log(`Error: ${err.message}`);
  console.log('\nPossible solutions:');
  console.log('1. Start your backend server on port 5150');
  console.log('2. Check if port 5150 is correct');
  console.log('3. Verify backend is listening on localhost');
});

req.on('timeout', () => {
  console.log('❌ Connection timeout - backend may be slow or not responding');
  req.destroy();
});

req.end();