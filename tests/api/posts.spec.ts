import { apiTest as test, expect } from '../fixtures';
import { Post, CreatePostPayload } from '@src/api';
import { softExpectWithStep } from '@src/utils';
import { allure } from 'allure-playwright';

/**
 * Posts API Tests
 * Demonstrates API testing with service-based architecture
 */
test.describe('Posts API', () => {
  test('GET /posts - should return list of posts', { tag: '@smoke' }, async ({ api }) => {
    await allure.feature('Posts API');
    await allure.story('Get Posts');
    await allure.severity('blocker');
    await allure.owner('API Team');

    const response = await api.posts.getPosts();
    const posts = (await response.json()) as Post[];

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
    expect(Array.isArray(posts)).toBeTruthy();
    expect(posts.length).toBeGreaterThan(0);

    // Verify post structure
    const firstPost = posts[0];
    await softExpectWithStep(firstPost, 'First post should have id').toHaveProperty('id');
    await softExpectWithStep(firstPost, 'First post should have userId').toHaveProperty('userId');
    await softExpectWithStep(firstPost, 'First post should have title').toHaveProperty('title');
    await softExpectWithStep(firstPost, 'First post should have body').toHaveProperty('body');
  });

  test('GET /posts/:id - should return single post', { tag: '@regression' }, async ({ api }) => {
    await allure.feature('Posts API');
    await allure.story('Get Single Post');
    await allure.severity('critical');

    const postId = 1;
    const response = await api.posts.getPostById(postId);
    const post = (await response.json()) as Post;

    expect(response.status()).toBe(200);
    expect(post.id).toBe(postId);
    expect(typeof post.title).toBe('string');
    expect(typeof post.body).toBe('string');
  });

  test('GET /posts - should filter posts by userId', { tag: '@functional' }, async ({ api }) => {
    await allure.feature('Posts API');
    await allure.story('Filter Posts');
    await allure.severity('normal');

    const userId = 1;
    const response = await api.posts.getPostsByUserId(userId);
    const posts = (await response.json()) as Post[];

    expect(response.status()).toBe(200);
    expect(posts.length).toBeGreaterThan(0);

    // Verify all posts belong to specified user
    posts.forEach(post => {
      expect(post.userId).toBe(userId);
    });
  });

  test('POST /posts - should create a new post', { tag: '@smoke' }, async ({ api }) => {
    await allure.feature('Posts API');
    await allure.story('Create Post');
    await allure.severity('blocker');
    await allure.description('Verify POST /posts creates a new post and returns it');

    const newPost: CreatePostPayload = {
      userId: 1,
      title: 'Test Post Title',
      body: 'This is a test post body content.',
    };

    const response = await api.posts.createPost(newPost);
    const createdPost = (await response.json()) as Post;

    expect(response.status()).toBe(201);
    expect(createdPost.title).toBe(newPost.title);
    expect(createdPost.body).toBe(newPost.body);
    expect(createdPost.userId).toBe(newPost.userId);
    expect(createdPost.id).toBeDefined();
  });

  test('PUT /posts/:id - should update entire post', { tag: '@regression' }, async ({ api }) => {
    await allure.feature('Posts API');
    await allure.story('Update Post');
    await allure.severity('critical');

    const postId = 1;
    const updatedPost = {
      id: postId,
      userId: 1,
      title: 'Updated Title',
      body: 'Updated body content',
    };

    const response = await api.posts.updatePost(postId, updatedPost);
    const post = (await response.json()) as Post;

    expect(response.status()).toBe(200);
    expect(post.id).toBe(postId);
    expect(post.title).toBe(updatedPost.title);
    expect(post.body).toBe(updatedPost.body);
  });

  test(
    'PATCH /posts/:id - should partially update post',
    { tag: '@functional' },
    async ({ api }) => {
      await allure.feature('Posts API');
      await allure.story('Partial Update');
      await allure.severity('normal');

      const postId = 1;
      const partialUpdate = {
        title: 'Patched Title Only',
      };

      const response = await api.posts.patchPost(postId, partialUpdate);
      const post = (await response.json()) as Post;

      expect(response.status()).toBe(200);
      expect(post.id).toBe(postId);
      expect(post.title).toBe(partialUpdate.title);
      expect(post.body).toBeDefined();
    }
  );

  test('DELETE /posts/:id - should delete post', { tag: '@regression' }, async ({ api }) => {
    await allure.feature('Posts API');
    await allure.story('Delete Post');
    await allure.severity('critical');

    const postId = 1;
    const response = await api.posts.deletePost(postId);

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
  });

  test(
    'GET /posts/:id - should return 404 for non-existent post',
    { tag: '@negative' },
    async ({ api }) => {
      await allure.feature('Posts API');
      await allure.story('Error Handling');
      await allure.severity('normal');

      const nonExistentId = 999999;
      const response = await api.posts.getPostById(nonExistentId);

      // JSONPlaceholder returns 404 for non-existent resources
      expect(response.status()).toBe(404);
    }
  );
});
