const fs = require('fs');
const path = require('path');

// Load .env file
require('dotenv').config();

// Create environment.ts content
const envConfigFile = `export const environment = {
  production: false,
  apiUrl: '${process.env.API_URL || 'http://localhost:5150'}',
  apiKey: '${process.env.API_KEY || ''}',
  swaggerUrl: '${process.env.API_URL || 'http://localhost:5150'}/swagger/index.html'
};
`;

// Write to environment.ts
const envPath = path.join(__dirname, 'src/environments/environment.ts');
fs.writeFileSync(envPath, envConfigFile);

console.log('Environment file generated successfully!');
console.log('API_URL:', process.env.API_URL || 'http://localhost:5150');
console.log('API_KEY:', process.env.API_KEY ? '***HIDDEN***' : 'NOT SET');