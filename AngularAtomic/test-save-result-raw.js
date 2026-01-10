const http = require('http');

function testSaveResultRaw() {
  // Test với raw objects (không stringify)
  const testResult = {
    experimentId: "test-experiment-123",
    userId: 2,
    parameters: {
      temperature: 25,
      pressure: 1,
      concentration: 0.1
    },
    results: {
      efficiency: 85.5,
      yield: 92.3,
      time: 120
    },
    duration: 120,
    efficiency: 85.5
  };

  const postData = JSON.stringify(testResult);

  const options = {
    hostname: 'localhost',
    port: 5150,
    path: '/api/experiments/results',
    method: 'POST',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': 'http://localhost:4200',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('Testing save simulation result with RAW OBJECTS...');
  console.log('URL:', `http://localhost:5150${options.path}`);
  console.log('Data:', testResult);

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data.substring(0, 500));
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ Raw objects work! Backend expects objects, not JSON strings.');
      } else if (res.statusCode === 500) {
        console.log('❌ Still 500 error with raw objects');
      } else {
        console.log(`Status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Connection Error: ${err.message}`);
  });

  req.write(postData);
  req.end();
}

testSaveResultRaw();