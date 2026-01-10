const http = require('http');

function testProxy() {
  const options = {
    hostname: 'localhost',
    port: 4200, // Angular dev server
    path: '/api/experiments/public', // Thông qua proxy
    method: 'GET',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  console.log('Testing proxy through Angular dev server...');
  console.log(`URL: http://localhost:4200/api/experiments/public`);

  const req = http.request(options, (res) => {
    console.log(`✅ Proxy Status: ${res.statusCode} ${res.statusMessage}`);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (data) {
        console.log(`Response: ${data.substring(0, 300)}${data.length > 300 ? '...' : ''}`);
      }
      
      if (res.statusCode === 400 || res.statusCode === 405) {
        console.log('\n✅ Proxy is working! Backend responded through Angular proxy.');
        console.log('The 400/405 errors are expected for this test.');
      } else if (res.statusCode === 404) {
        console.log('\n❌ Proxy may not be working. Getting 404 from Angular dev server.');
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Proxy Error: ${err.message}`);
    console.log('\nPossible issues:');
    console.log('1. Angular dev server not started with proxy');
    console.log('2. Run: npm run start (which uses proxy.conf.json)');
    console.log('3. Not: ng serve (without proxy)');
  });

  req.on('timeout', () => {
    console.log('❌ Proxy timeout');
    req.destroy();
  });

  req.end();
}

testProxy();