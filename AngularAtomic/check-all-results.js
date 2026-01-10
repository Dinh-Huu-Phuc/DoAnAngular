const http = require('http');

async function checkAllResults() {
  console.log('=== Kiểm tra tất cả kết quả trong database ===\n');
  
  const userId = 2;
  const allExperimentIds = [
    'acid-base', 'decomposition', 'electrolysis', 'equilibrium', 
    'combustion', 'precipitation', 'catalysis', 'redox',
    'test-experiment-123', 'custom-experiment', 'demo-experiment'
  ];
  
  let totalResults = 0;
  const resultsByExperiment = {};
  
  for (const experimentId of allExperimentIds) {
    const results = await testEndpoint(`/api/experiments/results/${experimentId}/${userId}`);
    if (results.length > 0) {
      console.log(`✅ ${experimentId}: ${results.length} kết quả`);
      resultsByExperiment[experimentId] = results;
      totalResults += results.length;
      
      // Hiển thị chi tiết từng kết quả
      results.forEach((result, index) => {
        console.log(`   ${index + 1}. ID=${result.id}, Efficiency=${result.efficiency}%, Duration=${result.duration}s, Created=${result.createdAt}`);
      });
    }
  }
  
  console.log(`\n📊 TỔNG KẾT:`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Tổng số kết quả: ${totalResults}`);
  console.log(`   Số loại thí nghiệm có kết quả: ${Object.keys(resultsByExperiment).length}`);
  
  if (totalResults >= 10) {
    console.log('\n✅ Có đủ 10+ kết quả trong database!');
  } else {
    console.log(`\n⚠️ Chỉ có ${totalResults} kết quả, cần thêm ${10 - totalResults} kết quả nữa để đạt 10.`);
  }
  
  return { totalResults, resultsByExperiment };
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

checkAllResults();