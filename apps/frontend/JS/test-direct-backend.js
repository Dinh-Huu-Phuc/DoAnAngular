const http = require('http');

function testDirectBackend() {
  const loginData = JSON.stringify({
    username: "test",
    password: "test"
  });

  const options = {
    hostname: 'localhost',
    port: 5150, // Trực tiếp backend
    path: '/api/auth/login',
    method: 'POST',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': 'http://localhost:4200', // Giả lập request từ Angular
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  console.log('Testing direct backend connection...');
  console.log('URL: http://localhost:5150/api/auth/login');
  console.log('Data:', loginData);

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 302) {
        console.log('\n❌ Backend is still redirecting even on direct connection!');
        console.log('This suggests backend authentication middleware is redirecting.');
      } else if (res.statusCode === 400 || res.statusCode === 401) {
        console.log('\n✅ Backend is working! Authentication error is expected with test credentials.');
      } else if (res.statusCode === 200) {
        console.log('\n✅ Backend is working perfectly!');
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Error: ${err.message}`);
  });

  req.write(loginData);
  req.end();
}

testDirectBackend();