const playwright = require('C:/Users/ralco/AppData/Roaming/npm/node_modules/playwright');
const { chromium } = playwright;
const fs = require('fs');

const SCREENSHOT_DIR = 'C:/Users/ralco/climate-together-nz/verify-screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const TEST_EMAIL = 'verify-test-' + Date.now() + '@mailinator.com';
const TEST_PASS  = 'TestPass123!';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page    = await context.newPage();

  const logs = [];
  page.on('console', msg => logs.push('[' + msg.type() + '] ' + msg.text()));
  page.on('pageerror', err => logs.push('[pageerror] ' + err.message));

  // Step 1: Landing page
  console.log('--- Step 1: Landing page ---');
  const r1 = await page.goto('https://climate-together-nz-production.up.railway.app/', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('HTTP status:', r1.status());
  console.log('URL:', page.url());
  const h1 = await page.locator('h1').first().innerText().catch(() => '(none)');
  console.log('H1:', h1);
  await page.screenshot({ path: SCREENSHOT_DIR + '/01-landing.png', fullPage: true });

  // Step 2: Signup page
  console.log('\n--- Step 2: Signup page ---');
  await page.goto('https://climate-together-nz-production.up.railway.app/auth?mode=signup', { waitUntil: 'networkidle', timeout: 15000 });
  console.log('URL:', page.url());
  const heading = await page.locator('h1').first().innerText().catch(() => '(none)');
  console.log('Heading:', heading);
  const btnText = await page.locator('button[type=submit]').innerText().catch(() => '(none)');
  console.log('Submit button text:', btnText);
  await page.screenshot({ path: SCREENSHOT_DIR + '/02-signup-form.png', fullPage: true });

  // Step 3: Fill form
  console.log('\n--- Step 3: Fill form ---');
  console.log('Using email:', TEST_EMAIL);
  await page.fill('input[type=email]', TEST_EMAIL);
  await page.fill('input[type=password]', TEST_PASS);
  await page.screenshot({ path: SCREENSHOT_DIR + '/03-form-filled.png', fullPage: true });

  // Step 4: Submit and observe
  console.log('\n--- Step 4: Submit ---');
  const [navResult] = await Promise.allSettled([
    page.waitForNavigation({ timeout: 12000, waitUntil: 'networkidle' }),
    page.click('button[type=submit]'),
  ]);
  console.log('Nav result:', navResult.status, navResult.reason ? navResult.reason.message : 'ok');

  // Brief pause to let any client-side redirect settle
  await page.waitForTimeout(2000);
  console.log('URL after submit:', page.url());

  const errorText = await page.locator('.bg-red-50').innerText().catch(() => '');
  const msgText   = await page.locator('[style*="e8f5e9"]').first().innerText().catch(() => '');
  if (errorText) console.log('ERROR BANNER:', errorText);
  if (msgText)   console.log('MESSAGE BANNER:', msgText);

  const bodySnippet = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 500);
  console.log('Page text snippet:', bodySnippet);
  await page.screenshot({ path: SCREENSHOT_DIR + '/04-post-submit.png', fullPage: true });

  // Step 5: Final landing
  const finalUrl = page.url();
  if (finalUrl.includes('/auth/setup')) {
    console.log('\n--- Step 5: Landed on /auth/setup ✅ ---');
    const setupH1 = await page.locator('h1').first().innerText().catch(() => '(none)');
    console.log('Heading:', setupH1);
    await page.screenshot({ path: SCREENSHOT_DIR + '/05-auth-setup.png', fullPage: true });
  } else if (finalUrl.includes('/dashboard')) {
    console.log('\n--- Step 5: Landed on /dashboard ✅ ---');
    const dashText = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300);
    console.log('Dashboard text:', dashText);
    await page.screenshot({ path: SCREENSHOT_DIR + '/05-dashboard.png', fullPage: true });
  } else {
    console.log('\n--- Step 5: Still on', finalUrl, '❌ ---');
  }

  // Step 6: All browser console logs
  console.log('\n--- Browser console logs ---');
  if (logs.length === 0) {
    console.log('(none captured)');
  } else {
    logs.forEach(l => console.log(l));
  }

  await browser.close();
  console.log('\nDone. Screenshots in:', SCREENSHOT_DIR);
})().catch(err => { console.error('FATAL:', err.message); process.exit(1); });
