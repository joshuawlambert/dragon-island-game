import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 }
  });
  const page = await context.newPage();

  console.log('=== Visual Test: Dragon Island ===\n');

  // Enable console logging from the page
  page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[Page Error] ${err}`));

  console.log('1. Loading game...');
  await page.goto('http://localhost:3000/dragon-island-game/');
  
  // Wait for canvas
  await page.waitForSelector('canvas', { timeout: 10000 });
  console.log('✓ Canvas element found');

  // Wait for game to initialize (Phaser takes time)
  await page.waitForTimeout(4000);
  
  // Take screenshot of title screen
  await page.screenshot({ path: 'artifacts/verified-01-title.png', fullPage: false });
  console.log('✓ Title screen captured');

  // Simulate clicking in the "New Game" button area (center-ish, lower)
  console.log('\n2. Clicking New Game button area...');
  await page.mouse.click(512, 420); // Approximate position
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'artifacts/verified-02-after-click.png' });
  console.log('✓ After first click captured');

  // Click on "Mountain Cave" area (left side)
  console.log('\n3. Selecting Mountain Cave...');
  await page.mouse.click(192, 420); // Left card position
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'artifacts/verified-03-game-world.png' });
  console.log('✓ Game world captured');

  // Click through any tutorial dialogs
  console.log('\n4. Handling tutorial...');
  for (let i = 0; i < 3; i++) {
    await page.mouse.click(512, 384);
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: 'artifacts/verified-04-after-tutorial.png' });
  console.log('✓ After tutorial captured');

  // Test keyboard movement
  console.log('\n5. Testing movement...');
  await page.keyboard.press('w');
  await page.waitForTimeout(300);
  await page.keyboard.press('a');
  await page.waitForTimeout(300);
  await page.keyboard.press('s');
  await page.waitForTimeout(300);
  await page.keyboard.press('d');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'artifacts/verified-05-after-movement.png' });
  console.log('✓ After movement captured');

  // Test hide
  console.log('\n6. Testing hide...');
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'artifacts/verified-06-hiding.png' });
  console.log('✓ Hiding captured');

  // Unhide
  console.log('\n7. Testing unhide...');
  await page.keyboard.press('w');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'artifacts/verified-07-unhiding.png' });
  console.log('✓ Unhiding captured');

  // Test with iPad viewport
  console.log('\n8. Testing iPad viewport...');
  await page.setViewportSize({ width: 1024, height: 1366 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'artifacts/verified-08-ipad-portrait.png', fullPage: false });
  console.log('✓ iPad portrait captured');

  // Touch controls should be visible - click virtual joystick area
  console.log('\n9. Testing touch controls...');
  await page.mouse.move(120, 1366 - 120);
  await page.mouse.down();
  await page.mouse.move(140, 1366 - 140);
  await page.waitForTimeout(500);
  await page.mouse.up();
  await page.screenshot({ path: 'artifacts/verified-09-touch-controls.png', fullPage: false });
  console.log('✓ Touch controls captured');

  // Reload and test continue
  console.log('\n10. Testing save/continue...');
  await page.reload();
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'artifacts/verified-10-with-continue.png', fullPage: false });
  console.log('✓ Continue button should be visible');

  console.log('\n✅ Visual testing complete! Check artifacts folder for screenshots.');
  
  await browser.close();
})();
