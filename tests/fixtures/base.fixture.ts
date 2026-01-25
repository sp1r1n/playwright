import { test as base } from '@playwright/test';
import { layer } from 'allure-js-commons';

/**
 * Base fixture types
 */
export type BaseFixtures = {
  allureMetadata: void;
};

/**
 * Base test fixture
 * Contains common setup for all tests
 */
export const test = base.extend<BaseFixtures>({
  // Add Allure layer metadata
  allureMetadata: [
    async ({}, use) => {
      await layer('playwright-e2e');
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
