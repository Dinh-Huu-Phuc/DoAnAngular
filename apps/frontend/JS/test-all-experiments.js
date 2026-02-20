const http = require('http');

function testAllExperiments() {
  const options = {
    hostname: 'localhost',
    port: 5150,
    path: '/api/experiments',
    method: 'GET',
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'Origin': 'http://localhost:4200'
    }
  };

  console.log('Testing all experiments in database...');
  console.log('URL:', `http://localhost:5150${options.path}`);

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const experiments = JSON.parse(data);
          console.log(`✅ Total experiments in database: ${experiments.length}`);
          
          if (experiments.length === 0) {
            console.log('❌ Database has NO experiments at all!');
            console.log('This means experiments are not being saved when created.');
            console.log('\nPossible issues:');
            console.log('1. saveExperiment() method not being called');
            console.log('2. saveExperiment() failing silently');
            console.log('3. User creating experiments without saving to DB');
          } else {
            console.log('\n=== Experiments in Database ===');
            experiments.forEach((exp, i) => {
              console.log(`${i + 1}. ${exp.title}`);
              console.log(`   - ID: ${exp.id}`);
              console.log(`   - ExperimentId: ${exp.experimentId}`);
              console.log(`   - UserId: ${exp.userId}`);
              console.log(`   - Level: ${exp.level}`);
              console.log(`   - Public: ${exp.isPublic}`);
              console.log(`   - Created: ${exp.createdAt}`);
              console.log('');
            });
            
            // Group by user ID
            const userGroups = experiments.reduce((groups, exp) => {
              const userId = exp.userId;
              if (!groups[userId]) groups[userId] = [];
              groups[userId].push(exp);
              return groups;
            }, {});
            
            console.log('=== Experiments by User ===');
            Object.keys(userGroups).forEach(userId => {
              console.log(`User ${userId}: ${userGroups[userId].length} experiments`);
            });
          }
        } catch (e) {
          console.log('❌ Error parsing response:', e.message);
          console.log('Raw response:', data.substring(0, 500));
        }
      } else {
        console.log(`❌ Status: ${res.statusCode}`);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Connection Error: ${err.message}`);
  });

  req.end();
}

testAllExperiments();