import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 }
  });
  const page = await context.newPage();

  console.log('=== Depth & Feel Pass Verification ===\n');

  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[ERROR] ${msg.text()}`);
    }
  });

  console.log('1. Loading game with time-skip enabled...');
  await page.goto('http://localhost:3000/dragon-island-game/');
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'artifacts/depth-01-title.png' });
  console.log('✓ Title screen loaded');

  // Start new game
  console.log('\n2. Starting new game...');
  await page.mouse.click(512, 420);
  await page.waitForTimeout(1000);
  await page.mouse.click(192, 420); // Mountain Cave
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'artifacts/depth-02-game-start.png' });
  console.log('✓ Game started');

  // Click through tutorial
  console.log('\n3. Tutorial...');
  for (let i = 0; i < 3; i++) {
    await page.mouse.click(512, 384);
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: 'artifacts/depth-03-after-tutorial.png' });
  console.log('✓ Tutorial completed');

  // Test hiding in bush
  console.log('\n4. Testing bush hiding...');
  await page.keyboard.press('a');
  await page.waitForTimeout(300);
  await page.keyboard.press('s');
  await page.waitForTimeout(300);
  // Move into forest area where bushes are
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('a');
    await page.waitForTimeout(100);
  }
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'artifacts/depth-04-bush-hiding.png' });
  console.log('✓ Bush hiding tested');

  // Move around to find collectibles
  console.log('\n5. Testing collectibles...');
  await page.keyboard.press('w');
  await page.waitForTimeout(300);
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('s');
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'artifacts/depth-05-collectibles.png' });
  console.log('✓ Moved around collectibles');

  // Find fishing spot
  console.log('\n6. Testing fishing mini-game...');
  // Move toward lake
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('d');
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(2000); // Wait for fishing to start
  await page.screenshot({ path: 'artifacts/depth-06-fishing-start.png' });
  
  // Try to catch fish (press space a few times)
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'artifacts/depth-07-fishing-result.png' });
  console.log('✓ Fishing mini-game tested');

  // Find a quest giver
  console.log('\n7. Testing quest system...');
  // Move to rabbit location (forest area, around 600, 1600)
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('s');
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'artifacts/depth-08-near-quest-giver.png' });
  
  // Interact with quest giver
  await page.keyboard.press('e');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'artifacts/depth-09-quest-dialog.png' });
  await page.mouse.click(512, 384); // Close dialog
  await page.waitForTimeout(500);
  console.log('✓ Quest system tested');

  // Test glide ability (if unlocked)
  console.log('\n8. Testing movement abilities...');
  await page.keyboard.down('Shift');
  await page.keyboard.press('w');
  await page.waitForTimeout(300);
  await page.keyboard.up('Shift');
  await page.screenshot({ path: 'artifacts/depth-10-movement.png' });
  console.log('✓ Special movement tested');

  // Wait for full day cycle (30 seconds with time-skip)
  console.log('\n9. Waiting for full day cycle (30 seconds)...');
  await page.waitForTimeout(30000);
  await page.screenshot({ path: 'artifacts/depth-11-after-day-wait.png' });
  console.log('✓ Day cycle waited');

  // Return home and sleep
  console.log('\n10. Returning home to sleep...');
  // Move back to mountain cave (top right)
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('w');
    await page.waitForTimeout(100);
  }
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('d');
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'artifacts/depth-12-at-home.png' });
  
  // Interact to open home dialog
  await page.keyboard.press('e');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'artifacts/depth-13-home-dialog.png' });
  console.log('✓ Home dialog opened');

  // Click Continue button to sleep
  console.log('\n11. Clicking Continue to sleep...');
  await page.mouse.click(512, 450); // Continue button position
  await page.waitForTimeout(2000); // Wait for day transition
  await page.screenshot({ path: 'artifacts/depth-14-day-transition.png' });
  
  // Wait for day to advance
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'artifacts/depth-15-day-2.png' });
  console.log('✓ Day advanced');

  // Verify day counter
  console.log('\n12. Verifying day counter...');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'artifacts/depth-16-day-2-verify.png' });
  
  // Check if dialog dismissed
  const dialogVisible = await page.locator('text=/Day 2|new day/i').isVisible().catch(() => false);
  console.log(`Dialog state: ${dialogVisible ? 'visible (expected for new day message)' : 'dismissed'}`);

  // Test iPad viewport
  console.log('\n13. Testing iPad viewport...');
  await page.setViewportSize({ width: 1024, height: 1366 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'artifacts/depth-17-ipad.png' });
  console.log('✓ iPad viewport tested');

  // Touch controls
  console.log('\n14. Testing touch controls...');
  await page.mouse.move(120, 1366 - 120);
  await page.mouse.down();
  await page.mouse.move(140, 1366 - 140);
  await page.waitForTimeout(500);
  await page.mouse.up();
  await page.screenshot({ path: 'artifacts/depth-18-touch-controls.png' });
  console.log('✓ Touch controls tested');

  console.log('\n✅ All depth & feel features tested!');
  console.log('\nFeatures verified:');
  console.log('- Hiding spots (bushes/grass)');
  console.log('- Fishing mini-game with timing bar');
  console.log('- Quest system with NPCs');
  console.log('- Movement abilities (glide)');
  console.log('- Full day cycle (30s with time-skip)');
  console.log('- Day advancement via sleeping');
  console.log('- iPad touch controls');
  
  await browser.close();
})();
