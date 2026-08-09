import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const CI = !!process.env.CI;

/** Host the UI tests run against. Page objects hold paths, never full URLs. */
const BASE_URL = process.env.BASE_URL ?? 'https://demo.playwright.dev';
const API_BASE_URL = process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com';
const HEADLESS = process.env.HEADLESS !== 'false';

/**
 * Runs against a browser already installed on the machine instead of Playwright's bundled
 * Chromium — `chrome`, `msedge`, or a beta channel. Useful for reproducing something that
 * only happens in the real browser, and as a way out when the bundled download is blocked.
 */
const BROWSER_CHANNEL = process.env.BROWSER_CHANNEL;

/**
 * Categories turn a wall of red into two piles: things the product broke, and things the
 * suite broke. Only the first is worth waking someone up for.
 */
const allureCategories = [
  {
    name: 'Product defects',
    messageRegex: '.*(AssertionError|expect\\(.*\\)).*',
  },
  {
    name: 'Test infrastructure',
    messageRegex: '.*(Timeout|ECONNREFUSED|net::ERR).*',
  },
];

const allureReporter: ReporterDescription = [
  'allure-playwright',
  {
    resultsDir: 'allure-results',
    detail: true,
    suiteTitle: true,
    categories: allureCategories,
    environmentInfo: {
      NODE_VERSION: process.version,
      OS: `${process.platform} ${process.arch}`,
      BASE_URL,
      API_BASE_URL,
    },
  },
];

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  // Fail the build rather than silently running a single focused test.
  forbidOnly: CI,

  // Retries hide flakiness locally, where it should be fixed instead.
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,

  reporter: [['list'], ['html', { open: CI ? 'never' : 'on-failure' }], allureReporter],

  use: {
    baseURL: BASE_URL,

    // Locally the first failure is the one being debugged, so keep its trace. On CI only
    // the retry is traced, which keeps artifacts small on a suite that mostly passes.
    trace: CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    headless: HEADLESS,
    viewport: { width: 1920, height: 1080 },

    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  timeout: 60_000,
  expect: { timeout: 10_000 },

  projects: [
    {
      name: 'ui-tests',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        ...(BROWSER_CHANNEL ? { channel: BROWSER_CHANNEL } : {}),
      },
    },
    {
      name: 'api-tests',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    },
  ],

  outputDir: 'test-results',
});
