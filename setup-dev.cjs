#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Mobius LMS for development...\n');

// Create client .env.development if it doesn't exist
const clientEnvPath = path.join(__dirname, 'client', '.env.development');
const clientTemplatePath = path.join(__dirname, 'client', 'env.development.template');

if (!fs.existsSync(clientEnvPath) && fs.existsSync(clientTemplatePath)) {
  fs.copyFileSync(clientTemplatePath, clientEnvPath);
  console.log('✅ Created client/.env.development');
} else if (fs.existsSync(clientEnvPath)) {
  console.log('ℹ️  client/.env.development already exists');
} else {
  console.log('⚠️  client/env.development.template not found');
}

// Create server .env from the example if it doesn't exist (the old
// env.development.template was removed — it documented the dead SMTP/DB_* era)
const serverEnvPath = path.join(__dirname, 'server', '.env');
const serverTemplatePath = path.join(__dirname, 'server', '.env.example');

if (!fs.existsSync(serverEnvPath) && fs.existsSync(serverTemplatePath)) {
  fs.copyFileSync(serverTemplatePath, serverEnvPath);
  console.log('✅ Created server/.env from .env.example — fill in real values');
} else if (fs.existsSync(serverEnvPath)) {
  console.log('ℹ️  server/.env already exists');
} else {
  console.log('⚠️  server/.env.example not found');
}

console.log('\n🎯 Development setup complete!');
console.log('\nNext steps:');
console.log('1. Fill in REGISTRY_URL + JWT_SECRET in server/.env');
console.log('2. Run: npm run dev');
console.log('3. Open http://localhost:5173 in your browser');
console.log('\nAvailable commands:');
console.log('- npm run dev          : Start both client and server in development mode');
console.log('- npm run dev:client   : Start only the client (Vite dev server)');
console.log('- npm run dev:server   : Start only the server (Node.js with nodemon)');
console.log('- npm run dev:windows  : Start development mode on Windows');
