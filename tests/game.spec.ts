import { test, expect } from '@playwright/test';

test.describe('Dragon Island Game', () => {
  test('should load title screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Dragon Island')).toBeVisible({ timeout: 10000 });
  });

  test('should start new game and select home', async ({ page }) => {
    await page.goto('/');
    
    // Wait for title screen
    await page.waitForSelector('text=New Game', { timeout: 10000 });
    
    // Click New Game
    await page.click('text=New Game');
    
    // Wait for home selection
    await page.waitForSelector('text=Choose Your Home', { timeout: 5000 });
    
    // Select Mountain Cave
    await page.click('text=Mountain Cave');
    
    // Wait for game to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'artifacts/game-started.png', fullPage: true });
  });

  test('should continue saved game', async ({ page }) => {
    // First create a save by starting a new game
    await page.goto('/');
    await page.waitForSelector('text=New Game', { timeout: 10000 });
    await page.click('text=New Game');
    await page.waitForSelector('text=Choose Your Home', { timeout: 5000 });
    await page.click('text=Forest Hollow');
    await page.waitForTimeout(2000);
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Should now have Continue button
    await expect(page.locator('text=Continue')).toBeVisible({ timeout: 10000 });
    
    await page.click('text=Continue');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'artifacts/game-continued.png', fullPage: true });
  });

  test('should handle keyboard controls', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=New Game', { timeout: 10000 });
    await page.click('text=New Game');
    await page.waitForSelector('text=Choose Your Home', { timeout: 5000 });
    await page.click('text=Hillside Cave');
    
    // Wait for tutorial to complete
    await page.waitForTimeout(1000);
    
    // Click through tutorial dialogs if present
    for (let i = 0; i < 3; i++) {
      const dialog = page.locator('text=/Welcome|Press SPACE|Great/');
      if (await dialog.isVisible()) {
        await page.mouse.click(500, 400);
        await page.waitForTimeout(500);
      }
    }
    
    // Test WASD movement
    await page.keyboard.press('w');
    await page.waitForTimeout(100);
    await page.keyboard.press('a');
    await page.waitForTimeout(100);
    
    // Test hide
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    
    // Move to unhide
    await page.keyboard.press('d');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'artifacts/keyboard-controls.png', fullPage: true });
  });

  test('should display HUD elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=New Game', { timeout: 10000 });
    await page.click('text=New Game');
    await page.waitForSelector('text=Choose Your Home', { timeout: 5000 });
    await page.click('text=Mountain Cave');
    await page.waitForTimeout(2000);
    
    // Click through tutorial
    for (let i = 0; i < 3; i++) {
      await page.mouse.click(500, 400);
      await page.waitForTimeout(500);
    }
    
    // Check HUD elements
    await expect(page.locator('text=/Day \\d+/')).toBeVisible();
    await expect(page.locator('text=/\\d+:\\d+ (AM|PM)/')).toBeVisible();
    await expect(page.locator('text=/Hunger/')).toBeVisible();
    
    await page.screenshot({ path: 'artifacts/hud-display.png', fullPage: true });
  });
});

test.describe('Touch Controls', () => {
  test('should work on iPad', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'iPad test only on chromium');
    
    await page.goto('/');
    await page.waitForSelector('text=New Game', { timeout: 10000 });
    await page.click('text=New Game');
    await page.waitForSelector('text=Choose Your Home', { timeout: 5000 });
    await page.click('text=Forest Hollow');
    await page.waitForTimeout(2000);
    
    // Click through tutorial
    for (let i = 0; i < 3; i++) {
      await page.mouse.click(500, 400);
      await page.waitForTimeout(500);
    }
    
    // Touch controls should be visible on iPad viewport
    // Look for virtual joystick and buttons (they use emojis)
    await page.screenshot({ path: 'artifacts/touch-controls-ipad.png', fullPage: true });
    
    // Simulate touch on virtual joystick area (bottom left)
    await page.mouse.move(120, page.viewportSize()!.height - 120);
    await page.mouse.down();
    await page.mouse.move(140, page.viewportSize()!.height - 140);
    await page.waitForTimeout(500);
    await page.mouse.up();
    
    await page.screenshot({ path: 'artifacts/touch-joystick-active.png', fullPage: true });
  });
});
