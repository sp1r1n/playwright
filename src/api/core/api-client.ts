import { APIRequestContext, APIResponse } from '@playwright/test';
import { ZodType, ZodError } from 'zod';
import { LogRequest } from '@utils/decorators';

/**
 * Options accepted by every request method.
 *
 * Derived from Playwright's own signature rather than hand-written, so the two cannot drift
 * apart on a version bump. The `Pick` narrows it to the options this client supports.
 */
export type RequestOptions = Pick<
  NonNullable<Parameters<APIRequestContext['get']>[1]>,
  'headers' | 'params' | 'data' | 'form' | 'multipart' | 'timeout' | 'failOnStatusCode'
>;

/**
 * Raised when a response does not match its Zod schema. Carries the parsed body alongside the
 * Zod error, because "expected string, received number at posts[3].title" is only actionable
 * next to the payload it came from.
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
 * Thin wrapper over Playwright's `APIRequestContext` adding two things: every call is logged
 * into the Allure report by `@LogRequest`, and any response can be validated against a Zod
 * schema.
 *
 * Validation is opt-in per call. Contract checks belong in the tests that are about the
 * contract; forcing them on every request would make an unrelated test fail for an unrelated
 * reason.
 */
export class ApiClient {
  constructor(private context: APIRequestContext) {}

  /** Escape hatch for requests this wrapper does not model. */
  getContext(): APIRequestContext {
    return this.context;
  }

  @LogRequest
  async get(
    url: string,
    schema?: ZodType,
    options?: RequestOptions,
    validate = false
  ): Promise<APIResponse> {
    const response = await this.context.get(url, options);
    await this.validateResponse(url, schema, response, validate);
    return response;
  }

  @LogRequest
  async post(
    url: string,
    schema?: ZodType,
    options?: RequestOptions,
    validate = false
  ): Promise<APIResponse> {
    const response = await this.context.post(url, options);
    await this.validateResponse(url, schema, response, validate);
    return response;
  }

  @LogRequest
  async put(
    url: string,
    schema?: ZodType,
    options?: RequestOptions,
    validate = false
  ): Promise<APIResponse> {
    const response = await this.context.put(url, options);
    await this.validateResponse(url, schema, response, validate);
    return response;
  }

  @LogRequest
  async patch(
    url: string,
    schema?: ZodType,
    options?: RequestOptions,
    validate = false
  ): Promise<APIResponse> {
    const response = await this.context.patch(url, options);
    await this.validateResponse(url, schema, response, validate);
    return response;
  }

  @LogRequest
  async delete(
    url: string,
    schema?: ZodType,
    options?: RequestOptions,
    validate = false
  ): Promise<APIResponse> {
    const response = await this.context.delete(url, options);
    await this.validateResponse(url, schema, response, validate);
    return response;
  }

  @LogRequest
  async head(
    url: string,
    schema?: ZodType,
    options?: RequestOptions,
    validate = false
  ): Promise<APIResponse> {
    const response = await this.context.head(url, options);
    await this.validateResponse(url, schema, response, validate);
    return response;
  }

  private async validateResponse(
    url: string,
    schema: ZodType | undefined,
    response: APIResponse,
    validate: boolean
  ): Promise<void> {
    if (!validate) {
      return;
    }
    if (!schema) {
      throw new Error(`Schema is required for validation of ${url}`);
    }

    const body: unknown = await response.json();

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
