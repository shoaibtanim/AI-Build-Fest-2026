import fs from 'fs';
import path from 'path';

const srcDir = './src/assets/images';
try {
  const files = fs.readdirSync(srcDir);
  console.log("Files in srcDir:", files);
  const logoFile = files.find(f => f.startsWith('eduerror_logo_') && f.endsWith('.png'));
  if (logoFile) {
    const srcPath = path.join(srcDir, logoFile);
    const destPath = './public/assets/eduerror_logo.png';
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcPath} successfully to ${destPath}`);
  } else {
    console.warn("Could not find any eduerror_logo_*.png in", srcDir);
  }
} catch (e: any) {
  console.error("Error copying file:", e.message);
}
