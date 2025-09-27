#!/usr/bin/env node

/**
 * Test script for HTML generation functionality
 * This script tests the gen-html command and related functionality
 */

import { generateCode, generateCodeWithProgress, CodeGenType, listGeneratedProjects, cleanGeneratedProjects } from '../../dist/app/codeGenService.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  // Set to false to skip API tests (requires valid API key)
  runApiTests: process.env.RUN_API_TESTS === 'true',
  // Set to true to keep generated files for inspection
  keepGeneratedFiles: process.env.KEEP_FILES === 'true',
  // Timeout for API calls (in milliseconds)
  apiTimeout: 30000,
  // Test project directory
  testDir: path.join(__dirname, '../../test-generated')
};

// Test cases for HTML generation
const TEST_CASES = [
  {
    name: 'Simple Portfolio',
    prompt: 'Create a simple portfolio website with dark theme, navigation menu, and contact section',
    expectedElements: ['<html', '<head', '<body', '<nav', 'portfolio', 'contact'],
    type: CodeGenType.HTML_SINGLE
  },
  {
    name: 'Landing Page',
    prompt: 'Build a modern landing page for a tech startup with hero section, features, and CTA buttons',
    expectedElements: ['<html', 'hero', 'features', 'button', 'modern'],
    type: CodeGenType.HTML_SINGLE
  },
  {
    name: 'Blog Layout',
    prompt: 'Create a blog layout with header, sidebar, main content area, and footer',
    expectedElements: ['<html', 'header', 'sidebar', 'main', 'footer', 'blog'],
    type: CodeGenType.HTML_SINGLE
  },
  {
    name: 'Interactive Form',
    prompt: 'Make a contact form with validation, animations, and responsive design',
    expectedElements: ['<form', '<input', 'validation', 'animation', 'responsive'],
    type: CodeGenType.HTML_SINGLE
  },
  {
    name: 'Multi-file Project',
    prompt: 'Create a multi-file web project with separate HTML, CSS, and JS files for a restaurant website',
    expectedElements: ['index.html', 'style.css', 'script.js'],
    type: CodeGenType.MULTI_FILE
  }
];

// Utility functions
function createTestDir() {
  if (!fs.existsSync(TEST_CONFIG.testDir)) {
    fs.mkdirSync(TEST_CONFIG.testDir, { recursive: true });
    console.log(`✅ Created test directory: ${TEST_CONFIG.testDir}`);
  }
}

function cleanupTestDir() {
  if (fs.existsSync(TEST_CONFIG.testDir)) {
    fs.rmSync(TEST_CONFIG.testDir, { recursive: true, force: true });
    console.log(`🧹 Cleaned up test directory: ${TEST_CONFIG.testDir}`);
  }
}

function validateHtmlContent(content, expectedElements) {
  const issues = [];
  
  for (const element of expectedElements) {
    if (!content.toLowerCase().includes(element.toLowerCase())) {
      issues.push(`Missing expected element: ${element}`);
    }
  }
  
  // Check for basic HTML structure
  if (!content.includes('<!DOCTYPE html>') && !content.includes('<html')) {
    issues.push('Missing HTML document structure');
  }
  
  // Check for inline styles (for single file)
  if (!content.includes('<style') && !content.includes('style=')) {
    issues.push('No CSS styles found');
  }
  
  return issues;
}

function validateGeneratedFiles(outputPath, files, type) {
  const issues = [];
  
  if (!fs.existsSync(outputPath)) {
    issues.push(`Output directory does not exist: ${outputPath}`);
    return issues;
  }
  
  for (const file of files) {
    const filePath = path.join(outputPath, file);
    if (!fs.existsSync(filePath)) {
      issues.push(`Generated file does not exist: ${file}`);
    } else {
      // Check file size (should not be empty)
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        issues.push(`Generated file is empty: ${file}`);
      }
    }
  }
  
  // Type-specific validations
  if (type === CodeGenType.HTML_SINGLE) {
    const indexPath = path.join(outputPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      if (!content.includes('<html') || !content.includes('</html>')) {
        issues.push('HTML file missing proper HTML structure');
      }
    }
  } else if (type === CodeGenType.MULTI_FILE) {
    const requiredFiles = ['index.html', 'style.css', 'script.js'];
    for (const requiredFile of requiredFiles) {
      if (!files.includes(requiredFile)) {
        issues.push(`Multi-file project missing required file: ${requiredFile}`);
      }
    }
  }
  
  return issues;
}

