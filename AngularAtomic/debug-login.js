const http = require('http');

function testLogin() {
  const loginData = JSON.stringify({
    username: "test",
    password: "test"
  });

  const options = {
    hostname: 'localhost',
    port: 4200, // Thông qua Angular proxy
    path: '/api/auth/login',
    method: 'POST',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  console.log('Testing login through proxy...');
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
        console.log('\n⚠️  Server is redirecting. This might be:');
        console.log('1. Authentication middleware redirecting to login page');
        console.log('2. CORS issue causing redirect');
        console.log('3. Backend expecting different authentication flow');
      } else if (res.statusCode === 400) {
        console.log('\n✅ Backend is responding! Bad request is expected with test credentials.');
      } else if (res.statusCode === 401) {
        console.log('\n✅ Backend is responding! Unauthorized is expected with test credentials.');
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Error: ${err.message}`);
  });

  req.write(loginData);
  req.end();
}

testLogin();