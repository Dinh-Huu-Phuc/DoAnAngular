const http = require('http');

async function testRefreshFunctionality() {
  console.log('=== Test Chức Năng Làm Mới Lịch Sử ===\n');
  
  const userId = 2;
  
  // Bước 1: Kiểm tra tổng số kết quả hiện tại
  console.log('📊 Bước 1: Kiểm tra tổng số kết quả hiện tại');
  const currentResults = await getAllResults(userId);
  console.log(`✅ Tổng số kết quả hiện tại: ${currentResults.total}`);
  console.log('📋 Chi tiết:');
  Object.entries(currentResults.byExperiment).forEach(([exp, count]) => {
    console.log(`   - ${exp}: ${count} kết quả`);
  });
  
  // Bước 2: Thêm một kết quả mới để test việc đồng bộ
  console.log('\n🧪 Bước 2: Thêm kết quả mới để test đồng bộ');
  const newResult = {
    experimentId: 'catalysis',
    userId: userId,
    parameters: {
      temperature: 25,
      concentration: 1.0,
      volume: 0.5,
      time: 45
    },
    results: {
      gasVolume: 5.6,
      efficiency: 95.0,
      ph: 7.0
    },
    duration: 45,
    efficiency: 95.0,
    timestamp: new Date().toISOString()
  };
  
  const saveSuccess = await saveResult(newResult);
  if (saveSuccess) {
    console.log('✅ Đã thêm kết quả mới thành công');
  } else {
    console.log('❌ Không thể thêm kết quả mới');
    return;
  }
  
  // Bước 3: Kiểm tra lại tổng số kết quả sau khi thêm
  console.log('\n📊 Bước 3: Kiểm tra lại sau khi thêm kết quả mới');
  const updatedResults = await getAllResults(userId);
  console.log(`✅ Tổng số kết quả sau khi thêm: ${updatedResults.total}`);
  
  if (updatedResults.total > currentResults.total) {
    console.log(`🎉 Kết quả đã tăng từ ${currentResults.total} lên ${updatedResults.total}`);
  }
  
  // Bước 4: Hướng dẫn test trên giao diện web
  console.log('\n🌐 Bước 4: Hướng dẫn test trên giao diện web');
  console.log('1. Mở http://localhost:4200');
  console.log('2. Đảm bảo user đã đăng nhập (ID: 2)');
  console.log('3. Vào trang "Lịch sử thí nghiệm"');
  console.log(`4. Bấm nút "🔄 Làm mới" - sẽ thấy ${updatedResults.total} kết quả`);
  console.log('5. Chạy thêm thí nghiệm mới');
  console.log('6. Bấm "Làm mới" lại để thấy kết quả mới');
  
  console.log('\n✅ EXPECTED BEHAVIOR:');
  console.log('- Nút "Làm mới" sẽ hiển thị "Đang đồng bộ..." khi đang tải');
  console.log('- Thông báo "Đã đồng bộ X kết quả từ database" sẽ xuất hiện');
  console.log('- Danh sách kết quả sẽ cập nhật với dữ liệu mới nhất');
  console.log('- Thống kê (tổng kết quả, hiệu suất TB) sẽ được cập nhật');
  
  return updatedResults;
}

async function getAllResults(userId) {
  const experimentIds = [
    'acid-base', 'decomposition', 'electrolysis', 'equilibrium', 
    'combustion', 'precipitation', 'catalysis', 'redox',
    'test-experiment-123'
  ];
  
  let total = 0;
  const byExperiment = {};
  
  for (const experimentId of experimentIds) {
    const results = await loadResults(experimentId, userId);
    if (results.length > 0) {
      byExperiment[experimentId] = results.length;
      total += results.length;
    }
  }
  
  return { total, byExperiment };
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

testRefreshFunctionality();