const http = require('http');

async function addMoreResults() {
  console.log('=== Thêm kết quả để đạt 10 kết quả ===\n');
  
  const userId = 2;
  
  // Thêm kết quả thí nghiệm electrolysis
  const electrolysisResult = {
    experimentId: 'electrolysis',
    userId: userId,
    parameters: {
      temperature: 25,
      concentration: 0.5,
      volume: 0.5,
      time: 300
    },
    results: {
      mass: 0.318,
      color: '#0080ff',
      efficiency: 85.0
    },
    duration: 300,
    efficiency: 85.0,
    timestamp: new Date().toISOString()
  };
  
  // Thêm kết quả thí nghiệm precipitation
  const precipitationResult = {
    experimentId: 'precipitation',
    userId: userId,
    parameters: {
      temperature: 25,
      concentration: 0.1,
      volume: 0.5,
      time: 60
    },
    results: {
      mass: 1.435,
      efficiency: 99.0,
      ph: 7.0
    },
    duration: 60,
    efficiency: 99.0,
    timestamp: new Date().toISOString()
  };
  
  console.log('🧪 Thêm kết quả electrolysis...');
  const success1 = await saveResult(electrolysisResult);
  
  console.log('🧪 Thêm kết quả precipitation...');
  const success2 = await saveResult(precipitationResult);
  
  if (success1 && success2) {
    console.log('✅ Đã thêm 2 kết quả thành công!');
    
    // Kiểm tra lại tổng số kết quả
    console.log('\n🔍 Kiểm tra lại tổng số kết quả...');
    const allExperimentIds = [
      'acid-base', 'decomposition', 'electrolysis', 'equilibrium', 
      'combustion', 'precipitation', 'catalysis', 'redox',
      'test-experiment-123'
    ];
    
    let totalResults = 0;
    for (const experimentId of allExperimentIds) {
      const results = await loadResults(experimentId, userId);
      if (results.length > 0) {
        console.log(`✅ ${experimentId}: ${results.length} kết quả`);
        totalResults += results.length;
      }
    }
    
    console.log(`\n📊 TỔNG SỐ KẾT QUẢ: ${totalResults}`);
    
    if (totalResults >= 10) {
      console.log('🎉 Đã đạt 10+ kết quả! Bây giờ có thể test nút "Làm mới"');
    }
  } else {
    console.log('❌ Có lỗi khi thêm kết quả');
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
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📡 Response status: ${res.statusCode}`);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('💾 Lưu thành công:', JSON.parse(data).id);
          resolve(true);
        } else {
          console.log('❌ Lưu thất bại:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Lỗi:', err.message);
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
      res.on('data', (chunk) => data += chunk);
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
    req.end();
  });
}

addMoreResults();