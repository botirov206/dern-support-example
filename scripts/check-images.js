const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

const publicDir = path.join(__dirname, '../public');
const assetsDir = path.join(publicDir, 'assets');

// Expected image dimensions
const expectedDimensions = {
  'hero.jpg': { width: 1200, height: 600 },
  'placeholder.jpg': { width: 300, height: 200 }
};

// Check if assets directory exists
if (!fs.existsSync(assetsDir)) {
  console.error('Error: /public/assets directory not found');
  process.exit(1);
}

// Get all image files
const imageFiles = fs.readdirSync(assetsDir)
  .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

console.log('Checking image files...\n');

let hasErrors = false;

// Check each image
imageFiles.forEach(file => {
  const imagePath = path.join(assetsDir, file);
  
  try {
    const dimensions = sizeOf(imagePath);
    const expected = expectedDimensions[file];

    console.log(`Checking ${file}:`);
    console.log(`- Path: ${imagePath}`);
    console.log(`- Dimensions: ${dimensions.width}x${dimensions.height}`);

    if (expected) {
      if (dimensions.width !== expected.width || dimensions.height !== expected.height) {
        console.error(`- Error: Expected dimensions ${expected.width}x${expected.height}`);
        hasErrors = true;
      } else {
        console.log('- Dimensions match expected values');
      }
    } else {
      console.log('- No specific dimensions required');
    }
    console.log('');
  } catch (error) {
    console.error(`Error reading ${file}: ${error.message}\n`);
    hasErrors = true;
  }
});

// Check for missing required images
Object.keys(expectedDimensions).forEach(requiredImage => {
  if (!imageFiles.includes(requiredImage)) {
    console.error(`Error: Required image ${requiredImage} not found in /public/assets`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error('\nImage verification failed. Please fix the issues above.');
  process.exit(1);
} else {
  console.log('All images verified successfully!');
} 