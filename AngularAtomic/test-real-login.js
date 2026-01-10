const http = require('http');

function testRealLogin() {
  // Thử với credentials có thể có trong database
  const testCredentials = [
    { username: "admin", password: "admin" },
    { username: "test", password: "123456" },
    { username: "user", password: "password" },
    { username: "TanThuyHoang", password: "123456" } // Từ response trước
  ];

  async function tryLogin(credentials) {
    return new Promise((resolve) => {
      const loginData = JSON.stringify(credentials);

      const options = {
        hostname: 'localhost',
        port: 5150,
        path: '/api/auth/login',
        method: 'POST',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:4200',
          'Content-Length': Buffer.byteLength(loginData)
        }
      };

      console.log(`\nTrying: ${credentials.username}/${credentials.password}`);

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`Status: ${res.statusCode}`);
          if (data) {
            console.log(`Response: ${data.substring(0, 200)}`);
          }
          
          if (res.statusCode === 200) {
            console.log('✅ LOGIN SUCCESS!');
            resolve({ success: true, credentials, response: data });
          } else {
            console.log(`❌ Failed: ${res.statusCode}`);
            resolve({ success: false, credentials, status: res.statusCode });
          }
        });
      });

      req.on('error', (err) => {
        console.log(`❌ Error: ${err.message}`);
        resolve({ success: false, credentials, error: err.message });
      });

      req.write(loginData);
      req.end();
    });
  }

  async function testAll() {
    console.log('Testing login with various credentials...\n');
    
    for (const creds of testCredentials) {
      const result = await tryLogin(creds);
      if (result.success) {
        console.log('\n🎉 Found working credentials!');
        console.log('Use these in your Angular app for testing.');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between attempts
    }
    
    console.log('\n=== Summary ===');
    console.log('If no credentials worked, you may need to:');
    console.log('1. Register a new user first');
    console.log('2. Check your backend database for existing users');
    console.log('3. Use the correct username/password format');
  }

  testAll();
}

testRealLogin();