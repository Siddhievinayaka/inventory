#!/usr/bin/env node

/**
 * Image Optimization Script leveraging Sharp
 * 
 * Requirements:
 * 1. Scan a designated image media path recursively to locate unoptimized raw assets (.jpg, .jpeg, .png).
 * 2. Programmatically convert images into WebP file formats, enforcing an 82% quality target.
 * 3. Standardize layouts by scaling source images to a uniform 1:1 aspect ratio square background canvas matching standard product grid dimensions.
 * 4. Output optimized naming strings and save them into a structured destination folder structure without destroying original source content assets.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration Defaults
const DEFAULTS = {
  size: 800,           // 1:1 canvas size (800x800)
  bg: '#ffffff',       // Default canvas background (white)
  quality: 82,         // WebP compression quality
};

// Help / Usage guide
function printUsage() {
  console.log(`
Usage: node optimize-images.js [options]

Required Options:
  --source, -s <path>      Path to the source directory containing raw images.
  --dest, -d <path>        Path to the destination directory to save optimized images.

Optional Options:
  --size, -z <number>      Target dimension for 1:1 canvas (default: ${DEFAULTS.size})
  --bg, -b <hex>           Background color in HEX for canvas padding (default: ${DEFAULTS.bg})
  --quality, -q <number>   WebP quality compression target (1-100, default: ${DEFAULTS.quality})
  --help, -h               Show this help message.

Example:
  node optimize-images.js --source ./raw-images --dest ./public/images --size 800 --bg ffffff --quality 82
`);
}

// Custom simple CLI parser
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    source: null,
    dest: null,
    size: DEFAULTS.size,
    bg: DEFAULTS.bg,
    quality: DEFAULTS.quality,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else if (arg === '--source' || arg === '-s') {
      params.source = args[++i];
    } else if (arg === '--dest' || arg === '-d') {
      params.dest = args[++i];
    } else if (arg === '--size' || arg === '-z') {
      const parsedSize = parseInt(args[++i], 10);
      if (!isNaN(parsedSize) && parsedSize > 0) {
        params.size = parsedSize;
      }
    } else if (arg === '--bg' || arg === '-b') {
      let bgVal = args[++i];
      if (!bgVal.startsWith('#')) {
        bgVal = '#' + bgVal;
      }
      params.bg = bgVal;
    } else if (arg === '--quality' || arg === '-q') {
      const parsedQuality = parseInt(args[++i], 10);
      if (!isNaN(parsedQuality) && parsedQuality >= 1 && parsedQuality <= 100) {
        params.quality = parsedQuality;
      }
    }
  }

  return params;
}

// Convert HEX color to RGB object for Sharp background option
function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    alpha: 1
  } : { r: 255, g: 255, b: 255, alpha: 1 }; // Default to white on parsing error
}

// Slugify string (standardize filename formatting)
function slugify(name) {
  return name
    .toLowerCase()
    // Replace accented characters/diacritics
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace non-alphanumeric characters with a single hyphen
    .replace(/[^a-z0-9]+/g, '-')
    // Trim hyphens from both ends
    .replace(/^-+|-+$/g, '');
}

// Recursive directory scanner for .jpg, .jpeg, .png files
async function findImages(dir) {
  const matchedFiles = [];
  
  async function scan(currentDir) {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
          matchedFiles.push(fullPath);
        }
      }
    }
  }

  await scan(dir);
  return matchedFiles;
}

// Helper to format bytes to human readable sizes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Main execution function
async function run() {
  const params = parseArgs();

  // Validate required options
  if (!params.source || !params.dest) {
    console.error('Error: Source and Destination directories must be provided.');
    printUsage();
    process.exit(1);
  }

  const sourceDir = path.resolve(params.source);
  const destDir = path.resolve(params.dest);

  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Source directory "${sourceDir}" does not exist.`);
    process.exit(1);
  }

  console.log('--------------------------------------------------');
  console.log('🤖 Product Image Optimizer Starting...');
  console.log(`📂 Source Directory:      ${sourceDir}`);
  console.log(`📂 Destination Directory: ${destDir}`);
  console.log(`📏 Canvas Square Dimensions: ${params.size}x${params.size} px`);
  console.log(`🎨 Background Color:       ${params.bg}`);
  console.log(`🎯 Quality Target:         ${params.quality}%`);
  console.log('--------------------------------------------------\n');

  try {
    console.log('🔍 Scanning source directory for raw images (.jpg, .jpeg, .png)...');
    const images = await findImages(sourceDir);
    console.log(`✨ Found ${images.length} raw image(s) to optimize.\n`);

    if (images.length === 0) {
      console.log('No images found to process. Exiting.');
      return;
    }

    const rgbBg = hexToRgb(params.bg);
    const results = [];
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    for (const imgPath of images) {
      // Relative path from source directory
      const relativePath = path.relative(sourceDir, imgPath);
      const parsedPath = path.parse(relativePath);

      // Slugify base name
      const sluggedName = slugify(parsedPath.name);
      const outputFilename = `${sluggedName || 'image'}.webp`;

      // Determine output directory mirroring original structure
      const targetSubDir = path.join(destDir, parsedPath.dir);
      const targetPath = path.join(targetSubDir, outputFilename);

      // Create target directory if it doesn't exist
      await fs.promises.mkdir(targetSubDir, { recursive: true });

      // Load image statistics
      const originalStats = await fs.promises.stat(imgPath);
      totalOriginalSize += originalStats.size;

      console.log(`⏳ Processing: "${relativePath}"`);

      // Optimize using sharp
      await sharp(imgPath)
        // Resize image to fit in square grid dimension maintaining aspect ratio
        .resize({
          width: params.size,
          height: params.size,
          fit: 'contain',
          background: rgbBg
        })
        // Convert to WebP format
        .webp({ quality: params.quality })
        .toFile(targetPath);

      const optimizedStats = await fs.promises.stat(targetPath);
      totalOptimizedSize += optimizedStats.size;

      const sizeReduction = ((originalStats.size - optimizedStats.size) / originalStats.size) * 100;
      
      results.push({
        source: relativePath,
        optimized: path.relative(destDir, targetPath),
        originalSize: formatBytes(originalStats.size),
        optimizedSize: formatBytes(optimizedStats.size),
        savings: `${sizeReduction.toFixed(1)}%`
      });

      console.log(`   └─ Saved as: "${path.relative(destDir, targetPath)}"`);
      console.log(`   └─ Size: ${formatBytes(originalStats.size)} -> ${formatBytes(optimizedStats.size)} (${sizeReduction.toFixed(1)}% reduction)\n`);
    }

    // Print summary report
    console.log('==================================================');
    console.log('📊 OPTIMIZATION SUMMARY');
    console.log('==================================================');
    console.table(results.map(r => ({
      'Original Image': r.source,
      'Optimized String': r.optimized,
      'Original Size': r.originalSize,
      'Optimized Size': r.optimizedSize,
      'Reduction': r.savings
    })));

    const overallReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100;
    console.log('\n📈 TOTAL SAVINGS REPORT');
    console.log(`   Total Images:      ${images.length}`);
    console.log(`   Total Original:    ${formatBytes(totalOriginalSize)}`);
    console.log(`   Total Optimized:   ${formatBytes(totalOptimizedSize)}`);
    console.log(`   Overall Savings:   ${overallReduction.toFixed(1)}% space saved`);
    console.log('==================================================');
    console.log('🎉 Done optimizing! Original assets are untouched.');
    console.log('==================================================');

  } catch (error) {
    console.error('An error occurred during execution:', error);
    process.exit(1);
  }
}

run();
