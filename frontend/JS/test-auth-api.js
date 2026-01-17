// Test Authentication API
const https = require('https');
const http = require('http');

// Disable SSL verification for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL_HTTP = 'http://localhost:5150';
const BASE_URL_HTTPS = 'https://localhost:7081';

// Test data
const testUser = {
  fullName: 'Test User',
  username: 'testuser' + Date.now(),
  password: 'Test123!',
  confirmPassword: 'Test123!',
  email: 'test' + Date.now() + '@example.com',
  phoneNumber: '0123456789'
};

console.log('='.repeat(60));
console.log('TESTING AUTHENTICATION API');
console.log('='.repeat(60));
console.log('\nTest User Data:');
console.log(JSON.stringify(testUser, null, 2));

// Test Register
async function testRegister(useHttps = false) {
  const baseUrl = useHttps ? BASE_URL_HTTPS : BASE_URL_HTTP;
  const protocol = useHttps ? https : http;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST 1: Register (${useHttps ? 'HTTPS' : 'HTTP'})`);
  console.log('='.repeat(60));
  console.log(`URL: ${baseUrl}/api/auth/register`);
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(testUser);
    
    const url = new URL(`${baseUrl}/api/auth/register`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      rejectUnauthorized: false
    };

    const req = protocol.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log(`\nStatus: ${res.statusCode}`);
        console.log('Response Headers:', res.headers);
        console.log('Response Body:', body);
        
        if (res.statusCode === 200) {
          console.log('✅ Register SUCCESS');
          try {
            const user = JSON.parse(body);
            resolve(user);
          } catch (e) {
            resolve(body);
          }
        } else {
          console.log('❌ Register FAILED');
          reject(new Error(`Status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request Error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Test Login
async function testLogin(useHttps = false) {
  const baseUrl = useHttps ? BASE_URL_HTTPS : BASE_URL_HTTP;
  const protocol = useHttps ? https : http;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST 2: Login (${useHttps ? 'HTTPS' : 'HTTP'})`);
  console.log('='.repeat(60));
  console.log(`URL: ${baseUrl}/api/auth/login`);
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      username: testUser.username,
      password: testUser.password
    });
    
    const url = new URL(`${baseUrl}/api/auth/login`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      rejectUnauthorized: false
    };

    const req = protocol.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log(`\nStatus: ${res.statusCode}`);
        console.log('Response Headers:', res.headers);
        console.log('Response Body:', body);
        
        if (res.statusCode === 200) {
          console.log('✅ Login SUCCESS');
          resolve(JSON.parse(body));
        } else {
          console.log('❌ Login FAILED');
          reject(new Error(`Status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request Error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    // Test with HTTP first
    console.log('\n🔵 Testing with HTTP...\n');
    try {
      await testRegister(false);
      await testLogin(false);
    } catch (error) {
      console.log('\n⚠️ HTTP tests failed, trying HTTPS...\n');
      
      // Try HTTPS if HTTP fails
      await testRegister(true);
      await testLogin(true);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(60));
    console.log('\nAPI Endpoints are working correctly!');
    console.log('\nYou can now use these endpoints in your Angular app:');
    console.log('- POST /api/auth/register');
    console.log('- POST /api/auth/login');
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ TESTS FAILED');
    console.log('='.repeat(60));
    console.log('\nError:', error.message);
    console.log('\nMake sure:');
    console.log('1. Backend is running (cd backend/ChemistryAPI/ChemistryAPI && dotnet run)');
    console.log('2. Database is accessible');
    console.log('3. CORS is configured correctly');
  }
}

runTests();
