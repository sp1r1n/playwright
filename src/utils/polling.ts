import { APIResponse } from '@playwright/test';

type Predicate<T> = (item: T) => boolean;

/**
 * Polling utility for waiting on async conditions
 * Useful for waiting on API responses or state changes
 *
 * Usage:
 * const result = await new Polling<User>(() => api.getUser(userId))
 *   .pollingEvery(2000)
 *   .withTimeout(30000)
 *   .withMessage('User not found')
 *   .until(user => user.status === 'active');
 */
export class Polling<T> {
  private readonly call: () => Promise<APIResponse>;
  private timeout: number = 30000;
  private interval: number = 1000;
  private message: string = '';

  constructor(call: () => Promise<APIResponse>) {
    this.call = call;
  }

  /**
   * Set maximum wait time in milliseconds
   */
  public withTimeout(timeout: number): Polling<T> {
    this.timeout = timeout;
    return this;
  }

  /**
   * Set polling interval in milliseconds
   */
  public pollingEvery(interval: number): Polling<T> {
    this.interval = interval;
    return this;
  }

  /**
   * Set error message if condition is not met
   */
  public withMessage(message: string): Polling<T> {
    this.message = message;
    return this;
  }

  /**
   * Poll until condition is met or timeout is reached
   */
  public async until(condition: Predicate<T>): Promise<T> {
    const startTime = Date.now();

    const response = await this.call();
    let result: T = (await response.json()) as T;

    while (!condition(result) && Date.now() - startTime < this.timeout) {
      await new Promise(resolve => setTimeout(resolve, this.interval));
      const newResponse = await this.call();
      result = (await newResponse.json()) as T;
    }

    if (!condition(result)) {
      const errorMessage =
        this.message || `Condition not met: [${condition.toString()}] in ${this.timeout} ms`;
      throw new Error(errorMessage);
    }

    return result;
  }
}

/**
 * Simple wait utility
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry utility for flaky operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, onRetry } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (onRetry) {
        onRetry(lastError, attempt);
      }
      if (attempt < retries) {
        await wait(delay);
      }
    }
  }

  // The loop only exits here after a throw, so lastError is always set; the fallback
  // keeps the type honest rather than asserting it away.
  throw lastError ?? new Error('retry() exhausted its attempts without capturing an error');
}
