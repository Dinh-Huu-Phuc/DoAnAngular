const http = require('http');

function testUserExperiments() {
  const userId = 1; // User ID từ logs
  
  const options = {
    hostname: 'localhost',
    port: 5150,
    path: `/api/experiments/user/${userId}`,
    method: 'GET',
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'Origin': 'http://localhost:4200'
    }
  };

  console.log('Testing user experiments...');
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
        try {
          const experiments = JSON.parse(data);
          console.log(`✅ User ${userId} has ${experiments.length} experiments`);
          
          if (experiments.length === 0) {
            console.log('❌ User has no experiments! This is why history is empty.');
            console.log('Solutions:');
            console.log('1. Create/save an experiment first');
            console.log('2. Check if experiments are being saved with correct user ID');
            console.log('3. Check if user ID in auth service matches database');
          } else {
            experiments.forEach((exp, i) => {
              console.log(`Experiment ${i + 1}:`, {
                id: exp.id,
                experimentId: exp.experimentId,
                title: exp.title,
                userId: exp.userId
              });
            });
          }
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

// Test với user ID khác nhau
async function testMultipleUsers() {
  console.log('=== Testing User Experiments ===\n');
  
  for (let userId = 1; userId <= 3; userId++) {
    console.log(`\n--- Testing User ID: ${userId} ---`);
    await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5150,
        path: `/api/experiments/user/${userId}`,
        method: 'GET',
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Origin': 'http://localhost:4200'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const experiments = JSON.parse(data);
            console.log(`User ${userId}: ${experiments.length} experiments`);
            if (experiments.length > 0) {
              console.log('Sample experiment:', experiments[0].title);
            }
          } catch (e) {
            console.log(`User ${userId}: Error parsing response`);
          }
          resolve();
        });
      });

      req.on('error', () => resolve());
      req.end();
    });
  }
}

testMultipleUsers();