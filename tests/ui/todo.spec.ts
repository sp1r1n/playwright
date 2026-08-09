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

  test('should display empty state on initial load', { tag: '@smoke' }, async ({ pages }) => {
    await allure.feature('TodoMVC');
    await allure.story('Initial State');
    await allure.severity('critical');
    await allure.owner('QA Team');
    await allure.description('Verify that TodoMVC app displays correctly on initial load');

    // Verify input is visible
    const isVisible = await pages.todoPage.isNewTodoInputVisible();
    expect(isVisible).toBeTruthy();

    // Verify no todos initially
    await pages.todoPage.expectTodoCount(0);

    await pages.todoPage.takeScreenshot('TodoMVC Initial State');

    await attachment(
      'Initial State Info',
      `Input visible: ${isVisible}, starting URL: ${pages.todoPage.getCurrentUrl()}`,
      ContentType.TEXT
    );
  });

  test('should add a new todo item', { tag: ['@smoke', '@regression'] }, async ({ pages }) => {
    await allure.feature('TodoMVC');
    await allure.story('Add Todo');
    await allure.severity('blocker');
    await allure.owner('QA Team');
    await allure.epic('Todo Management');
    await allure.description('Verify that user can add a new todo item');

    const todoText = 'Buy groceries';

    await pages.todoPage.addTodo(todoText);

    await pages.todoPage.expectTodoCount(1);

    await pages.todoPage.verifyTodoText(0, todoText);

    await pages.todoPage.expectRemainingCount('1');

    await pages.todoPage.takeScreenshot('After adding todo');
  });

  test('should add multiple todo items', { tag: '@functional' }, async ({ pages }) => {
    await allure.feature('TodoMVC');
    await allure.story('Add Multiple Todos');
    await allure.severity('normal');
    await allure.owner('QA Team');

    const todos = ['Task 1', 'Task 2', 'Task 3'];

    await pages.todoPage.addTodos(todos);

    await pages.todoPage.expectTodoCount(3);

    await pages.todoPage.expectTodoTexts(todos);

    await pages.todoPage.takeScreenshot('Multiple todos added');
  });

  test('should toggle todo completion', { tag: '@regression' }, async ({ pages }) => {
    await allure.feature('TodoMVC');
    await allure.story('Toggle Todo');
    await allure.severity('critical');
    await allure.owner('QA Team');

    const todoText = 'Complete this task';

    await pages.todoPage.addTodo(todoText);
    await pages.todoPage.toggleTodo(0);

    const isCompleted = await pages.todoPage.isTodoCompleted(0);
    expect(isCompleted).toBeTruthy();

    await pages.todoPage.expectRemainingCount('0');

    await pages.todoPage.takeScreenshot('Todo completed');
  });

  test('should delete a todo item', { tag: '@regression' }, async ({ pages }) => {
    await allure.feature('TodoMVC');
    await allure.story('Delete Todo');
    await allure.severity('critical');
    await allure.owner('QA Team');

    const todos = ['Keep this', 'Delete this'];

    await pages.todoPage.addTodos(todos);
    await pages.todoPage.expectTodoCount(2);

    await pages.todoPage.deleteTodoByText('Delete this');

    await pages.todoPage.expectTodoCount(1);

    await pages.todoPage.expectTodoTexts(['Keep this']);

    await pages.todoPage.takeScreenshot('After deletion');
  });

  test('should edit a todo item', { tag: '@functional' }, async ({ pages }) => {
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
  });

  test('should filter todos by status', { tag: '@functional' }, async ({ pages }) => {
    await allure.feature('TodoMVC');
    await allure.story('Filter Todos');
    await allure.severity('normal');
    await allure.owner('QA Team');

    await pages.todoPage.addTodos(['Active task 1', 'Completed task', 'Active task 2']);
    await pages.todoPage.toggleTodoByText('Completed task');

    // Filter by active
    await pages.todoPage.filterByActive();
    await pages.todoPage.expectTodoCount(2);
    await pages.todoPage.takeScreenshot('Active filter');

    // Filter by completed
    await pages.todoPage.filterByCompleted();
    await pages.todoPage.expectTodoCount(1);
    await pages.todoPage.takeScreenshot('Completed filter');

    // Back to all — through the app's own filter, not a reload, so this still asserts
    // that filtering restores the full list rather than that the app reloads cleanly.
    await pages.todoPage.filterByAll();
    await pages.todoPage.expectTodoCount(3);
    await pages.todoPage.takeScreenshot('All todos');
  });

  test('should clear completed todos', { tag: '@functional' }, async ({ pages }) => {
    await allure.feature('TodoMVC');
    await allure.story('Clear Completed');
    await allure.severity('normal');
    await allure.owner('QA Team');

    await pages.todoPage.addTodos(['Task 1', 'Task 2', 'Task 3']);
    await pages.todoPage.toggleTodo(0);
    await pages.todoPage.toggleTodo(2);

    await pages.todoPage.clearCompletedTodos();

    await pages.todoPage.expectTodoCount(1);

    await pages.todoPage.expectTodoTexts(['Task 2']);

    await pages.todoPage.takeScreenshot('After clearing completed');
  });

  test('should toggle all todos at once', { tag: '@functional' }, async ({ pages }) => {
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
  });
});
