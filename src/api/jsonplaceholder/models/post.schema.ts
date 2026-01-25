import { z } from 'zod';

/**
 * Post schema for JSONPlaceholder API
 */
export const postSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  body: z.string(),
});

export const postsArraySchema = z.array(postSchema);

export const createPostResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  body: z.string(),
});

/**
 * Types inferred from schemas
 */
export type Post = z.infer<typeof postSchema>;
export type CreatePostResponse = z.infer<typeof createPostResponseSchema>;

/**
 * Request payload types
 */
export interface CreatePostPayload {
  userId: number;
  title: string;
  body: string;
}

export interface UpdatePostPayload {
  id?: number;
  userId?: number;
  title?: string;
  body?: string;
}
