// Script pour générer les icônes PWA à partir du SVG
// Nécessite sharp: npm install -D sharp

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

// Créer un SVG simple si icon.svg n'existe pas
const createDefaultSVG = () => {
  const defaultSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)" rx="20%"/>
  <circle cx="256" cy="200" r="80" fill="white" opacity="0.9"/>
  <rect x="176" y="280" width="160" height="100" rx="10" fill="white" opacity="0.9"/>
  <text x="256" y="350" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="#2563eb" text-anchor="middle">T&amp;S</text>
</svg>`;
  
  if (!fs.existsSync(svgPath)) {
    fs.writeFileSync(svgPath, defaultSVG);
    console.log('Created default icon.svg');
  }
};

async function generateIcons() {
  try {
    // Créer le SVG par défaut si nécessaire
    createDefaultSVG();

    if (!fs.existsSync(svgPath)) {
      console.error('icon.svg not found!');
      process.exit(1);
    }

    const sizes = [
      { size: 192, name: 'icon-192x192.png' },
      { size: 512, name: 'icon-512x512.png' },
      { size: 180, name: 'apple-touch-icon.png' },
    ];

    console.log('Generating PWA icons...');

    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    console.log('\n💡 Tip: Install sharp with: npm install -D sharp');
    process.exit(1);
  }
}

generateIcons();
