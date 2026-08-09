import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '@utils/decorators';

/**
 * TodoMVC Page Object
 * Based on Playwright's demo app - designed for testing automation
 */
export class TodoPage extends BasePage {
  // Relative to `baseURL`, so the same suite can run against a local build of the app.
  protected readonly pageUrl = '/todomvc';
  protected readonly pageName = 'TodoMVC App';

  // Locators
  readonly newTodoInput: Locator;
  readonly todoItems: Locator;
  readonly todoLabels: Locator;
  readonly toggleAll: Locator;
  readonly clearCompleted: Locator;
  readonly todoCount: Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;

  constructor(page: Page) {
    super(page);

    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoItems = page.getByTestId('todo-item');
    this.todoLabels = page.locator('[data-testid="todo-item"] label');
    this.toggleAll = page.getByLabel('Mark all as complete');
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
    this.todoCount = page.getByTestId('todo-count');
    this.filterAll = page.getByRole('link', { name: 'All' });
    this.filterActive = page.getByRole('link', { name: 'Active' });
    this.filterCompleted = page.getByRole('link', { name: 'Completed' });
  }

  @step("Check that 'TodoMVC' page is opened")
  async isOpened(): Promise<void> {
    await expect(this.newTodoInput).toBeVisible();
  }

  @step('Add todo: {0}')
  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  @step('Add multiple todos')
  async addTodos(texts: string[]): Promise<void> {
    for (const text of texts) {
      await this.addTodo(text);
    }
  }

  @step('Get todo count')
  async getTodoCount(): Promise<number> {
    return await this.todoItems.count();
  }

  @step('Get all todo texts')
  async getTodoTexts(): Promise<string[]> {
    return await this.todoLabels.allTextContents();
  }

  @step('Toggle todo at index: {0}')
  async toggleTodo(index: number): Promise<void> {
    const todo = this.todoItems.nth(index);
    await todo.getByRole('checkbox').click();
  }

  @step('Toggle todo: {0}')
  async toggleTodoByText(text: string): Promise<void> {
    const todo = this.todoItems.filter({ hasText: text });
    await todo.getByRole('checkbox').click();
  }

  @step('Delete todo at index: {0}')
  async deleteTodo(index: number): Promise<void> {
    const todo = this.todoItems.nth(index);
    await todo.hover();
    await todo.getByRole('button', { name: 'Delete' }).click();
  }

  @step('Delete todo: {0}')
  async deleteTodoByText(text: string): Promise<void> {
    const todo = this.todoItems.filter({ hasText: text });
    await todo.hover();
    await todo.getByRole('button', { name: 'Delete' }).click();
  }

  @step('Edit todo at index {0} to: {1}')
  async editTodo(index: number, newText: string): Promise<void> {
    const todo = this.todoItems.nth(index);
    await todo.dblclick();
    await todo.getByRole('textbox', { name: 'Edit' }).fill(newText);
    await todo.getByRole('textbox', { name: 'Edit' }).press('Enter');
  }

  @step('Toggle all todos')
  async toggleAllTodos(): Promise<void> {
    await this.toggleAll.click();
  }

  @step('Clear completed todos')
  async clearCompletedTodos(): Promise<void> {
    await this.clearCompleted.click();
  }

  @step('Filter by all')
  async filterByAll(): Promise<void> {
    await this.filterAll.click();
    await this.page.waitForURL('**/#/');
  }

  @step('Filter by active')
  async filterByActive(): Promise<void> {
    await this.filterActive.click();
    await this.page.waitForURL('**/#/active');
  }

  @step('Filter by completed')
  async filterByCompleted(): Promise<void> {
    await this.filterCompleted.click();
    await this.page.waitForURL('**/#/completed');
  }

  @step('Get remaining items count')
  async getRemainingCount(): Promise<string> {
    return (await this.todoCount.textContent()) || '';
  }

  @step('Check if todo at index {0} is completed')
  async isTodoCompleted(index: number): Promise<boolean> {
    const todo = this.todoItems.nth(index);
    const checkbox = todo.getByRole('checkbox');
    return await checkbox.isChecked();
  }

  @step('Verify todo text at index {0}')
  async verifyTodoText(index: number, expectedText: string): Promise<void> {
    const todo = this.todoItems.nth(index);
    await expect(todo).toContainText(expectedText);
  }

  async isNewTodoInputVisible(): Promise<boolean> {
    return await this.isElementVisible(this.newTodoInput);
  }
}
