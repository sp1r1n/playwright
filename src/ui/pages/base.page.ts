import { Page, Locator } from '@playwright/test';
import { step } from '@utils/decorators';
import { attachment, ContentType } from 'allure-js-commons';

/**
 * Base Page Object class
 * Contains common methods and utilities for all page objects
 */
export abstract class BasePage {
  protected abstract readonly pageUrl: string;
  protected abstract readonly pageName: string;

  constructor(protected readonly page: Page) {}

  /**
   * Navigate to the page
   */
  @step()
  async goto(): Promise<void> {
    await this.page.goto(this.pageUrl);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to load completely
   */
  @step()
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check that page is opened (should be implemented by child classes)
   */
  abstract isOpened(): Promise<void>;

  /**
   * Get the current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get the page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Take a screenshot and attach to Allure report
   */
  @step('Take screenshot: {0}')
  async takeScreenshot(name: string): Promise<void> {
    const screenshot = await this.page.screenshot();
    await attachment(name, screenshot, ContentType.PNG);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(locator: Locator, timeout: number = 5000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click element
   */
  protected async clickElement(locator: Locator): Promise<void> {
    await locator.click();
  }

  /**
   * Fill input
   */
  protected async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /**
   * Get element text
   */
  protected async getElementText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || '';
  }
}
