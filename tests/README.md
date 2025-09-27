---
noteId: "58f68d309b7411f0875a5b0970943b23"
tags: []

---

# Khora Test Suite

This directory contains the comprehensive test suite for Khora's HTML generation functionality.

## Directory Structure

```
tests/
├── README.md                    # This file
├── test.config.js              # Test configuration
├── test-demo.js                # Demo script showing test capabilities
├── integration/                # Integration tests
│   └── test-gen-html.js        # Main HTML generation test suite
├── unit/                       # Unit tests
│   └── quick-test.js           # Quick test runner for specific scenarios
└── fixtures/                   # Test fixtures and sample data
```

## Test Types

### Integration Tests (`integration/`)
- **test-gen-html.js**: Comprehensive test suite for HTML generation
  - Tests all code generation types (HTML single, multi-file, Vue)
  - Validates file structure and content
  - Tests project management functionality
  - Supports both mock and real API testing

### Unit Tests (`unit/`)
- **quick-test.js**: Fast, focused tests for specific scenarios
  - Simple HTML generation
  - Portfolio website generation
  - Multi-file project generation

### Demo Scripts
- **test-demo.js**: Shows current test status and available commands
- **test.config.js**: Centralized configuration for all tests

## Running Tests

### NPM Scripts (Recommended)
```bash
# Run main test suite (mock mode)
npm test

# Run with real API calls
npm run test:api

# Keep generated files for inspection
npm run test:keep

# Clean projects before testing
npm run test:clean

# Run quick tests
npm run test:quick

# Show demo and status
npm run test:demo
```

### Direct Execution
```bash
# From project root
node tests/integration/test-gen-html.js
node tests/unit/quick-test.js
node tests/test-demo.js

# Quick tests with specific scenarios
node tests/unit/quick-test.js simple
node tests/unit/quick-test.js portfolio
node tests/unit/quick-test.js multi
```

## Environment Variables

- `RUN_API_TESTS=true` - Enable real API testing (requires GOOGLE_API_KEY)
- `KEEP_FILES=true` - Keep generated files after tests complete
- `CLEAN_PROJECTS=true` - Clean existing projects before running tests
- `GOOGLE_API_KEY` - API key for real testing (set in environment)

## Test Configuration

All test settings are centralized in `test.config.js`:
- API configuration
- Validation rules
- Test data and sample prompts
- Performance settings

## Adding New Tests

1. **Unit Tests**: Add to `unit/` directory for focused, fast tests
2. **Integration Tests**: Add to `integration/` directory for comprehensive testing
3. **Test Cases**: Update `TEST_CASES` array in `test-gen-html.js`
4. **Configuration**: Update `test.config.js` for new settings

## Test Results

Tests validate:
- ✅ File generation and structure
- ✅ HTML content and syntax
- ✅ Expected elements and functionality
- ✅ Project management operations
- ✅ Performance and timeouts
- ❌ Security vulnerabilities
- ❌ External dependencies

## Troubleshooting

See the main `TESTING.md` file in the project root for detailed troubleshooting guide.
