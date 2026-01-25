import { expect as baseExpect, test } from '@playwright/test';

type ExpectType = ReturnType<typeof baseExpect>;
type SoftExpectType = ReturnType<typeof baseExpect.soft>;

/**
 * Converts an array of arguments to a readable string
 * for using in default expect message
 */
function formatArgs(args: unknown[]): string {
  return args
    .map(arg => {
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(', ');
}

/**
 * Wrapper for expect() with test.step()
 * Wraps all matcher calls in test.step for better Allure reporting
 */
function wrapWithStep<T extends ExpectType | SoftExpectType>(
  expectInstance: T,
  path: string[] = [],
  message?: string
): T {
  return new Proxy(expectInstance, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);
      const newPath = [...path, String(prop)];

      if (typeof original === 'function') {
        return async (...args: unknown[]) => {
          const argsString = formatArgs(args);
          const stepName = message ?? `expect.${newPath.join('.')}(${argsString})`;

          return await test.step(stepName, async () => {
            return await original.apply(target, args);
          });
        };
      }

      if (typeof original === 'object' && original !== null) {
        return wrapWithStep(original as T, newPath, message);
      }

      return original;
    },
  }) as T;
}

/**
 * expect() with automatic test.step() wrapping
 * All matchers are wrapped in steps for better Allure reporting
 *
 * Usage:
 * await expectWithStep(response.status, 'Status should be 200').toBe(200);
 */
export const expectWithStep = Object.assign(
  <T>(actual: T, message?: string) => {
    return wrapWithStep(baseExpect(actual, message), [], message);
  },
  {
    arrayContaining: baseExpect.arrayContaining,
    objectContaining: baseExpect.objectContaining,
    any: baseExpect.any,
    stringContaining: baseExpect.stringContaining,
    stringMatching: baseExpect.stringMatching,
  }
);

/**
 * expect.soft() with automatic test.step() wrapping
 * Soft assertions don't stop test execution on failure
 *
 * Usage:
 * await softExpectWithStep(user.email, 'Email should match').toBe(expected);
 */
export const softExpectWithStep = Object.assign(
  <T>(actual: T, message?: string) => {
    return wrapWithStep(baseExpect.soft(actual, message), [], message);
  },
  {
    arrayContaining: baseExpect.arrayContaining,
    objectContaining: baseExpect.objectContaining,
    any: baseExpect.any,
    stringContaining: baseExpect.stringContaining,
    stringMatching: baseExpect.stringMatching,
  }
);
