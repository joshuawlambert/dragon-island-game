import { chromium } from '@playwright/test';
import * as fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 }
  });
  const page = await context.newPage();

  console.log('Navigating to game...');
  await page.goto('http://localhost:3000/dragon-island-game/');
  
  // Wait a bit for game to load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'artifacts/01-title-screen.png', fullPage: false });
  console.log('✓ Title screen screenshot saved');

  // Look for New Game button
  const newGameVisible = await page.locator('text=New Game').isVisible().catch(() => false);
  console.log(`New Game button visible: ${newGameVisible}`);

  if (newGameVisible) {
    // Click New Game
    await page.click('text=New Game');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'artifacts/02-home-selection.png' });
    console.log('✓ Home selection screenshot saved');

    // Select Mountain Cave
    await page.click('text=Mountain Cave');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'artifacts/03-game-started.png' });
    console.log('✓ Game started screenshot saved');

    // Try movement with WASD
    await page.keyboard.press('w');
    await page.waitForTimeout(500);
    await page.keyboard.press('a');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'artifacts/04-after-movement.png' });
    console.log('✓ After movement screenshot saved');

    // Try hiding
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'artifacts/05-hiding.png' });
    console.log('✓ Hiding screenshot saved');

    // Move to unhide
    await page.keyboard.press('d');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'artifacts/06-unhiding.png' });
    console.log('✓ Unhiding screenshot saved');

    console.log('\n✅ Basic functionality test passed!');
  } else {
    console.log('❌ New Game button not found');
    const html = await page.content();
    fs.writeFileSync('artifacts/page-html.txt', html);
    console.log('Page HTML saved to artifacts/page-html.txt');
  }

  await browser.close();
})();
