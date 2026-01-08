const http = require('http');

function checkBackend(port) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/swagger/index.html',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      console.log(`✅ Backend đang chạy trên port ${port}`);
      console.log(`📄 Swagger UI: http://localhost:${port}/swagger/index.html`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Không thể kết nối tới backend trên port ${port}`);
      console.log(`Error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏰ Timeout khi kết nối tới port ${port}`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Kiểm tra backend...\n');
  
  const ports = [5150, 7081, 5000, 3000];
  
  for (const port of ports) {
    console.log(`Checking port ${port}...`);
    const isRunning = await checkBackend(port);
    if (isRunning) {
      console.log(`\n💡 Cập nhật environment.ts với port ${port} nếu cần thiết`);
      break;
    }
  }
  
  console.log('\n📋 Hướng dẫn:');
  console.log('1. Đảm bảo backend đang chạy');
  console.log('2. Kiểm tra port trong environment.ts');
  console.log('3. Chạy: npm start (với proxy)');
}

main();