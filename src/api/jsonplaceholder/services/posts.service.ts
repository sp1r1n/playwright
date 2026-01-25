import { APIResponse } from '@playwright/test';
import { ApiClient } from '../../core/api-client';
import { step } from '../../../utils/decorators';
import { postSchema, postsArraySchema, createPostResponseSchema, CreatePostPayload, UpdatePostPayload } from '../models';

/**
 * Posts Service for JSONPlaceholder API
 * Handles all post-related API operations
 */
export class PostsService {
  constructor(private apiClient: ApiClient) {}

  @step('Get all posts')
  async getPosts(validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.get('/posts', postsArraySchema, {}, validate);
  }

  @step('Get post by ID: {0}')
  async getPostById(id: number, validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.get(`/posts/${id}`, postSchema, {}, validate);
  }

  @step('Get posts by user ID: {0}')
  async getPostsByUserId(userId: number, validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.get('/posts', postsArraySchema, { params: { userId } }, validate);
  }

  @step('Create new post')
  async createPost(payload: CreatePostPayload, validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.post('/posts', createPostResponseSchema, { data: payload }, validate);
  }

  @step('Update post: {0}')
  async updatePost(id: number, payload: UpdatePostPayload, validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.put(`/posts/${id}`, postSchema, { data: payload }, validate);
  }

  @step('Patch post: {0}')
  async patchPost(id: number, payload: Partial<UpdatePostPayload>, validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.patch(`/posts/${id}`, postSchema, { data: payload }, validate);
  }

  @step('Delete post: {0}')
  async deletePost(id: number, validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.delete(`/posts/${id}`, undefined, {}, validate);
  }

  @step('Get post comments: {0}')
  async getPostComments(postId: number, validate: boolean = false): Promise<APIResponse> {
    return await this.apiClient.get(`/posts/${postId}/comments`, undefined, {}, validate);
  }
}
