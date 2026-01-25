import { uiTest as test, expect } from '../fixtures';
import { allure } from 'allure-playwright';
import { attachment, ContentType } from 'allure-js-commons';

/**
 * TodoMVC UI Tests
 * Uses Playwright's demo app designed for testing automation
 * Demonstrates best practices for UI testing
 */
test.describe('TodoMVC Application', () => {
  test.beforeEach(async ({ pages }) => {
    await pages.todoPage.goto();
    await pages.todoPage.isOpened();
  });

  test(
    'should display empty state on initial load',
    { tag: '@smoke' },
    async ({ pages }) => {
      await allure.feature('TodoMVC');
      await allure.story('Initial State');
      await allure.severity('critical');
      await allure.owner('QA Team');
      await allure.description('Verify that TodoMVC app displays correctly on initial load');

      // Verify input is visible
      const isVisible = await pages.todoPage.isNewTodoInputVisible();
      expect(isVisible).toBeTruthy();

      // Verify no todos initially
      const todoCount = await pages.todoPage.getTodoCount();
      expect(todoCount).toBe(0);

      await pages.todoPage.takeScreenshot('TodoMVC Initial State');

      await attachment('Initial State Info', `Input visible: ${isVisible}, Todo count: ${todoCount}`, ContentType.TEXT);
    }
  );

  test(
    'should add a new todo item',
    { tag: ['@smoke', '@regression'] },
    async ({ pages }) => {
      await allure.feature('TodoMVC');
      await allure.story('Add Todo');
      await allure.severity('blocker');
      await allure.owner('QA Team');
      await allure.epic('Todo Management');
      await allure.description('Verify that user can add a new todo item');

      const todoText = 'Buy groceries';

      await pages.todoPage.addTodo(todoText);

      const todoCount = await pages.todoPage.getTodoCount();
      expect(todoCount).toBe(1);

      await pages.todoPage.verifyTodoText(0, todoText);

      const remainingCount = await pages.todoPage.getRemainingCount();
      expect(remainingCount).toContain('1');

      await pages.todoPage.takeScreenshot('After adding todo');
    }
  );

  test(
    'should add multiple todo items',
    { tag: '@functional' },
    async ({ pages }) => {
      await allure.feature('TodoMVC');
      await allure.story('Add Multiple Todos');
      await allure.severity('normal');
      await allure.owner('QA Team');

      const todos = ['Task 1', 'Task 2', 'Task 3'];

      await pages.todoPage.addTodos(todos);

      const todoCount = await pages.todoPage.getTodoCount();
      expect(todoCount).toBe(3);

      const todoTexts = await pages.todoPage.getTodoTexts();
      expect(todoTexts).toEqual(todos);

      await pages.todoPage.takeScreenshot('Multiple todos added');
    }
  );

  test(
    'should toggle todo completion',
    { tag: '@regression' },
    async ({ pages }) => {
      await allure.feature('TodoMVC');
      await allure.story('Toggle Todo');
      await allure.severity('critical');
      await allure.owner('QA Team');

      const todoText = 'Complete this task';

      await pages.todoPage.addTodo(todoText);
      await pages.todoPage.toggleTodo(0);

      const isCompleted = await pages.todoPage.isTodoCompleted(0);
      expect(isCompleted).toBeTruthy();

      const remainingCount = await pages.todoPage.getRemainingCount();
      expect(remainingCount).toContain('0');

      await pages.todoPage.takeScreenshot('Todo completed');
    }
  );

  test(
    'should delete a todo item',
    { tag: '@regression' },
    async ({ pages }) => {
      await allure.feature('TodoMVC');
      await allure.story('Delete Todo');
      await allure.severity('critical');
      await allure.owner('QA Team');

      const todos = ['Keep this', 'Delete this'];

      await pages.todoPage.addTodos(todos);
      expect(await pages.todoPage.getTodoCount()).toBe(2);

      await pages.todoPage.deleteTodoByText('Delete this');

      const todoCount = await pages.todoPage.getTodoCount();
      expect(todoCount).toBe(1);

      const todoTexts = await pages.todoPage.getTodoTexts();
      expect(todoTexts).toEqual(['Keep this']);

      await pages.todoPage.takeScreenshot('After deletion');
    }
  );

  test(
    'should edit a todo item',
    { tag: '@functional' },
    async ({ pages }) => {
      await allure.feature('TodoMVC');
      await allure.story('Edit Todo');
      await allure.severity('normal');
      await allure.owner('QA Team');

      const originalText = 'Original todo';
      const newText = 'Edited todo';

      await pages.todoPage.addTodo(originalText);
      await pages.todoPage.editTodo(0, newText);
      await pages.todoPage.verifyTodoText(0, newText);

      await pages.todoPage.takeScreenshot('After editing');
    }
  );

  test(
    'should filter todos by status',
    { tag: '@functional' },
    async ({ pages, page }) => {
      await allure.feature('TodoMVC');
      await allure.story('Filter Todos');
      await allure.severity('normal');
      await allure.owner('QA Team');

      await pages.todoPage.addTodos(['Active task 1', 'Completed task', 'Active task 2']);
      await pages.todoPage.toggleTodoByText('Completed task');

      // Filter by active
      await pages.todoPage.filterByActive();
      let visibleCount = await pages.todoPage.getTodoCount();
      expect(visibleCount).toBe(2);
      await pages.todoPage.takeScreenshot('Active filter');

      // Filter by completed
      await pages.todoPage.filterByCompleted();
      visibleCount = await pages.todoPage.getTodoCount();
      expect(visibleCount).toBe(1);
      await pages.todoPage.takeScreenshot('Completed filter');

      // Navigate back to see all
      await page.goto('https://demo.playwright.dev/todomvc');
      await page.waitForLoadState('domcontentloaded');
      visibleCount = await pages.todoPage.getTodoCount();
      expect(visibleCount).toBe(3);
      await pages.todoPage.takeScreenshot('All todos');
    }
  );

  test(
    'should clear completed todos',
    { tag: '@functional' },
    async ({ pages }) => {
      await allure.feature('TodoMVC');
      await allure.story('Clear Completed');
      await allure.severity('normal');
      await allure.owner('QA Team');

      await pages.todoPage.addTodos(['Task 1', 'Task 2', 'Task 3']);
      await pages.todoPage.toggleTodo(0);
      await pages.todoPage.toggleTodo(2);

      await pages.todoPage.clearCompletedTodos();

      const todoCount = await pages.todoPage.getTodoCount();
      expect(todoCount).toBe(1);

      const todoTexts = await pages.todoPage.getTodoTexts();
      expect(todoTexts).toEqual(['Task 2']);

      await pages.todoPage.takeScreenshot('After clearing completed');
    }
  );

  test(
    'should toggle all todos at once',
    { tag: '@functional' },
    async ({ pages }) => {
      await allure.feature('TodoMVC');
      await allure.story('Toggle All');
      await allure.severity('minor');
      await allure.owner('QA Team');

      await pages.todoPage.addTodos(['Task 1', 'Task 2', 'Task 3']);

      // Toggle all
      await pages.todoPage.toggleAllTodos();

      for (let i = 0; i < 3; i++) {
        const isCompleted = await pages.todoPage.isTodoCompleted(i);
        expect(isCompleted).toBeTruthy();
      }

      await pages.todoPage.takeScreenshot('All todos completed');

      // Toggle all again
      await pages.todoPage.toggleAllTodos();

      for (let i = 0; i < 3; i++) {
        const isCompleted = await pages.todoPage.isTodoCompleted(i);
        expect(isCompleted).toBeFalsy();
      }

      await pages.todoPage.takeScreenshot('All todos active');
    }
  );
});
