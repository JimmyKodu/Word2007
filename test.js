// Simple test to verify core modules load correctly
const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('Running basic tests...\n');

// Test 1: Check if package.json exists and is valid
console.log('Test 1: Package.json validation');
try {
  const packageJson = require('./package.json');
  assert(packageJson.name === 'word2007', 'Package name should be word2007');
  assert(packageJson.main === 'main.js', 'Main entry should be main.js');
  assert(packageJson.dependencies.mammoth, 'Should have mammoth dependency');
  assert(packageJson.devDependencies.electron, 'Should have electron dependency');
  console.log('✓ Package.json is valid\n');
} catch (error) {
  console.error('✗ Package.json test failed:', error.message);
  process.exit(1);
}

// Test 2: Check if required files exist
console.log('Test 2: Required files check');
const requiredFiles = [
  'main.js',
  'renderer.js',
  'index.html',
  'styles.css',
  'README.md'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.error(`✗ Missing required file: ${file}`);
    process.exit(1);
  }
}
console.log('✓ All required files exist\n');

// Test 3: Check if dependencies can be loaded
console.log('Test 3: Dependencies load test');
try {
  require('electron');
  console.log('✓ Electron loaded successfully');
} catch (error) {
  console.error('✗ Failed to load electron:', error.message);
  process.exit(1);
}

try {
  require('mammoth');
  console.log('✓ Mammoth.js loaded successfully');
} catch (error) {
  console.error('✗ Failed to load mammoth:', error.message);
  process.exit(1);
}
console.log('');

// Test 4: Check if test document exists
console.log('Test 4: Test document check');
const testDocPath = path.join(__dirname, 'test-document.txt');
if (!fs.existsSync(testDocPath)) {
  console.error('✗ Test document not found');
  process.exit(1);
}
const testDocContent = fs.readFileSync(testDocPath, 'utf8');
if (testDocContent.length === 0) {
  console.error('✗ Test document is empty');
  process.exit(1);
}
console.log('✓ Test document exists and has content\n');

// Test 5: Validate HTML structure
console.log('Test 5: HTML structure validation');
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const requiredElements = [
  'btn-new',
  'btn-open',
  'btn-save',
  'btn-bold',
  'btn-italic',
  'btn-underline',
  'editor',
  'file-path',
  'word-count'
];

for (const elementId of requiredElements) {
  if (!htmlContent.includes(`id="${elementId}"`)) {
    console.error(`✗ Missing required element: ${elementId}`);
    process.exit(1);
  }
}
console.log('✓ HTML structure is valid\n');

// Test 6: Validate CSS file
console.log('Test 6: CSS validation');
const cssContent = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
const requiredStyles = [
  '.toolbar',
  '.editor-container',
  '#editor',
  '.status-bar'
];

for (const selector of requiredStyles) {
  if (!cssContent.includes(selector)) {
    console.error(`✗ Missing required CSS selector: ${selector}`);
    process.exit(1);
  }
}
console.log('✓ CSS file is valid\n');

console.log('=================================');
console.log('All tests passed! ✓');
console.log('=================================');
console.log('\nRun "npm start" to launch the application.');
