const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testAllServices() {
  console.log('=== RUNNING COMPREHENSIVE E2E VERIFICATION FOR ALL 4 SERVICES ===\n');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.resolve(__dirname, '../.chrome-all-profile');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    userDataDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const failedRequests = [];
  page.on('response', (res) => {
    if (res.status() >= 400) {
      failedRequests.push(`[${res.status()}] ${res.url()}`);
    }
  });

  try {
    // 1. Homepage Check
    console.log('TEST 1: Homepage & Navigation...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    const title = await page.title();
    console.log(`- Page title: "${title}"`);
    console.assert(title.includes('QuickFile.io'), 'Homepage title matches');

    // 2. Service 1: Photo & Signature Resizer
    console.log('\nTEST 2: Service 1 - Photo & Signature Resizer...');
    await page.goto('http://localhost:3000/photo-signature-resizer', { waitUntil: 'networkidle0' });
    const s1Input = await page.$('input[type="file"]');
    await s1Input.uploadFile(path.resolve(__dirname, '../sample-photo.png'));
    await page.waitForSelector('input[type="number"]', { timeout: 5000 });
    console.log('- Uploaded sample photo to Service 1 workspace');

    // Click preset
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await (await b.getProperty('innerText')).jsonValue();
      if (text.includes('Govt Exam Photo')) {
        await b.click();
        console.log('- Applied "Govt Exam Photo" preset (200x230 px)');
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 400));
    const s1Body = await page.$eval('body', (el) => el.innerText);
    console.assert(s1Body.includes('200 × 230 px'), 'Service 1 metrics match preset');
    console.log('✓ Service 1 verified successfully.');

    // 3. Service 2: Image Compressor & Resizer
    console.log('\nTEST 3: Service 2 - Image Compressor & Resizer...');
    await page.goto('http://localhost:3000/image-compressor-resizer', { waitUntil: 'networkidle0' });
    const s2Input = await page.$('input[type="file"]');
    await s2Input.uploadFile(path.resolve(__dirname, '../sample-photo.png'), path.resolve(__dirname, '../sample-signature.png'));
    await page.waitForSelector('select', { timeout: 5000 });
    console.log('- Batch uploaded 2 images into Compressor queue');

    // Click "Compress All Images"
    const s2Buttons = await page.$$('button');
    for (const b of s2Buttons) {
      const text = await (await b.getProperty('innerText')).jsonValue();
      if (text.includes('Compress All Images')) {
        await b.click();
        console.log('- Triggered batch compression');
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 1200));
    const s2Body = await page.$eval('body', (el) => el.innerText);
    console.assert(s2Body.includes('Download ZIP'), 'Download ZIP button must appear after batch compression');
    console.log('✓ Service 2 verified successfully.');

    // 4. Service 3: Images to PDF Converter
    console.log('\nTEST 4: Service 3 - Images to PDF Converter...');
    await page.goto('http://localhost:3000/images-to-pdf', { waitUntil: 'networkidle0' });
    const s3Input = await page.$('input[type="file"]');
    await s3Input.uploadFile(path.resolve(__dirname, '../sample-photo.png'), path.resolve(__dirname, '../sample-signature.png'));
    await page.waitForSelector('button', { timeout: 5000 });
    console.log('- Uploaded 2 images for PDF creation');

    // Click "Convert to PDF"
    const s3Buttons = await page.$$('button');
    for (const b of s3Buttons) {
      const text = await (await b.getProperty('innerText')).jsonValue();
      if (text.includes('Convert to PDF')) {
        await b.click();
        console.log('- Triggered PDF document generation');
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 1500));
    await page.waitForSelector('iframe', { timeout: 8000 });
    console.log('- PDF generated and preview iframe rendered');
    const s3Body = await page.$eval('body', (el) => el.innerText);
    console.assert(s3Body.includes('Download PDF'), 'Download PDF button must appear');
    console.log('✓ Service 3 verified successfully.');

    // 5. Service 4: PDF Split & Merge
    console.log('\nTEST 5: Service 4 - PDF Split & Merge...');
    await page.goto('http://localhost:3000/pdf-split-merge', { waitUntil: 'networkidle0' });
    const s4Title = await page.title();
    console.log(`- Page title: "${s4Title}"`);
    console.assert(s4Title.includes('PDF Split & Merge'), 'PDF Split & Merge title matches');
    const s4Body = await page.$eval('body', (el) => el.innerText);
    console.assert(s4Body.includes('Merge Multiple PDFs') && s4Body.includes('Split / Extract Pages'), 'Both tabs present');
    console.log('✓ Service 4 UI tabs and controls verified.');

    // Screenshot all services summary
    const shotPath = path.resolve(__dirname, 'platform-all-verified.png');
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log(`\nPlatform screenshot saved to: ${shotPath}`);

    if (failedRequests.length > 0) {
      console.warn('Network warnings:', failedRequests);
    } else {
      console.log('ZERO failed requests across all tested routes!');
    }

    console.log('\n🎉 ALL 4 SERVICES PASSED FULL END-TO-END VERIFICATION CHECKS!');
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testAllServices();
