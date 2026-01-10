const http = require('http');

async function testAutoSave() {
  console.log('=== Testing Auto-Save Functionality ===\n');
  
  // Simulate a simulation completion event
  const simulationResult = {
    experimentId: 'acid-base',
    userId: 2,
    parameters: {
      temperature: 25,
      concentration: 0.1,
      volume: 1.0,
      time: 60
    },
    results: {
      ph: 7.2,
      color: '#00ff00',
      efficiency: 95.5
    },
    duration: 60,
    efficiency: 95.5,
    timestamp: new Date().toISOString()
  };
  
  console.log('🧪 Simulating auto-save for experiment:', simulationResult.experimentId);
  console.log('👤 User ID:', simulationResult.userId);
  console.log('⚡ Efficiency:', simulationResult.efficiency + '%');
  
  // Test the save endpoint
  const success = await saveResult(simulationResult);
  
  if (success) {
    console.log('✅ Auto-save simulation successful!');
    
    // Verify the result was saved by loading it back
    console.log('\n🔍 Verifying saved result...');
    const results = await loadResults(simulationResult.experimentId, simulationResult.userId);
    
    if (results.length > 0) {
      const latestResult = results[results.length - 1]; // Get the latest result
      console.log('✅ Result verified in database:');
      console.log('   ID:', latestResult.id);
      console.log('   Efficiency:', latestResult.efficiency + '%');
      console.log('   Duration:', latestResult.duration + 's');
      console.log('   Created:', latestResult.createdAt);
    } else {
      console.log('❌ Could not verify saved result');
    }
  } else {
    console.log('❌ Auto-save failed');
  }
}

function saveResult(result) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(result);
    
    const options = {
      hostname: 'localhost',
      port: 5150,
      path: '/api/experiments/results',
      method: 'POST',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
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
        console.log('📡 Save response status:', res.statusCode);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('💾 Save response:', data);
          resolve(true);
        } else {
          console.log('❌ Save failed:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Save error:', err.message);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ Save timeout');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

function loadResults(experimentId, userId) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5150,
      path: `/api/experiments/results/${experimentId}/${userId}`,
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
          if (res.statusCode === 200) {
            const results = JSON.parse(data);
            resolve(Array.isArray(results) ? results : []);
          } else {
            resolve([]);
          }
        } catch (e) {
          resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
    req.on('timeout', () => resolve([]));
    req.end();
  });
}

testAutoSave();