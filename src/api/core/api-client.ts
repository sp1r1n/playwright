import { APIRequestContext, APIResponse } from '@playwright/test';
import { ZodType, ZodError } from 'zod';
import { LogRequest } from '../../utils/decorators';

/**
 * Request options for API calls
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  form?: FormData | Record<string, string | number>;
  multipart?: FormData | Record<string, unknown>;
  timeout?: number;
  failOnStatusCode?: boolean;
}

/**
 * Zod validation error with additional context
 */
export class ZodValidationError extends Error {
  constructor(
    public readonly zodError: ZodError,
    public readonly context: { title: string; details: unknown }
  ) {
    super(`Schema validation failed: ${zodError.message}`);
    this.name = 'ZodValidationError';
  }
}

/**
 * Core API Client
 * Wraps Playwright's APIRequestContext with logging and validation
 */
export class ApiClient {
  constructor(private context: APIRequestContext) {}

  /**
   * Get the underlying APIRequestContext
   */
  getContext(): APIRequestContext {
    return this.context;
  }

  @LogRequest
  async get(url: string, schema?: ZodType, options?: RequestOptions, validate: boolean = false): Promise<APIResponse> {
    const response = await this.context.get(url, this.mapOptions(options));
    await this.validateResponse(url, schema, response, validate);
    return response;
  }

  @LogRequest
  async post(url: string, schema?: ZodType, options?: RequestOptions, validate: boolean = false): Promise<APIResponse> {
    const response = await this.context.post(url, this.mapOptions(options));
    await this.validateResponse(url, schema, response, validate);
    return response;
  }

  @LogRequest
  async put(url: string, schema?: ZodType, options?: RequestOptions, validate: boolean = false): Promise<APIResponse> {
    const response = await this.context.put(url, this.mapOptions(options));
    await this.validateResponse(url, schema, response, validate);
    return response;
  }

  @LogRequest
  async patch(
    url: string,
    schema?: ZodType,
    options?: RequestOptions,
    validate: boolean = false
  ): Promise<APIResponse> {
    const response = await this.context.patch(url, this.mapOptions(options));
    await this.validateResponse(url, schema, response, validate);
    return response;
  }

  @LogRequest
  async delete(
    url: string,
    schema?: ZodType,
    options?: RequestOptions,
    validate: boolean = false
  ): Promise<APIResponse> {
    const response = await this.context.delete(url, this.mapOptions(options));
    await this.validateResponse(url, schema, response, validate);
    return response;
  }

  @LogRequest
  async head(url: string, schema?: ZodType, options?: RequestOptions, validate: boolean = false): Promise<APIResponse> {
    const response = await this.context.head(url, this.mapOptions(options));
    await this.validateResponse(url, schema, response, validate);
    return response;
  }

  /**
   * Map our options to Playwright's request options
   */
  private mapOptions(options?: RequestOptions) {
    if (!options) return undefined;

    return {
      headers: options.headers,
      params: options.params,
      data: options.data,
      form: options.form,
      multipart: options.multipart,
      timeout: options.timeout,
      failOnStatusCode: options.failOnStatusCode,
    };
  }

  /**
   * Validate response against Zod schema
   */
  private async validateResponse(
    url: string,
    schema: ZodType | undefined,
    response: APIResponse,
    validate: boolean = false
  ): Promise<void> {
    if (validate) {
      if (!schema) {
        throw new Error(`Schema is required for validation of ${url}`);
      }

      const body = await response.json();

      try {
        await schema.parseAsync(body);
      } catch (error) {
        if (error instanceof ZodError) {
          throw new ZodValidationError(error, { title: 'Validated Response', details: body });
        }
        throw error;
      }
    }
  }
}
