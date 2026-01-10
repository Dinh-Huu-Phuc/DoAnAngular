const http = require('http');

function testGetResults() {
  const experimentId = "test-experiment-123";
  const userId = 2;
  
  const options = {
    hostname: 'localhost',
    port: 5150,
    path: `/api/experiments/results/${experimentId}/${userId}`,
    method: 'GET',
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'Origin': 'http://localhost:4200'
    }
  };

  console.log('Testing get simulation results...');
  console.log('URL:', `http://localhost:5150${options.path}`);

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Get results endpoint is working!');
        try {
          const results = JSON.parse(data);
          console.log('Number of results:', results.length);
        } catch (e) {
          console.log('Response is not JSON');
        }
      } else {
        console.log(`❌ Status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Connection Error: ${err.message}`);
  });

  req.end();
}

testGetResults();