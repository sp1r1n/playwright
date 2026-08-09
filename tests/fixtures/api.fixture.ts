import { test as base } from './base.fixture';
import { JsonPlaceholderApi } from '@src/api';

/**
 * API fixture types
 */
export type ApiFixtures = {
  api: JsonPlaceholderApi;
};

/**
 * API test fixture
 * Extends base fixture with API client
 */
export const test = base.extend<ApiFixtures>({
  // JSONPlaceholder API client
  api: async ({ request }, use) => {
    const api = new JsonPlaceholderApi(request);
    await use(api);
  },
});

export { expect } from '@playwright/test';
