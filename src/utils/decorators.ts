import { test, APIResponse } from '@playwright/test';
import { ContentType, attachment } from 'allure-js-commons';

/**
 * Replace argument placeholders in step name string
 * Example: replaceArgs('Get user {0}', 123) -> 'Get user 123'
 */
const replaceArgs = (strValue: string, ...params: Array<unknown>): string => {
  let str = strValue;
  params.forEach((param, index) => {
    str = str.replace(`{${index}}`, JSON.stringify(param));
  });
  return str;
};

/**
 * Step decorator for class methods
 * Wraps method execution in test.step for Allure reporting
 *
 * Usage:
 * @step('Click button {0}')
 * async clickButton(name: string) { ... }
 *
 * @step((id) => `Get user with id ${id}`)
 * async getUser(id: number) { ... }
 *
 * @step() // Uses default: ClassName.methodName
 * async doSomething() { ... }
 */
export function step(stepName?: string | ((...args: unknown[]) => string)) {
  return function decorator<T extends { constructor: { name: string } }>(
    target: (this: T, ...args: unknown[]) => Promise<unknown>,
    context: ClassMethodDecoratorContext
  ) {
    return async function replacementMethod(this: T, ...args: unknown[]) {
      const stepNameFinal =
        typeof stepName === 'function'
          ? stepName(...args)
          : stepName ?? `${this.constructor.name}.${String(context.name)}`;

      return await test.step(replaceArgs(stepNameFinal, ...args), async () => target.call(this, ...args), {
        box: true,
      });
    };
  };
}

/**
 * LogRequest decorator for API client methods
 * Automatically logs request/response details to Allure
 */
export function LogRequest<T extends (...args: unknown[]) => Promise<APIResponse>>(
  target: T,
  context: ClassMethodDecoratorContext
) {
  const originalMethod = target;
  const requestMethod = context.name.toString().toUpperCase();

  return async function (this: unknown, url: string, ...restArgs: unknown[]) {
    return await test.step(`${requestMethod} - ${url}`, async () => {
      const response: APIResponse = await originalMethod.call(this, url, ...restArgs);

      const request = `[API REQUEST] ${requestMethod} ${response.url()}`;
      const status = `[API RESPONSE] Status: ${response.status()}`;
      const responseHeaders = `[API RESPONSE HEADERS]\n${JSON.stringify(response.headers(), null, 2)}`;

      let responseBody = '';
      try {
        const body = await response.json();
        responseBody = `[API RESPONSE BODY]\n${JSON.stringify(body, null, 2)}`;
      } catch {
        // Response might not be JSON
      }

      const logMessage = `${request}\n${status}\n${responseHeaders}\n${responseBody}`;
      await attachment(`${requestMethod} ${url}`, logMessage, ContentType.TEXT);

      return response;
    });
  };
}
