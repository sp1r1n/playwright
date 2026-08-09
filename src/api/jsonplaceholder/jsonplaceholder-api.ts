import { APIRequestContext } from '@playwright/test';
import { ApiClient } from '@api/core/api-client';
import { PostsService } from './services/posts.service';
import { UsersService } from './services/users.service';
import { step } from '@utils/decorators';

/**
 * JSONPlaceholder API Client
 * Aggregates all services for the JSONPlaceholder demo API
 *
 * Usage:
 * const api = new JsonPlaceholderApi(request);
 * const posts = await api.posts.getPosts();
 * const user = await api.users.getUserById(1);
 */
export class JsonPlaceholderApi {
  private apiClient: ApiClient;

  // Services
  public readonly posts: PostsService;
  public readonly users: UsersService;

  constructor(request: APIRequestContext) {
    this.apiClient = new ApiClient(request);
    this.posts = new PostsService(this.apiClient);
    this.users = new UsersService(this.apiClient);
  }

  /**
   * Get the underlying API client for custom requests
   */
  getApiClient(): ApiClient {
    return this.apiClient;
  }

  /**
   * Make a raw GET request
   */
  @step('GET {0}')
  async get(url: string) {
    return this.apiClient.get(url);
  }

  /**
   * Make a raw POST request
   */
  @step('POST {0}')
  async post(url: string, data?: unknown) {
    return this.apiClient.post(url, undefined, { data });
  }
}
