const http = require('http');

function testSaveResult() {
  const testResult = {
    experimentId: "test-experiment-123",
    userId: 2, // User ID từ login thành công
    parameters: JSON.stringify({
      temperature: 25,
      pressure: 1,
      concentration: 0.1
    }),
    results: JSON.stringify({
      efficiency: 85.5,
      yield: 92.3,
      time: 120
    }),
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

  console.log('Testing save simulation result...');
  console.log('URL:', `http://localhost:5150${options.path}`);
  console.log('Data:', testResult);

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ Save result endpoint is working!');
      } else if (res.statusCode === 500) {
        console.log('❌ 500 Internal Server Error - Backend has an issue');
        console.log('Check backend logs for detailed error');
      } else if (res.statusCode === 400) {
        console.log('⚠️ 400 Bad Request - Data format may be wrong');
      } else {
        console.log(`❌ Unexpected status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Connection Error: ${err.message}`);
  });

  req.write(postData);
  req.end();
}

testSaveResult();