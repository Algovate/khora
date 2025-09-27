#!/usr/bin/env node

/**
 * Main test runner for all Khora tests
 * This script runs all test suites in the correct order
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Khora Test Suite Runner');
console.log('=' .repeat(50));

// Test suites to run
const testSuites = [
  {
    name: 'Demo & Status',
    command: 'node',
    args: ['test-demo.js'],
    description: 'Show current status and available commands'
  },
  {
    name: 'Quick Tests',
    command: 'node',
    args: ['unit/quick-test.js'],
    description: 'Run quick unit tests'
  },
  {
    name: 'Integration Tests',
    command: 'node',
    args: ['integration/test-gen-html.js'],
    description: 'Run comprehensive integration tests'
  }
];

async function runTest(testSuite) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Running: ${testSuite.name}`);
    console.log(`📝 ${testSuite.description}`);
    
    const child = spawn(testSuite.command, testSuite.args, {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testSuite.name} completed successfully`);
      } else {
        console.log(`❌ ${testSuite.name} failed with exit code ${code}`);
      }
      resolve({ name: testSuite.name, success: code === 0, exitCode: code });
    });
    
    child.on('error', (error) => {
      console.log(`💥 ${testSuite.name} crashed: ${error.message}`);
      resolve({ name: testSuite.name, success: false, error: error.message });
    });
  });
}

async function runAllTests() {
  const results = [];
  
  for (const testSuite of testSuites) {
    const result = await runTest(testSuite);
    results.push(result);
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Suite Summary');
  console.log('=' .repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total Suites: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Suites:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error || `Exit code ${r.exitCode}`}`);
    });
  }
  
  console.log('\n🔧 Available Commands:');
  console.log('   npm test          - Run integration tests');
  console.log('   npm run test:api  - Run with real API calls');
  console.log('   npm run test:quick - Run quick unit tests');
  console.log('   npm run test:demo - Show demo and status');
  
  return failed === 0;
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test runner crashed:', error);
      process.exit(1);
    });
}

export { runAllTests };
