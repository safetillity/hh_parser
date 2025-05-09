const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 180];
const svgPath = path.join(__dirname, '../public/favicon.svg');

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(__dirname, `../public/favicon-${size}x${size}.png`);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${size}x${size} icon`);
  }
}

generateIcons().catch(console.error); 