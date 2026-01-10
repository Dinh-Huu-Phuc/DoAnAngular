const http = require('http');

function testExperimentsEndpoints() {
  const endpoints = [
    '/api/experiments',
    '/api/experiments/search',
    '/api/experiments/user/1'
  ];

  async function testEndpoint(path) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5150,
        path: path,
        method: 'GET',
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Origin': 'http://localhost:4200'
        }
      };

      console.log(`\nTesting: ${path}`);

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`Status: ${res.statusCode}`);
          if (data && data.length < 500) {
            console.log(`Response: ${data}`);
          } else if (data) {
            console.log(`Response: ${data.substring(0, 200)}...`);
          }
          
          resolve({ path, status: res.statusCode, success: res.statusCode < 500 });
        });
      });

      req.on('error', (err) => {
        console.log(`❌ Error: ${err.message}`);
        resolve({ path, error: err.message, success: false });
      });

      req.end();
    });
  }

  async function testAll() {
    console.log('Testing experiments endpoints...');
    
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      if (result.success) {
        console.log(`✅ ${result.path} is working`);
      } else {
        console.log(`❌ ${result.path} failed`);
      }
    }
  }

  testAll();
}

testExperimentsEndpoints();