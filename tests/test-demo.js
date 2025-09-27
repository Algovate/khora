#!/usr/bin/env node

/**
 * Demo script showing how to use the HTML generation test suite
 * This script demonstrates the testing capabilities without requiring API keys
 */

import { listGeneratedProjects } from '../dist/app/codeGenService.js';
import fs from 'node:fs';
import path from 'node:path';

console.log('🎯 Khora HTML Generation Test Suite Demo');
console.log('=' .repeat(50));

console.log('\n📋 Available Test Commands:');
console.log('  npm test              - Run mock tests (no API required)');
console.log('  npm run test:api      - Run with real API calls');
console.log('  npm run test:keep     - Keep generated files for inspection');
console.log('  npm run test:clean    - Clean projects before testing');

console.log('\n🚀 Quick Test Commands:');
console.log('  node quick-test.js simple    - Test simple HTML generation');
console.log('  node quick-test.js portfolio - Test portfolio website');
console.log('  node quick-test.js multi     - Test multi-file project');

console.log('\n📁 Current Generated Projects:');
try {
  const projects = listGeneratedProjects();
  if (projects.length === 0) {
    console.log('  No projects found. Run tests to generate some!');
  } else {
    projects.slice(0, 5).forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.name} (${project.type})`);
      console.log(`     Created: ${project.createdAt.toLocaleDateString()}`);
      console.log(`     Files: ${project.files.length} files`);
      console.log(`     Path: ${project.outputPath}`);
    });
    if (projects.length > 5) {
      console.log(`  ... and ${projects.length - 5} more projects`);
    }
  }
} catch (error) {
  console.log('  Error reading projects:', error.message);
}

console.log('\n🔧 Environment Status:');
console.log(`  Node.js: ${process.version}`);
console.log(`  API Key: ${process.env.GOOGLE_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`  Build Status: ${fs.existsSync('./dist') ? '✅ Built' : '❌ Not built'}`);

console.log('\n📖 Documentation:');
console.log('  See TESTING.md for detailed testing guide');
console.log('  See test.config.js for configuration options');

console.log('\n🎮 Try it out:');
console.log('  1. Run: npm test');
console.log('  2. Check the results above');
console.log('  3. Run: npm run test:keep (to inspect generated files)');
console.log('  4. Set GOOGLE_API_KEY and run: npm run test:api');

console.log('\n' + '=' .repeat(50));
console.log('Happy testing! 🚀');
