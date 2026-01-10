const http = require('http');

async function testCompleteFlow() {
  console.log('=== Testing Complete Experiment History Flow ===\n');
  
  const userId = 2;
  
  console.log('🔍 Step 1: Check current state');
  console.log('User ID:', userId);
  
  // Test user experiments (should be empty)
  const userExperiments = await testEndpoint(`/api/experiments/user/${userId}`);
  console.log(`📊 User experiments: ${userExperiments.length}`);
  
  // Test direct results loading (should have data)
  console.log('\n🔍 Step 2: Check existing results');
  const experimentIds = ['acid-base', 'test-experiment-123'];
  let totalResults = 0;
  
  for (const expId of experimentIds) {
    const results = await testEndpoint(`/api/experiments/results/${expId}/${userId}`);
    if (results.length > 0) {
      console.log(`✅ ${expId}: ${results.length} results`);
      totalResults += results.length;
    }
  }
  
  console.log(`📈 Total existing results: ${totalResults}`);
  
  // Test auto-save (simulate new experiment completion)
  console.log('\n🔍 Step 3: Test auto-save functionality');
  const newResult = await testAutoSave(userId);
  
  if (newResult) {
    console.log('✅ Auto-save successful');
    
    // Verify the new result appears
    const updatedResults = await testEndpoint(`/api/experiments/results/combustion/${userId}`);
    console.log(`📈 Updated results for combustion: ${updatedResults.length}`);
    totalResults += updatedResults.length;
  }
  
  console.log(`\n📊 Final Summary:`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Total Results: ${totalResults}`);
  console.log(`   User Experiments: ${userExperiments.length}`);
  
  if (totalResults > 0) {
    console.log('\n✅ EXPECTED BEHAVIOR:');
    console.log('   - History page should show results');
    console.log('   - Auto-save should work when simulations complete');
    console.log('   - Real-time updates should appear in history');
    
    console.log('\n🔧 TO TEST IN BROWSER:');
    console.log('   1. Open http://localhost:4200');
    console.log('   2. Make sure user is authenticated (use debug-auth.html if needed)');
    console.log('   3. Go to Experiment History page');
    console.log('   4. Should see ' + totalResults + ' results');
    console.log('   5. Run a simulation to test auto-save');
  } else {
    console.log('\n❌ NO RESULTS FOUND - History will be empty');
  }
}

async function testAutoSave(userId) {
  const simulationResult = {
    experimentId: 'combustion',
    userId: userId,
    parameters: {
      temperature: 650,
      concentration: 1.0,
      volume: 1.0,
      time: 30
    },
    results: {
      mass: 1.66,
      efficiency: 98.0,
      gasVolume: 0
    },
    duration: 30,
    efficiency: 98.0,
    timestamp: new Date().toISOString()
  };
  
  return await saveResult(simulationResult);
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
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve(res.statusCode === 200 || res.statusCode === 201);
      });
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.write(postData);
    req.end();
  });
}

function testEndpoint(path) {
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

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const result = JSON.parse(data);
            resolve(Array.isArray(result) ? result : []);
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

testCompleteFlow();