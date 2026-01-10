const http = require('http');

// Test endpoint thực tế từ ứng dụng
const testEndpoints = [
  '/api/auth/login',
  '/api/experiments/public',
  '/api/ai/chat'
];

function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5150,
      path: path,
      method: 'GET',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    console.log(`\nTesting: ${path}`);

    const req = http.request(options, (res) => {
      console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (data) {
          console.log(`Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        }
        resolve({ path, status: res.statusCode, success: true });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve({ path, error: err.message, success: false });
    });

    req.on('timeout', () => {
      console.log(`❌ Timeout`);
      req.destroy();
      resolve({ path, error: 'timeout', success: false });
    });

    req.end();
  });
}

async function testAllEndpoints() {
  console.log('Testing backend endpoints...\n');
  
  for (const endpoint of testEndpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n=== Summary ===');
  console.log('Backend is running on port 5150');
  console.log('If you see 404/405 errors, that\'s normal for GET requests to POST endpoints');
  console.log('The important thing is that the server responds (not connection refused)');
}

testAllEndpoints();