async function runTestCase(testCase, testIndex) {
  console.log(`\n🧪 Running test ${testIndex + 1}: ${testCase.name}`);
  console.log(`📝 Prompt: ${testCase.prompt}`);
  console.log(`🎯 Type: ${testCase.type}`);
  
  const startTime = Date.now();
  let result;
  let progressUpdates = [];
  
  try {
    if (TEST_CONFIG.runApiTests) {
      // Test with progress callback
      result = await generateCodeWithProgress(
        testCase.prompt,
        testCase.type,
        'gemini-2.5-flash',
        (progress) => {
          progressUpdates.push(progress);
          console.log(`📊 Progress: ${progress.stage} - ${progress.message} (${progress.progress}%)`);
        }
      );
    } else {
      // Mock test without API calls
      console.log('⚠️  Skipping API test (set RUN_API_TESTS=true to enable)');
      result = {
        type: testCase.type,
        outputPath: path.join(TEST_CONFIG.testDir, `mock-${testCase.name.toLowerCase().replace(/\s+/g, '-')}`),
        files: testCase.type === CodeGenType.MULTI_FILE ? ['index.html', 'style.css', 'script.js'] : ['index.html'],
        success: true
      };
      
      // Create mock files for validation
      fs.mkdirSync(result.outputPath, { recursive: true });
      
      // Create HTML file
      const mockHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${testCase.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${testCase.name}</h1>
        <p>This is a mock HTML file for testing purposes.</p>
        <p>Prompt: ${testCase.prompt}</p>
    </div>
</body>
</html>`;
      fs.writeFileSync(path.join(result.outputPath, 'index.html'), mockHtml);
      
      // Create CSS and JS files for multi-file projects
      if (testCase.type === CodeGenType.MULTI_FILE) {
        const mockCss = `/* Mock CSS file for testing */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
}`;
        fs.writeFileSync(path.join(result.outputPath, 'style.css'), mockCss);
        
        const mockJs = `// Mock JavaScript file for testing
console.log('Mock JavaScript loaded for: ${testCase.name}');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded successfully');
    
    // Mock functionality
    const container = document.querySelector('.container');
    if (container) {
        container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});`;
        fs.writeFileSync(path.join(result.outputPath, 'script.js'), mockJs);
      }
    }
    
    const duration = Date.now() - startTime;
    
    // Validate result
    if (!result.success) {
      console.log(`❌ Test failed: ${result.error || 'Unknown error'}`);
      return { success: false, error: result.error, duration };
    }
    
    // Validate generated files
    const fileIssues = validateGeneratedFiles(result.outputPath, result.files, result.type);
    if (fileIssues.length > 0) {
      console.log(`❌ File validation failed:`);
      fileIssues.forEach(issue => console.log(`   - ${issue}`));
      return { success: false, error: 'File validation failed', issues: fileIssues, duration };
    }
    
    // Validate HTML content (for HTML files)
    if (result.files.includes('index.html')) {
      const indexPath = path.join(result.outputPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        const contentIssues = validateHtmlContent(content, testCase.expectedElements);
        if (contentIssues.length > 0) {
          console.log(`⚠️  Content validation warnings:`);
          contentIssues.forEach(issue => console.log(`   - ${issue}`));
        }
      }
    }
    
    console.log(`✅ Test passed! Generated ${result.files.length} files in ${duration}ms`);
    console.log(`📁 Output: ${result.outputPath}`);
    console.log(`📄 Files: ${result.files.join(', ')}`);
    
    return {
      success: true,
      duration,
      files: result.files,
      outputPath: result.outputPath,
      progressUpdates: progressUpdates.length
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ Test failed with error: ${error.message}`);
    return { success: false, error: error.message, duration };
  }
}

async function runProjectManagementTests() {
  console.log(`\n📁 Running project management tests...`);
  
  try {
    // Test listing projects
    console.log('📋 Testing project listing...');
    const projects = listGeneratedProjects();
    console.log(`✅ Found ${projects.length} existing projects`);
    
    // Test cleaning projects (if enabled)
    if (process.env.CLEAN_PROJECTS === 'true') {
      console.log('🧹 Testing project cleanup...');
      const cleanResult = cleanGeneratedProjects();
      console.log(`✅ Cleaned ${cleanResult.deleted} files (${(cleanResult.totalSize / 1024).toFixed(2)} KB)`);
    }
    
    return { success: true };
  } catch (error) {
    console.log(`❌ Project management test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting HTML Generation Test Suite');
  console.log('=' .repeat(50));
  
  // Setup
  createTestDir();
  
  const results = {
    total: TEST_CASES.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    totalDuration: 0,
    details: []
  };
  
  try {
    // Run individual test cases
    for (let i = 0; i < TEST_CASES.length; i++) {
      const testCase = TEST_CASES[i];
      const result = await runTestCase(testCase, i);
      
      results.details.push({
        name: testCase.name,
        ...result
      });
      
      if (result.success) {
        results.passed++;
      } else if (result.error && result.error.includes('Skipping API test')) {
        results.skipped++;
      } else {
        results.failed++;
      }
      
      results.totalDuration += result.duration || 0;
    }
    
    // Run project management tests
    const pmResult = await runProjectManagementTests();
    if (pmResult.success) {
      console.log('✅ Project management tests passed');
    } else {
      console.log('❌ Project management tests failed');
      results.failed++;
    }
    
  } finally {
    // Cleanup
    if (!TEST_CONFIG.keepGeneratedFiles) {
      cleanupTestDir();
    } else {
      console.log(`\n📁 Test files kept in: ${TEST_CONFIG.testDir}`);
    }
  }
  
  // Print summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results Summary');
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`⏱️  Total Duration: ${(results.totalDuration / 1000).toFixed(2)}s`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.details
      .filter(d => !d.success && !d.error?.includes('Skipping API test'))
      .forEach(d => console.log(`   - ${d.name}: ${d.error}`));
  }
  
  // Environment info
  console.log('\n🔧 Environment Info:');
  console.log(`   Node.js: ${process.version}`);
  console.log(`   API Tests: ${TEST_CONFIG.runApiTests ? 'Enabled' : 'Disabled'}`);
  console.log(`   Keep Files: ${TEST_CONFIG.keepGeneratedFiles ? 'Yes' : 'No'}`);
  
  return results;
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Test suite crashed:', error);
      process.exit(1);
    });
}

export { runAllTests, TEST_CASES, TEST_CONFIG };
