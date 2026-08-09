# Contributing

## Setup

```bash
npm ci
npm run install:browsers
cp .env.example .env   # optional; the defaults work as-is
```

## Before opening a pull request

```bash
npm run check   # types, lint, formatting
npm test
```

## Conventions

**Locators live in page objects, never in specs.** A spec that reaches for
`page.locator('.todo-list li')` moves the maintenance cost into every test that copies it.

**Prefer user-facing locators.** `getByRole`, `getByLabel` and `getByPlaceholder` survive
restyling; CSS class chains do not. `getByTestId` is the fallback when no accessible handle
exists.

**No manual waits.** Playwright's assertions retry on their own — `await expect(locator)
.toBeVisible()` rather than `waitForTimeout`. A fixed sleep is either too short on CI or too
long everywhere.

**Every public page-object method carries `@step`.** That is what turns the Allure report into
something readable by someone who did not write the test.

**Tag new tests.** `@smoke` for the handful that must pass before anything else is worth
running, `@regression` for the safety net, `@functional` for feature detail, `@negative` for
error paths.

**Set Allure metadata.** `feature`, `story` and `severity` are what make the report navigable
once there are more than a few dozen tests.

## Adding a test

1. Add the page object under `src/ui/pages/` (or the service under
   `src/api/<api-name>/services/`), and export it from the neighbouring `index.ts`.
2. Register the page on `Pages` in `src/ui/pages/Pages.ts`, or the service on the API
   aggregator, so fixtures expose it.
3. Write the spec in `tests/ui/` or `tests/api/`.

Import across directories through the path aliases — `@src/*`, `@api/*`, `@ui/*`, `@utils/*`,
`@fixtures/*` — and keep relative imports for siblings.

## Reporting a flake

Open a [flaky test issue](.github/ISSUE_TEMPLATE/flaky_test.yml) with the trace from
`test-results/`. Please do not add a retry to make it green; retries turn a known problem into
an unknown one.
