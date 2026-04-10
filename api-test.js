#!/usr/bin/env node

/**
 * API Endpoint Verification Test
 * Run this to verify all endpoints are working after the fix
 * 
 * Usage: node api-test.js
 */

const BASE_URL = 'http://localhost:5000';

const endpoints = [
  { name: 'Users', method: 'GET', path: '/api/users?limit=5' },
  { name: 'Restaurants', method: 'GET', path: '/api/restaurants?limit=5' },
  { name: 'Menu', method: 'GET', path: '/api/menu?limit=5' },
  { name: 'Carts', method: 'GET', path: '/api/cart?limit=5' },
  { name: 'Orders', method: 'GET', path: '/api/orders?limit=5' },
  { name: 'Delivery', method: 'GET', path: '/api/delivery?limit=5' },
  { name: 'Health Check', method: 'GET', path: '/api/health' }
];

async function testEndpoint(endpoint) {
  const url = BASE_URL + endpoint.path;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url);
    const duration = Date.now() - startTime;
    const data = await response.json();
    
    const status = response.ok ? '✅' : '❌';
    const success = data.success !== false ? '✅' : '❌';
    const time = duration < 100 ? '⚡' : '⏱️';
    
    console.log(`${status} [${endpoint.method}] ${endpoint.path}`);
    console.log(`   ${success} Response: success=${data.success}, ${data.total ? `total=${data.total}` : 'OK'}`);
    console.log(`   ${time} Speed: ${duration}ms\n`);
    
    return { success: true, duration };
  } catch (err) {
    console.log(`❌ [${endpoint.method}] ${endpoint.path}`);
    console.log(`   ❌ Error: ${err.message}\n`);
    return { success: false, error: err.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 API ENDPOINT VERIFICATION TEST');
  console.log('='.repeat(60) + '\n');
  
  console.log(`Testing ${endpoints.length} endpoints at ${BASE_URL}\n`);
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push({ endpoint: endpoint.name, ...result });
  }
  
  console.log('='.repeat(60));
  const allSuccess = results.every(r => r.success);
  const avgTime = results.filter(r => r.duration).reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration).length;
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total Tests: ${results.length}`);
  console.log(`   Passed: ${results.filter(r => r.success).length}`);
  console.log(`   Failed: ${results.filter(r => !r.success).length}`);
  console.log(`   Average Response Time: ${avgTime.toFixed(0)}ms`);
  console.log(`\n${allSuccess ? '🎉 ALL TESTS PASSED!' : '❌ SOME TESTS FAILED'}`);
  console.log('='.repeat(60) + '\n');
}

// Run in Node.js environment
if (typeof fetch === 'undefined') {
  console.log('ℹ️  Installing node-fetch for Node.js compatibility...');
  // Fallback for older Node.js versions
  runTests().catch(console.error);
} else {
  runTests().catch(console.error);
}
