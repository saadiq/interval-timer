const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const svgBuffer = await fs.readFile(path.join(__dirname, '../public/timer.svg'));
  
  // Convert SVG to PNG with different sizes
  const sizes = [
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
  ];

  for (const { size, name } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '../public', name));
    
    console.log(`Generated ${name}`);
  }

  // Generate screenshots placeholder
  const screenshotSizes = [
    { width: 1280, height: 720, name: 'screenshot-1.png' },
    { width: 1280, height: 720, name: 'screenshot-2.png' },
  ];

  for (const { width, height, name } of screenshotSizes) {
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 59, g: 130, b: 246, alpha: 1 } // Primary color
      }
    })
    .png()
    .toFile(path.join(__dirname, '../public', name));
    
    console.log(`Generated placeholder ${name}`);
  }
}

generateIcons().catch(console.error);