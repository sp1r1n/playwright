import { apiTest as test, expect } from '../fixtures';
import { User, Post } from '@src/api';
import { softExpectWithStep } from '@src/utils';
import { allure } from 'allure-playwright';

/**
 * Users API Tests
 * Demonstrates API testing with service-based architecture
 */
test.describe('Users API', () => {
  test('GET /users - should return list of users', { tag: '@smoke' }, async ({ api }) => {
    await allure.feature('Users API');
    await allure.story('Get Users');
    await allure.severity('blocker');
    await allure.owner('API Team');

    const response = await api.users.getUsers();
    const users = (await response.json()) as User[];

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);

    // Verify user structure
    const firstUser = users[0];
    await softExpectWithStep(firstUser, 'User should have id').toHaveProperty('id');
    await softExpectWithStep(firstUser, 'User should have name').toHaveProperty('name');
    await softExpectWithStep(firstUser, 'User should have email').toHaveProperty('email');
    await softExpectWithStep(firstUser, 'User should have username').toHaveProperty('username');
    await softExpectWithStep(firstUser, 'User should have address').toHaveProperty('address');
    await softExpectWithStep(firstUser, 'User should have company').toHaveProperty('company');
  });

  test('GET /users/:id - should return user details', { tag: '@regression' }, async ({ api }) => {
    await allure.feature('Users API');
    await allure.story('Get User Details');
    await allure.severity('critical');
    await allure.owner('API Team');

    const userId = 1;
    const response = await api.users.getUserById(userId);
    const user = (await response.json()) as User;

    expect(response.status()).toBe(200);
    expect(user.id).toBe(userId);
    expect(user.email).toContain('@');

    // Verify nested objects
    expect(user.address).toHaveProperty('street');
    expect(user.address).toHaveProperty('city');
    expect(user.address.geo).toHaveProperty('lat');
    expect(user.address.geo).toHaveProperty('lng');

    expect(user.company).toHaveProperty('name');
    expect(user.company).toHaveProperty('catchPhrase');
  });

  test(
    'GET /users/:id/posts - should return user posts',
    { tag: '@functional' },
    async ({ api }) => {
      await allure.feature('Users API');
      await allure.story('User Posts');
      await allure.severity('normal');
      await allure.owner('API Team');

      const userId = 1;
      const response = await api.users.getUserPosts(userId);
      const posts = (await response.json()) as Post[];

      expect(response.status()).toBe(200);
      expect(Array.isArray(posts)).toBeTruthy();

      // All posts should belong to the user
      posts.forEach(post => {
        expect(post.userId).toBe(userId);
      });
    }
  );
});
