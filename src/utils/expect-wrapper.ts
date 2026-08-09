import { expect as baseExpect, test } from '@playwright/test';

/**
 * Mirrors what the proxy below does at runtime: every matcher becomes awaitable, because it
 * is now wrapped in `test.step`. Without this the types would claim the matchers are
 * synchronous and `await expectWithStep(x).toBe(y)` would look like a mistake.
 */
type Awaitable<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : T[K] extends object
      ? Awaitable<T[K]>
      : T[K];
};

/** Renders matcher arguments for the default step name. */
function formatArgs(args: unknown[]): string {
  return args
    .map(arg => {
      try {
        return JSON.stringify(arg);
      } catch {
        // Circular structures and the like still deserve a readable step name.
        return String(arg);
      }
    })
    .join(', ');
}

/**
 * Wraps every matcher call in `test.step`, recursing through modifier objects so
 * `.not`, `.resolves` and `.rejects` stay usable.
 */
function wrapWithStep<T extends object>(
  expectInstance: T,
  path: string[] = [],
  message?: string
): Awaitable<T> {
  return new Proxy(expectInstance, {
    get(target, prop, receiver) {
      const original: unknown = Reflect.get(target, prop, receiver);
      const newPath = [...path, String(prop)];

      if (typeof original === 'function') {
        return async (...args: unknown[]) => {
          const stepName = message ?? `expect.${newPath.join('.')}(${formatArgs(args)})`;
          return test.step(stepName, () =>
            (original as (...a: unknown[]) => unknown).apply(target, args)
          );
        };
      }

      if (typeof original === 'object' && original !== null) {
        return wrapWithStep(original, newPath, message);
      }

      return original;
    },
  }) as Awaitable<T>;
}

// Bound rather than referenced: these are handed out as standalone functions, and an
// unbound method would lose `expect` as its receiver.
const matcherHelpers = {
  arrayContaining: baseExpect.arrayContaining.bind(baseExpect),
  objectContaining: baseExpect.objectContaining.bind(baseExpect),
  any: baseExpect.any.bind(baseExpect),
  stringContaining: baseExpect.stringContaining.bind(baseExpect),
  stringMatching: baseExpect.stringMatching.bind(baseExpect),
};

/**
 * `expect` with every matcher reported as its own Allure step.
 *
 * The step name carries the compared values, so a failure in the report names the assertion
 * rather than just the test.
 *
 * ```ts
 * await expectWithStep(response.status(), 'Status should be 200').toBe(200);
 * ```
 */
export const expectWithStep = Object.assign(
  <T>(actual: T, message?: string) => wrapWithStep(baseExpect(actual, message), [], message),
  matcherHelpers
);

/**
 * The soft variant: a failure is recorded and the test keeps going, so one run reports every
 * mismatched field instead of only the first.
 *
 * ```ts
 * await softExpectWithStep(user.email, 'Email should match').toBe(expected);
 * ```
 */
export const softExpectWithStep = Object.assign(
  <T>(actual: T, message?: string) => wrapWithStep(baseExpect.soft(actual, message), [], message),
  matcherHelpers
);
