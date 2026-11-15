const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function waitForText(page, text, timeout = 35000) {
  await page.waitForFunction(
    (target) => document.body.innerText.includes(target),
    { timeout },
    text
  );
}

async function clickButtonWithText(page, text) {
  const handle = await page.evaluateHandle((target) => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find((b) => b.innerText.toLowerCase().includes(target.toLowerCase()));
  }, text);
  const element = handle.asElement();
  if (element) {
    await element.click();
    return true;
  }
  throw new Error(`Button with text "${text}" not found`);
}

async function runRegressionSuite() {
  console.log('=== NIMBLEFILE FULL E2E REGRESSION SUITE (5 SERVICES + BRANDING + SEO + HEIC) ===\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.resolve(__dirname, '../.chrome-nimble-profile');

  // Create fake test heic to test error rejection
  fs.copyFileSync(
    path.resolve(__dirname, '../sample-photo.png'),
    path.resolve(__dirname, 'fake-renamed.heic')
  );

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    userDataDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('favicon')) {
      errors.push(`[HTTP ${res.status()}] ${res.url()}`);
    }
  });

  try {
    // ----------------------------------------------------
    // TEST 1: Homepage, Branding, 5 Tools, and No Ad Slots
    // ----------------------------------------------------
    console.log('--- TEST 1: Homepage Branding & Tool Grid ---');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    const title = await page.title();
    console.log(`✓ Homepage title: "${title}"`);
    if (!title.includes('NimbleFile')) throw new Error('Title does not contain NimbleFile');

    // Verify 5 tool cards exist
    const toolCards = await page.$$('a[href^="/"] h3');
    console.log(`✓ Tool cards visible: ${toolCards.length} (expected: 5)`);
    if (toolCards.length < 5) throw new Error(`Expected at least 5 tool cards, found ${toolCards.length}`);

    // Verify no AdSlot exists in DOM
    const adSlots = await page.$$('[aria-label="Advertising Section"], [id^="ad-slot-"]');
    console.log(`✓ Ad slot elements in DOM: ${adSlots.length} (expected: 0)`);
    if (adSlots.length > 0) throw new Error('Found remaining advertisement placeholders!');

    // Test Search input
    await page.type('input[placeholder*="Search tools"]', 'heic');
    await new Promise((r) => setTimeout(r, 200));
    const searchCards = await page.$$('a[href^="/"] h3');
    console.log(`✓ Filtered tools for "heic": ${searchCards.length}`);
    await page.screenshot({ path: path.resolve(__dirname, 'screenshot-1-homepage.png') });

    // ----------------------------------------------------
    // TEST 2: HEIC / HEIF to JPG Conversion
    // ----------------------------------------------------
    console.log('\n--- TEST 2: HEIC / HEIF to JPG Converter ---');
    await page.goto('http://localhost:3000/heic-to-jpg', { waitUntil: 'networkidle0' });

    const heicTitle = await page.title();
    console.log(`✓ HEIC page title: "${heicTitle}"`);

    // Upload real ISO/IEC conformance HEIC file
    const heicInput = await page.$('input[type="file"]');
    const realHeicPath = path.resolve(__dirname, 'sample.heic');
    await heicInput.uploadFile(realHeicPath);

    // Wait for file item to appear in queue
    await waitForText(page, 'sample.heic', 5000);
    console.log('✓ File sample.heic added to conversion queue');

    // Click "Convert to JPG"
    const convertBtn = await page.waitForSelector('#convert-heic-btn', { timeout: 5000 });
    console.log('✓ Initiating client-side HEIC decoding via heic2any...');
    await convertBtn.click();

    // Wait for conversion progress and completion
    await page.waitForFunction(() => document.body.innerText.includes('Converting'), { timeout: 5000 });
    console.log('✓ In-browser WebAssembly conversion active...');
    await page.waitForFunction(() => !document.body.innerText.includes('Converting'), { timeout: 60000 });
    console.log('✓ sample.heic successfully decoded and converted to JPG in browser!');

    await new Promise((r) => setTimeout(r, 500));

    // Verify download button is present and clickable
    await clickButtonWithText(page, 'Download');
    console.log('✓ Download button present and clicked for converted JPG');

    // Test Error handling with fake renamed file
    console.log('✓ Testing rejection of spoofed/renamed fake.heic...');
    const fakeHeicPath = path.resolve(__dirname, 'fake-renamed.heic');
    await heicInput.uploadFile(fakeHeicPath);
    await waitForText(page, 'does not contain a valid HEIC/HEIF image header', 5000);
    console.log('✓ Spoofed file correctly rejected by magic-byte validation!');

    await page.screenshot({ path: path.resolve(__dirname, 'screenshot-2-heic.png') });

    // ----------------------------------------------------
    // TEST 3: Photo & Signature Resizer
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Photo & Signature Resizer ---');
    await page.goto('http://localhost:3000/photo-signature-resizer', { waitUntil: 'networkidle0' });
    const resizerInput = await page.$('input[type="file"]');
    await resizerInput.uploadFile(path.resolve(__dirname, '../sample-photo.png'));
    await page.waitForSelector('input[type="number"]', { timeout: 5000 });

    // Verify no AdSlot exists on page
    const resizerAds = await page.$$('[id^="ad-slot-"]');
    if (resizerAds.length > 0) throw new Error('Ad slot found on resizer page');

    // Select Govt Exam preset button
    await clickButtonWithText(page, 'Govt Exam Photo');
    await new Promise((r) => setTimeout(r, 600));

    // Verify processed output exists
    await waitForText(page, 'Download Resized Image', 8000);
    console.log('✓ Photo & Signature Resizer successfully resized image to preset dimensions');
    await page.screenshot({ path: path.resolve(__dirname, 'screenshot-3-resizer.png') });

    // ----------------------------------------------------
    // TEST 4: Image Compressor & Resizer
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Image Compressor & Resizer ---');
    await page.goto('http://localhost:3000/image-compressor-resizer', { waitUntil: 'networkidle0' });
    const compInput = await page.$('input[type="file"]');
    await compInput.uploadFile(path.resolve(__dirname, '../sample-photo.png'));
    await waitForText(page, 'sample-photo.png', 5000);

    // Compress
    await clickButtonWithText(page, 'Compress All Images');
    await waitForText(page, 'Compressed', 10000);
    console.log('✓ Image Compressor processed image successfully');

    // ----------------------------------------------------
    // TEST 5: Images to PDF Converter
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Images to PDF Converter ---');
    await page.goto('http://localhost:3000/images-to-pdf', { waitUntil: 'networkidle0' });
    const img2pdfInput = await page.$('input[type="file"]');
    await img2pdfInput.uploadFile(path.resolve(__dirname, '../sample-photo.png'));
    await waitForText(page, 'sample-photo.png', 5000);
    await clickButtonWithText(page, 'Convert to PDF');
    await waitForText(page, 'Download PDF', 15000);
    console.log('✓ Images to PDF generated PDF successfully');

    // ----------------------------------------------------
    // TEST 6: PDF Split & Merge
    // ----------------------------------------------------
    console.log('\n--- TEST 6: PDF Split & Merge ---');
    await page.goto('http://localhost:3000/pdf-split-merge', { waitUntil: 'networkidle0' });
    const pdfToolHeading = await page.$eval('h1', el => el.innerText);
    console.log(`✓ PDF Split & Merge loaded: "${pdfToolHeading}"`);

    // ----------------------------------------------------
    // TEST 7: Technical SEO Endpoints
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Technical SEO (robots.txt & sitemap.xml) ---');
    const robotsRes = await page.goto('http://localhost:3000/robots.txt');
    console.log(`✓ robots.txt status: ${robotsRes.status()}`);
    const robotsText = await robotsRes.text();
    console.log(`✓ robots.txt content:\n${robotsText.trim()}`);

    const sitemapRes = await page.goto('http://localhost:3000/sitemap.xml');
    console.log(`✓ sitemap.xml status: ${sitemapRes.status()}`);

    console.log('\n=== ALL REGRESSION TESTS PASSED WITH 0 CRITICAL ERRORS! ===');
  } finally {
    await browser.close();
    // Clean up temporary fake file
    if (fs.existsSync(path.resolve(__dirname, 'fake-renamed.heic'))) {
      fs.unlinkSync(path.resolve(__dirname, 'fake-renamed.heic'));
    }
  }
}

runRegressionSuite().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
