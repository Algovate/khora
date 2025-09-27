/**
 * Test configuration for HTML generation tests
 */

export const TEST_CONFIG = {
  // Test environment settings
  environment: {
    // Set to false to skip API tests (requires valid API key)
    runApiTests: process.env.RUN_API_TESTS === 'true',
    // Set to true to keep generated files for inspection
    keepGeneratedFiles: process.env.KEEP_FILES === 'true',
    // Timeout for API calls (in milliseconds)
    apiTimeout: 30000,
    // Test project directory
    testDir: './test-generated'
  },
  
  // API configuration
  api: {
    // Default model to use for testing
    defaultModel: 'gemini-2.5-flash',
    // Alternative models for testing
    alternativeModels: ['gemini-1.5-flash', 'gemini-1.5-pro'],
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000
  },
  
  // Test data
  testData: {
    // Sample prompts for different scenarios
    samplePrompts: {
      simple: 'Create a simple portfolio website',
      complex: 'Build a modern e-commerce landing page with shopping cart functionality',
      responsive: 'Make a responsive blog layout that works on mobile and desktop',
      interactive: 'Create an interactive dashboard with charts and data visualization'
    },
    
    // Expected elements for validation
    commonElements: [
      '<html',
      '<head',
      '<body',
      '<title',
      '<meta',
      'viewport'
    ]
  },
  
  // Validation rules
  validation: {
    // Minimum file sizes (in bytes)
    minFileSizes: {
      html: 500,
      css: 100,
      js: 50
    },
    
    // Required HTML elements
    requiredHtmlElements: [
      '<!DOCTYPE html>',
      '<html',
      '<head>',
      '<body>',
      '</html>'
    ],
    
    // Forbidden elements (security)
    forbiddenElements: [
      '<script src="http://',
      'eval(',
      'document.write(',
      'innerHTML ='
    ]
  }
};

export default TEST_CONFIG;
