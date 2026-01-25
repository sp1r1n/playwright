import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Environment configuration
const BASE_URL = process.env.BASE_URL || 'https://www.google.com';
const API_BASE_URL = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';
const HEADLESS = process.env.HEADLESS !== 'false';
const CI = !!process.env.CI;

export default defineConfig({
  // Test directory
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: CI,

  // Retry on CI only
  retries: CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: CI ? 2 : undefined,

  // Reporter configuration
  reporter: CI
    ? [
        ['list'],
        ['html', { open: 'never' }],
        [
          'allure-playwright',
          {
            outputFolder: 'allure-results',
            detail: true,
            suiteTitle: true,
            categories: [
              {
                name: 'Outdated tests',
                messageRegex: '.*FileNotFound.*',
              },
              {
                name: 'Product defects',
                messageRegex: '.*AssertionError.*',
              },
            ],
            environmentInfo: {
              NODE_VERSION: process.version,
              OS: process.platform,
              BASE_URL: BASE_URL,
              API_BASE_URL: API_BASE_URL,
            },
          },
        ],
      ]
    : [
        ['list'],
        ['html', { open: 'on-failure' }],
        [
          'allure-playwright',
          {
            outputFolder: 'allure-results',
            detail: true,
            suiteTitle: true,
          },
        ],
      ],

  // Shared settings for all the projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: BASE_URL,

    // Collect trace when retrying the failed test
    trace: CI ? 'on-first-retry' : 'retain-on-failure',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Headless mode
    headless: HEADLESS,

    // Viewport settings
    viewport: { width: 1920, height: 1080 },

    // Action timeout
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Global timeout for each test
  timeout: 60000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    // UI Tests
    {
      name: 'ui-tests',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // API Tests
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

    // Cross-browser testing (optional, uncomment if needed)
    // {
    //   name: 'firefox',
    //   testDir: './tests/ui',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   testDir: './tests/ui',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Output folder for test artifacts
  outputDir: 'test-results',
});
