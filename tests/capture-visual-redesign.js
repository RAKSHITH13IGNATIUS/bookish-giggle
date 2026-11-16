const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function capture() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.resolve(__dirname, '../.chrome-nimble-profile');
  const artifactDir = 'C:\\Users\\Rakshith Ignatius\\.gemini\\antigravity\\brain\\9e0dc541-21a4-4423-87ca-59807186a190';

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    userDataDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Homepage Desktop (1280x900)
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(artifactDir, 'redesign-homepage-desktop.png') });
  console.log('✓ Captured redesign-homepage-desktop.png');

  // 2. Homepage Mobile (390x844 - iPhone 14)
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(artifactDir, 'redesign-homepage-mobile.png') });
  console.log('✓ Captured redesign-homepage-mobile.png');

  // 3. Photo & Signature Resizer (1280x900)
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000/photo-signature-resizer', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(artifactDir, 'redesign-resizer.png') });
  console.log('✓ Captured redesign-resizer.png');

  // 4. HEIC to JPG Converter (1280x900)
  await page.goto('http://localhost:3000/heic-to-jpg', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(artifactDir, 'redesign-heic-tool.png') });
  console.log('✓ Captured redesign-heic-tool.png');

  // 5. Image Compressor & Resizer (1280x900)
  await page.goto('http://localhost:3000/image-compressor-resizer', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(artifactDir, 'redesign-compressor.png') });
  console.log('✓ Captured redesign-compressor.png');

  // 6. Images to PDF Converter (1280x900)
  await page.goto('http://localhost:3000/images-to-pdf', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(artifactDir, 'redesign-images-to-pdf.png') });
  console.log('✓ Captured redesign-images-to-pdf.png');

  // 7. PDF Split & Merge (1280x900)
  await page.goto('http://localhost:3000/pdf-split-merge', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(artifactDir, 'redesign-pdf-split-merge.png') });
  console.log('✓ Captured redesign-pdf-split-merge.png');

  await browser.close();
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
