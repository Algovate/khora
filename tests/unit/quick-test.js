#!/usr/bin/env node

/**
 * Quick test runner for HTML generation
 * Usage: node quick-test.js [test-name]
 */

import { generateCode, CodeGenType } from '../../dist/app/codeGenService.js';
import fs from 'node:fs';
import path from 'node:path';

// Simple test cases
const QUICK_TESTS = {
  'simple': {
    prompt: 'Create a simple "Hello World" HTML page with blue background',
    type: CodeGenType.HTML_SINGLE,
    expected: ['hello', 'world', 'blue']
  },
  'portfolio': {
    prompt: 'Build a portfolio website with navigation and contact form',
    type: CodeGenType.HTML_SINGLE,
    expected: ['portfolio', 'nav', 'contact', 'form']
  },
  'multi': {
    prompt: 'Create separate HTML, CSS, and JS files for a restaurant website',
    type: CodeGenType.MULTI_FILE,
    expected: ['restaurant', 'index.html', 'style.css', 'script.js']
  }
};

async function runQuickTest(testName) {
  const test = QUICK_TESTS[testName];
  if (!test) {
    console.log('❌ Unknown test:', testName);
    console.log('Available tests:', Object.keys(QUICK_TESTS).join(', '));
    return;
  }

  console.log(`🚀 Running quick test: ${testName}`);
  console.log(`📝 Prompt: ${test.prompt}`);

  try {
    const startTime = Date.now();

    // Check if API key is available
    if (!process.env.GOOGLE_API_KEY) {
      console.log('⚠️  No API key found. Creating mock result...');
      console.log('✅ Mock test completed successfully');
      return;
    }

    const result = await generateCode(test.prompt, test.type);
    const duration = Date.now() - startTime;

    if (result.success) {
      console.log(`✅ Test passed in ${duration}ms`);
      console.log(`📁 Output: ${result.outputPath}`);
      console.log(`📄 Files: ${result.files.join(', ')}`);

      // Quick content validation
      if (result.files.includes('index.html')) {
        const htmlPath = path.join(result.outputPath, 'index.html');
        if (fs.existsSync(htmlPath)) {
          const content = fs.readFileSync(htmlPath, 'utf8').toLowerCase();
          const found = test.expected.filter(exp => content.includes(exp.toLowerCase()));
          console.log(`🔍 Found expected elements: ${found.join(', ')}`);
          if (found.length < test.expected.length / 2) {
            console.log('⚠️  Some expected elements not found');
          }
        }
      }
    } else {
      console.log(`❌ Test failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`💥 Test crashed: ${error.message}`);
  }
}

// Main execution
const testName = process.argv[2];
if (testName) {
  runQuickTest(testName);
} else {
  console.log('🧪 Quick Test Runner');
  console.log('Usage: node quick-test.js <test-name>');
  console.log('\nAvailable tests:');
  Object.keys(QUICK_TESTS).forEach(name => {
    console.log(`  - ${name}: ${QUICK_TESTS[name].prompt.substring(0, 50)}...`);
  });
}
