import { Page } from '@playwright/test';
import { TodoPage } from './todo.page';

/**
 * Pages aggregator
 * Contains all page objects for easy access in tests
 *
 * Usage in fixtures:
 * pages: async ({ page }, use) => {
 *   await use(new Pages(page));
 * }
 *
 * Usage in tests:
 * test('example', async ({ pages }) => {
 *   await pages.todoPage.goto();
 * });
 */
export class Pages {
  readonly todoPage: TodoPage;

  constructor(readonly page: Page) {
    this.todoPage = new TodoPage(page);
  }
}
