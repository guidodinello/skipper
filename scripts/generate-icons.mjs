#!/usr/bin/env node
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pngPath = join(__dirname, "../src/public/icons/skipper-icon.png");
const outputDir = join(__dirname, "../src/public/icons");

const sizes = [16, 32, 48, 128];

console.log("Generating PNG icons from source image...\n");

for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}.png`);

    // Resize PNG with sharp
    await sharp(pngPath)
        .resize(size, size, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toFile(outputPath);

    console.log(`✓ Generated ${size}x${size} icon: icon-${size}.png`);
}

console.log("\n✅ All icons generated successfully!");
