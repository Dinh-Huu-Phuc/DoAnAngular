const http = require('http');

async function testLoginSimple() {
  console.log('=== Test Đăng Nhập Đơn Giản ===\n');
  
  // Test với một số credentials phổ biến
  const testCredentials = [
    { username: 'admin', password: 'admin' },
    { username: 'test', password: 'test' },
    { username: 'user', password: 'password' },
    { username: 'testuser', password: '123456' }
  ];
  
  console.log('🔍 Kiểm tra API đăng nhập với một số credentials...\n');
  
  for (const cred of testCredentials) {
    console.log(`🧪 Testing: ${cred.username} / ${cred.password}`);
    const result = await testLogin(cred);
    
    if (result.success) {
      console.log('✅ Đăng nhập thành công!');
      console.log('📋 User info:', result.user);
      break;
    } else {
      console.log(`❌ Thất bại: ${result.error}`);
    }
    console.log('');
  }
  
  console.log('\n📝 Hướng dẫn:');
  console.log('1. Nếu không có credentials nào hoạt động, hãy tạo account mới');
  console.log('2. Hoặc cho tôi biết username/password bạn vừa tạo');
  console.log('3. Sau khi sửa API interceptor, thử đăng nhập lại trên web');
}

function testLogin(credentials) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(credentials);
    
    const options = {
      hostname: 'localhost',
      port: 5150,
      path: '/api/auth/login',
      method: 'POST',
      timeout: 5000,
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
        if (res.statusCode === 200) {
          try {
            const user = JSON.parse(data);
            resolve({
              success: true,
              user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email
              }
            });
          } catch (e) {
            resolve({ success: false, error: 'Invalid JSON response' });
          }
        } else {
          let errorMsg = `Status ${res.statusCode}`;
          try {
            const errorData = JSON.parse(data);
            errorMsg = errorData.message || errorData.error || errorMsg;
          } catch (e) {
            errorMsg = data || errorMsg;
          }
          resolve({ success: false, error: errorMsg });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: `Network error: ${err.message}` });
    });

    req.on('timeout', () => {
      resolve({ success: false, error: 'Request timeout' });
    });

    req.write(postData);
    req.end();
  });
}

testLoginSimple();