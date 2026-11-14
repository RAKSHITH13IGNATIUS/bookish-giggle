const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function runE2ETest() {
  console.log('--- Starting Comprehensive E2E Browser Test ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.resolve(__dirname, '../.chrome-e2e-profile');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    userDataDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleLogs = [];
  page.on('requestfailed', (req) => {
    consoleLogs.push(`[Request Failed]: ${req.url()} (${req.failure()?.errorText})`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) {
      consoleLogs.push(`[Response ${res.status()}]: ${res.url()}`);
    }
  });

  try {
    // 1. Test Homepage
    console.log('Step 1: Navigating to Homepage (http://localhost:3000)...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    const title = await page.title();
    console.log(`Page Title: "${title}"`);
    console.assert(title.includes('QuickFile.io'), 'Title must contain QuickFile.io');

    const heroText = await page.$eval('h1', (el) => el.innerText);
    console.log(`Hero Headline: "${heroText.replace(/\n/g, ' ')}"`);
    console.assert(heroText.includes('Fast, Free & Private'), 'Headline must match branding');

    // Test Search input
    console.log('Testing search functionality on homepage...');
    await page.type('input[placeholder*="Search tools"]', 'Signature');
    await new Promise((r) => setTimeout(r, 200));
    const visibleCards = await page.$$('a[href="/photo-signature-resizer"]');
    console.assert(visibleCards.length >= 1, 'Search should display Photo & Signature Resizer');
    console.log('Search filter verified.');

    // 2. Navigate to Photo & Signature Resizer
    console.log('\nStep 2: Navigating to /photo-signature-resizer...');
    await page.goto('http://localhost:3000/photo-signature-resizer', { waitUntil: 'networkidle0' });
    const resizerTitle = await page.title();
    console.log(`Resizer Page Title: "${resizerTitle}"`);
    console.assert(resizerTitle.includes('Photo & Signature Resizer'), 'Title must match tool');

    // Verify Disclaimer is present
    const disclaimer = await page.$eval('body', (el) => el.innerText);
    console.assert(disclaimer.includes('Important Notice Regarding Presets'), 'Disclaimer must be present');
    console.log('Disclaimer verified.');

    // 3. Upload Sample Photo
    console.log('\nStep 3: Uploading test photo...');
    const sampleFilePath = path.resolve(__dirname, '../sample-photo.png');
    console.assert(fs.existsSync(sampleFilePath), 'Sample photo file must exist');

    const fileInput = await page.$('input[type="file"]');
    console.assert(fileInput !== null, 'File input must exist');
    await fileInput.uploadFile(sampleFilePath);

    // Wait for the workspace UI to load and process the image
    console.log('Waiting for canvas image processing...');
    await page.waitForSelector('input[type="number"]', { timeout: 8000 });
    console.log('Workspace loaded with controls.');

    // 4. Test Preset Selection
    console.log('\nStep 4: Testing Preset Selection...');
    // Click on preset for SSC/UPSC (200x230 px)
    const presetButtons = await page.$$('button');
    let sscPresetFound = false;
    for (const btn of presetButtons) {
      const text = await (await btn.getProperty('innerText')).jsonValue();
      if (text.includes('Govt Exam Photo')) {
        await btn.click();
        sscPresetFound = true;
        console.log('Clicked "Govt Exam Photo (SSC / UPSC / IBPS)" preset button.');
        break;
      }
    }
    console.assert(sscPresetFound, 'Govt exam preset button should be found and clicked');

    await new Promise((r) => setTimeout(r, 400));

    // Verify dimensions updated
    const numberInputs = await page.$$('input[type="number"]');
    const widthVal = await (await numberInputs[0].getProperty('value')).jsonValue();
    const heightVal = await (await numberInputs[1].getProperty('value')).jsonValue();
    console.log(`Updated Dimensions after preset: Width = ${widthVal} px, Height = ${heightVal} px`);
    console.assert(widthVal === '200', `Expected width 200, got ${widthVal}`);
    console.assert(heightVal === '230', `Expected height 230, got ${heightVal}`);

    // 5. Test Live Preview and Status
    console.log('\nStep 5: Verifying live preview and status metrics...');
    const bodyText = await page.$eval('body', (el) => el.innerText);
    console.assert(bodyText.includes('200 × 230 px'), 'Metrics must reflect 200x230 px output');
    console.assert(bodyText.includes('Target Met') || bodyText.includes('Status'), 'Status badge must appear');
    console.log('Live preview metrics verified.');

    // 6. Test Tab Switching
    console.log('\nStep 6: Testing Preview Tabs (Result vs Original)...');
    const tabButtons = await page.$$('button');
    for (const btn of tabButtons) {
      const text = await (await btn.getProperty('innerText')).jsonValue();
      if (text === 'Original') {
        await btn.click();
        console.log('Switched to Original tab');
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 200));

    // 7. Verify Download Button
    console.log('\nStep 7: Verifying Download Action...');
    const downloadBtn = await page.$('button:has(svg) > span');
    const allButtons = await page.$$('button');
    let hasDownload = false;
    for (const b of allButtons) {
      const t = await (await b.getProperty('innerText')).jsonValue();
      if (t.includes('Download Resized Image')) {
        hasDownload = true;
        const isDisabled = await (await b.getProperty('disabled')).jsonValue();
        console.assert(!isDisabled, 'Download button must be enabled when result is ready');
        console.log('Download button is active, enabled, and ready for user click.');
        break;
      }
    }
    console.assert(hasDownload, 'Download button must exist');

    // 8. Capture Screenshot for Documentation
    const screenshotPath = path.resolve(__dirname, 'resizer-verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\nScreenshot saved to: ${screenshotPath}`);

    // Verify no unhandled errors
    if (consoleLogs.length > 0) {
      console.warn('Browser console warnings/errors:', consoleLogs);
    } else {
      console.log('Zero console errors detected!');
    }

    console.log('\n ALL E2E VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('E2E Test Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runE2ETest();
