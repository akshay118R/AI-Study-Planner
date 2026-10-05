import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nativeImage, app } from 'electron';
import pngToIco from 'png-to-ico';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceJpg = path.resolve(__dirname, '../build/icon.png');
const buildDir = path.resolve(__dirname, '../build');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

async function run() {
  console.log('Loading source image:', sourceJpg);
  const img = nativeImage.createFromPath(sourceJpg);
  if (img.isEmpty()) {
    console.error('Failed to load image!');
    process.exit(1);
  }

  const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
  const pngBuffers = [];
  const tempFiles = [];

  for (const s of sizes) {
    const resized = img.resize({ width: s, height: s, quality: 'best' });
    const buf = resized.toPNG();
    const filePath = path.join(buildDir, `icon-${s}.png`);
    fs.writeFileSync(filePath, buf);
    if (s <= 256) {
      tempFiles.push(filePath);
    }
    if (s === 512) {
      fs.writeFileSync(path.join(buildDir, 'icon.png'), buf);
    }
  }

  console.log('Generating Windows .ico with png-to-ico...');
  const icoBuf = await pngToIco(tempFiles);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuf);

  console.log('✅ Successfully created build/icon.ico and build/icon.png with sizes 16-512px!');
  app.exit(0);
}

app.whenReady().then(run).catch(err => {
  console.error(err);
  app.exit(1);
});
