const http = require('http');

async function testHistoryService() {
  console.log('=== Testing History Service Logic ===\n');
  
  const userId = 2; // User ID that has results in the database
  
  // Step 1: Test user experiments endpoint (should return empty)
  console.log('Step 1: Testing user experiments endpoint...');
  const userExperiments = await testEndpoint(`/api/experiments/user/${userId}`);
  console.log(`User ${userId} has ${userExperiments.length} experiments\n`);
  
  // Step 2: Test direct results loading for common experiment IDs
  console.log('Step 2: Testing direct results loading...');
  const commonExperimentIds = [
    'acid-base', 'decomposition', 'electrolysis', 'equilibrium', 
    'combustion', 'precipitation', 'catalysis', 'redox',
    'test-experiment-123'
  ];
  
  let totalResults = 0;
  for (const experimentId of commonExperimentIds) {
    const results = await testEndpoint(`/api/experiments/results/${experimentId}/${userId}`);
    if (results.length > 0) {
      console.log(`✅ Found ${results.length} results for experiment: ${experimentId}`);
      totalResults += results.length;
      
      // Show sample result
      const sample = results[0];
      console.log(`   Sample result: ID=${sample.id}, Duration=${sample.duration}s, Efficiency=${sample.efficiency}%`);
    }
  }
  
  console.log(`\n📊 Total results found: ${totalResults}`);
  
  if (totalResults > 0) {
    console.log('✅ History service should now be able to load data!');
  } else {
    console.log('❌ No results found - history will still be empty');
  }
}

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
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
      res.on('data', (chunk) => {
        data += chunk;
      });
      
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

testHistoryService();