import { test as base } from './api.fixture';
import { Pages } from '@src/ui';
import { attachment, ContentType } from 'allure-js-commons';

/**
 * UI fixture types
 */
export type UiFixtures = {
  pages: Pages;
  captureFailedUrl: void;
};

/**
 * UI test fixture
 * Extends API fixture with page objects
 */
export const test = base.extend<UiFixtures>({
  // Pages aggregator containing all page objects
  pages: async ({ page }, use) => {
    await use(new Pages(page));
  },

  // Capture URL on failure for debugging
  captureFailedUrl: [
    async ({ page }, use, testInfo) => {
      await use();

      if (testInfo.status === 'failed') {
        try {
          await attachment('URL on Failure', page.url(), ContentType.TEXT);
        } catch (err) {
          console.warn('⚠️ Could not capture URL:', err);
        }
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
