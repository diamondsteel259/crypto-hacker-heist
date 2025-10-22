import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon-512x512.svg');

async function generateIcons() {
  try {
    console.log('🎨 Generating app icons...');

    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
      console.error('❌ SVG icon not found at:', svgPath);
      process.exit(1);
    }

    const svgBuffer = fs.readFileSync(svgPath);

    // Generate icon sizes
    const sizes = [
      { name: 'icon-512x512.png', size: 512 },
      { name: 'icon-192x192.png', size: 192 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'icon-32x32.png', size: 32 },
      { name: 'icon-16x16.png', size: 16 },
    ];

    for (const { name, size } of sizes) {
      const outputPath = path.join(publicDir, name);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    // Generate favicon.ico (using 32x32 and 16x16)
    console.log('✅ Icon generation complete!');
    console.log('📁 All icons saved to public/ directory');

  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
