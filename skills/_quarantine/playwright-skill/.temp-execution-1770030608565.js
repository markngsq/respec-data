const { chromium } = require('playwright');

const TARGET_URL = 'https://respec.app.tc1.airbase.sg';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({
    httpCredentials: { username: 'testuser', password: 'GTCteam123!' },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const routes = [
    { path: '/', name: 'dashboard' },
    { path: '/tracker', name: 'tracker' },
    { path: '/skills', name: 'skills' },
    { path: '/loadouts', name: 'loadouts' },
  ];

  for (const route of routes) {
    console.log(`Navigating to ${route.name}...`);
    await page.goto(`${TARGET_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `/tmp/respec-airbase-${route.name}.png`, fullPage: true });
    console.log(`  Screenshot saved`);
  }

  if (consoleErrors.length) {
    console.log('\nConsole errors:');
    consoleErrors.forEach(e => console.log('  ', e));
  } else {
    console.log('\nNo console errors!');
  }

  await browser.close();
})();
