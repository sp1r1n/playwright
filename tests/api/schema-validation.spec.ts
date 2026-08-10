import { apiTest as test, expect } from '../fixtures';
import { ZodValidationError } from '@src/api';
import { allure } from 'allure-playwright';
import { z } from 'zod';

/**
 * Exercises the `validate` flag on the API client.
 *
 * The rest of the suite calls the services without it, which left the whole Zod layer
 * untested — a schema could stop matching, or the validation path could throw, and every
 * test would still pass. These tests are the ones that fail when the contract moves.
 */
test.describe('Response schema validation', () => {
  test(
    'GET /posts/:id - response matches the post schema',
    { tag: ['@smoke', '@contract'] },
    async ({ api }) => {
      await allure.feature('Contract');
      await allure.story('Post schema');
      await allure.severity('critical');
      await allure.description(
        'Parses the live response through postSchema. Fails if the API drops a field or changes a type.'
      );

      const response = await api.posts.getPostById(1, true);

      expect(response.status()).toBe(200);
    }
  );

  test(
    'GET /posts - every item in the collection matches the schema',
    { tag: '@contract' },
    async ({ api }) => {
      await allure.feature('Contract');
      await allure.story('Post schema');
      await allure.severity('normal');

      const response = await api.posts.getPosts(true);

      expect(response.status()).toBe(200);
    }
  );

  test(
    'GET /users/:id - response matches the user schema, nested objects included',
    { tag: ['@smoke', '@contract'] },
    async ({ api }) => {
      await allure.feature('Contract');
      await allure.story('User schema');
      await allure.severity('critical');
      await allure.description(
        'userSchema covers address.geo and company, so this also pins down the nested shapes.'
      );

      const response = await api.users.getUserById(1, true);

      expect(response.status()).toBe(200);
    }
  );

  test(
    'a mismatched schema raises ZodValidationError carrying the payload',
    { tag: ['@negative', '@contract'] },
    async ({ api }) => {
      await allure.feature('Contract');
      await allure.story('Validation failures');
      await allure.severity('normal');
      await allure.description(
        'Guards the failure path itself: without this, validation could silently never run and every ' +
          'positive test above would still be green.'
      );

      // Deliberately wrong: the live response has `title` as a string.
      const wrongSchema = z.object({ id: z.number(), title: z.number() });

      const failure = api
        .getApiClient()
        .get('/posts/1', wrongSchema, {}, true)
        .catch((error: unknown) => error);

      const error = await failure;

      expect(error).toBeInstanceOf(ZodValidationError);
      const validationError = error as ZodValidationError;
      expect(validationError.message).toContain('Schema validation failed');
      expect(validationError.context.details).toHaveProperty('title');
    }
  );

  test(
    'asking for validation without a schema is an error, not a silent pass',
    { tag: ['@negative', '@contract'] },
    async ({ api }) => {
      await allure.feature('Contract');
      await allure.story('Validation failures');
      await allure.severity('minor');

      await expect(api.getApiClient().get('/posts/1', undefined, {}, true)).rejects.toThrow(
        'Schema is required for validation of /posts/1'
      );
    }
  );
});
