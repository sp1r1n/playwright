import { APIResponse } from '@playwright/test';
import { ApiClient } from '@api/core/api-client';
import { step } from '@utils/decorators';
import { userSchema, usersArraySchema, postsArraySchema } from '../models';

/**
 * Users Service for JSONPlaceholder API
 * Handles all user-related API operations
 */
export class UsersService {
  constructor(private apiClient: ApiClient) {}

  @step('Get all users')
  async getUsers(validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.get('/users', usersArraySchema, {}, validate);
  }

  @step('Get user by ID: {0}')
  async getUserById(id: number, validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.get(`/users/${id}`, userSchema, {}, validate);
  }

  @step('Get user posts: {0}')
  async getUserPosts(userId: number, validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.get(`/users/${userId}/posts`, postsArraySchema, {}, validate);
  }

  @step('Get user todos: {0}')
  async getUserTodos(userId: number, validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.get(`/users/${userId}/todos`, undefined, {}, validate);
  }

  @step('Get user albums: {0}')
  async getUserAlbums(userId: number, validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.get(`/users/${userId}/albums`, undefined, {}, validate);
  }
}
