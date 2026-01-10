const http = require('http');

async function testLoginAPI() {
  console.log('=== Test API Đăng Nhập ===\n');
  
  // Test với account mới tạo
  const loginData = {
    username: 'testuser123', // Thay bằng username bạn vừa tạo
    password: 'password123'  // Thay bằng password bạn vừa tạo
  };
  
  console.log('🔐 Testing login with:', {
    username: loginData.username,
    password: '***hidden***'
  });
  
  const success = await testLogin(loginData);
  
  if (success) {
    console.log('✅ Login API hoạt động bình thường');
    console.log('\n🔍 Vấn đề có thể là:');
    console.log('1. Frontend không xử lý response đúng cách');
    console.log('2. CORS issues');
    console.log('3. Authentication headers không đúng');
  } else {
    console.log('❌ Login API có vấn đề');
    console.log('\n🔧 Hãy kiểm tra:');
    console.log('1. Username/password có đúng không');
    console.log('2. Backend server có đang chạy không');
    console.log('3. Database connection');
  }
  
  // Test với credentials sai để xem response
  console.log('\n🧪 Testing với credentials sai...');
  const failTest = await testLogin({
    username: 'wronguser',
    password: 'wrongpass'
  });
  
  if (!failTest) {
    console.log('✅ API đúng cách reject credentials sai');
  }
}

function testLogin(credentials) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(credentials);
    
    const options = {
      hostname: 'localhost',
      port: 5150,
      path: '/api/auth/login',
      method: 'POST',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/json',
        'Origin': 'http://localhost:4200'
      }
    };

    console.log(`📡 POST ${options.hostname}:${options.port}${options.path}`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log('📋 Response Headers:', res.headers);
        console.log('📄 Response Body:', data);
        
        if (res.statusCode === 200) {
          try {
            const user = JSON.parse(data);
            console.log('✅ Login successful! User info:');
            console.log('   ID:', user.id);
            console.log('   Username:', user.username);
            console.log('   Full Name:', user.fullName);
            console.log('   Email:', user.email);
            console.log('   Role:', user.role);
            resolve(true);
          } catch (e) {
            console.log('❌ Invalid JSON response');
            resolve(false);
          }
        } else {
          console.log(`❌ Login failed with status ${res.statusCode}`);
          try {
            const errorData = JSON.parse(data);
            console.log('Error details:', errorData);
          } catch (e) {
            console.log('Error response:', data);
          }
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Request Error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ Request Timeout');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Chạy test
testLoginAPI();