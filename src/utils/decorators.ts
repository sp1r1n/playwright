import { test, APIResponse } from '@playwright/test';
import { ContentType, attachment } from 'allure-js-commons';

/**
 * Substitutes positional placeholders in a step name.
 *
 * `replaceArgs('Get user {0}', 123)` produces `Get user 123`.
 */
const replaceArgs = (template: string, ...params: unknown[]): string =>
  params.reduce<string>(
    (result, param, index) => result.replace(`{${index}}`, JSON.stringify(param) ?? String(param)),
    template
  );

/**
 * Wraps a method in `test.step`, so the Allure report shows the page object's own vocabulary
 * ("Add todo: Buy milk") instead of a flat list of clicks and fills.
 *
 * These are TC39 standard decorators, not the legacy `experimentalDecorators` proposal — see
 * the note in `tsconfig.json`. The generics sit on the inner function so that each decoration
 * site keeps the method's real parameter and return types.
 *
 * ```ts
 * @step('Click button {0}')
 * async clickButton(name: string) { … }
 *
 * @step() // falls back to ClassName.methodName
 * async doSomething() { … }
 * ```
 */
export function step(stepName?: string | ((...args: unknown[]) => string)) {
  return function decorator<This, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Promise<Return>,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>
  ) {
    return async function replacementMethod(this: This, ...args: Args): Promise<Return> {
      const className = (this as { constructor: { name: string } }).constructor.name;
      const resolved =
        typeof stepName === 'function'
          ? stepName(...args)
          : (stepName ?? `${className}.${String(context.name)}`);

      // `box: true` collapses the wrapper frame, so a failure points at the caller's line
      // rather than at this file.
      return test.step(replaceArgs(resolved, ...args), () => target.call(this, ...args), {
        box: true,
      });
    };
  };
}

/**
 * Attaches the full request and response of an API call to the Allure report.
 *
 * Applied to `ApiClient` methods, whose first argument is always the URL.
 */
export function LogRequest<
  This,
  Args extends [url: string, ...rest: unknown[]],
  Return extends APIResponse,
>(
  target: (this: This, ...args: Args) => Promise<Return>,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>
) {
  const method = String(context.name).toUpperCase();

  return async function replacementMethod(this: This, ...args: Args): Promise<Return> {
    const [url] = args;

    return test.step(`${method} - ${url}`, async () => {
      const response = await target.call(this, ...args);

      const lines = [
        `[API REQUEST] ${method} ${response.url()}`,
        `[API RESPONSE] Status: ${response.status()}`,
        `[API RESPONSE HEADERS]\n${JSON.stringify(response.headers(), null, 2)}`,
      ];

      try {
        lines.push(`[API RESPONSE BODY]\n${JSON.stringify(await response.json(), null, 2)}`);
      } catch {
        // Not every response is JSON; the status and headers above are still worth attaching.
      }

      await attachment(`${method} ${url}`, lines.join('\n'), ContentType.TEXT);
      return response;
    });
  };
}
