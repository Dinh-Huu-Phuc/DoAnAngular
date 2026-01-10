const http = require('http');

function testExperimentsEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 5150,
    path: '/api/experiments/public',
    method: 'GET',
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'Origin': 'http://localhost:4200'
    }
  };

  console.log('Testing /api/experiments/public endpoint...');

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Experiments endpoint is working!');
      } else if (res.statusCode === 400) {
        console.log('⚠️ Bad request - but endpoint exists');
      } else if (res.statusCode === 401) {
        console.log('⚠️ Unauthorized - endpoint exists but needs auth');
      } else {
        console.log(`❌ Unexpected status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Connection Error: ${err.message}`);
    console.log('Backend may not be running or endpoint doesn\'t exist');
  });

  req.on('timeout', () => {
    console.log('❌ Timeout - backend is slow or not responding');
    req.destroy();
  });

  req.end();
}

testExperimentsEndpoint();