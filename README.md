# Playwright E2E Testing Framework

A comprehensive end-to-end testing framework built with Playwright, TypeScript, and Allure reporting. Features automatic GitHub Pages deployment for test reports.

## 🚀 Features

- **Playwright Test** - Modern E2E testing framework
- **TypeScript** - Type-safe test development
- **Allure Reporting** - Beautiful, interactive test reports
- **GitHub Pages** - Automatic report deployment
- **Page Object Pattern** - Maintainable test architecture
- **API Testing** - Built-in API client wrapper
- **ESLint + Prettier** - Code quality and formatting
- **CI/CD Ready** - GitHub Actions workflow included

## 📁 Project Structure

```
playwright/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions workflow
├── api/
│   ├── client/
│   │   ├── api-client.ts       # API client wrapper
│   │   └── index.ts
│   ├── models/
│   │   ├── post.model.ts       # API response models
│   │   ├── user.model.ts
│   │   └── index.ts
│   └── index.ts
├── config/
│   ├── env.config.ts           # Environment configuration
│   └── index.ts
├── fixtures/
│   ├── test.fixture.ts         # Custom test fixtures
│   └── index.ts
├── pages/
│   ├── base.page.ts            # Base page object
│   ├── google.page.ts          # Google search page object
│   └── index.ts
├── tests/
│   ├── api/
│   │   ├── posts.spec.ts       # API tests for posts
│   │   └── users.spec.ts       # API tests for users
│   └── ui/
│       └── google-search.spec.ts # UI tests
├── utils/
│   ├── allure-helper.ts        # Allure utilities
│   ├── data-generator.ts       # Test data generators
│   └── index.ts
├── .eslintrc.json              # ESLint configuration
├── .gitignore
├── .prettierrc                 # Prettier configuration
├── .prettierignore
├── env.example                 # Environment variables template
├── package.json
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json               # TypeScript configuration
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playwright
   ```

2. **Install dependencies**
   ```bash
   npm ci
   # or
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install --with-deps
   # or install specific browser
   npx playwright install chromium --with-deps
   ```

4. **Configure environment** (optional)
   ```bash
   cp env.example .env
   # Edit .env with your settings
   ```

## 🧪 Running Tests

### All Tests
```bash
npm test
```

### UI Tests Only
```bash
npm run test:ui
```

### API Tests Only
```bash
npm run test:api
```

### Headed Mode (with browser UI)
```bash
npm run test:headed
```

### Debug Mode
```bash
npm run test:debug
```

### CI Mode (with Allure reporter)
```bash
npm run test:ci
```

## 📊 Allure Reporting

### Generate Report
```bash
npm run allure:generate
```

### Open Report in Browser
```bash
npm run allure:open
```

### Serve Report (generate + open)
```bash
npm run allure:serve
```

## 🔧 Code Quality

### Lint Code
```bash
npm run lint
```

### Fix Lint Issues
```bash
npm run lint:fix
```

### Format Code
```bash
npm run format
```

### Check Formatting
```bash
npm run format:check
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests |
| `npm run test:ui` | Run UI tests only |
| `npm run test:api` | Run API tests only |
| `npm run test:headed` | Run tests with browser visible |
| `npm run test:debug` | Run tests in debug mode |
| `npm run test:ci` | Run tests in CI mode with Allure |
| `npm run allure:generate` | Generate Allure report |
| `npm run allure:open` | Open Allure report |
| `npm run allure:serve` | Generate and serve Allure report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## 🌐 Environment Variables

Create a `.env` file in the project root:

```env
# Base URL for UI tests
BASE_URL=https://www.google.com

# Base URL for API tests
API_BASE_URL=https://jsonplaceholder.typicode.com

# Run tests in headless mode
HEADLESS=true

# Browser to use (chromium, firefox, webkit)
BROWSER=chromium

# Enable debug mode
DEBUG=false
```

## 🔄 GitHub Actions CI/CD

The project includes a GitHub Actions workflow that:

1. **Runs on:** Push to `main`/`master`, Pull Requests, Manual trigger
2. **Installs:** Node.js, dependencies, Playwright browsers
3. **Runs:** All Playwright tests
4. **Generates:** Allure report
5. **Deploys:** Report to GitHub Pages

### GitHub Pages Setup

1. Go to your repository **Settings** → **Pages**
2. Under **Build and deployment**, select **GitHub Actions**
3. Push to `main` branch to trigger deployment
4. Report URL: `https://<owner>.github.io/<repo>/`

### Artifacts

After each workflow run, the following artifacts are available:
- `playwright-report` - Playwright HTML report
- `allure-results` - Raw Allure results
- `allure-report` - Generated Allure report
- `test-results` - Traces, screenshots, videos

## 📝 Writing Tests

### Adding a New UI Test

1. **Create a Page Object** (if needed):

```typescript
// pages/example.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ExamplePage extends BasePage {
  protected readonly pageUrl = '/example';
  protected readonly pageName = 'Example Page';

  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page.locator('button[type="submit"]');
  }

  async clickSubmit(): Promise<void> {
    await this.clickElement(this.submitButton, 'Submit Button');
  }
}
```

2. **Export from index**:
```typescript
// pages/index.ts
export * from './example.page';
```

3. **Add fixture** (if needed):
```typescript
// fixtures/test.fixture.ts
import { ExamplePage } from '../pages';

export interface TestFixtures {
  // ... existing fixtures
  examplePage: ExamplePage;
}

export const test = base.extend<TestFixtures>({
  // ... existing fixtures
  examplePage: async ({ page }, use) => {
    const examplePage = new ExamplePage(page);
    await use(examplePage);
  },
});
```

4. **Write the test**:
```typescript
// tests/ui/example.spec.ts
import { test, expect } from '../../fixtures';
import { setTestMetadata, Severity } from '../../utils';

test.describe('Example Feature', () => {
  test('should do something', async ({ examplePage }) => {
    await setTestMetadata({
      feature: 'Example',
      story: 'Basic functionality',
      severity: Severity.NORMAL,
      owner: 'QA Team',
    });

    await examplePage.goto();
    await examplePage.clickSubmit();
    // assertions...
  });
});
```

### Adding a New API Test

```typescript
// tests/api/example.spec.ts
import { test, expect } from '@playwright/test';
import { ApiClient } from '../../api';
import { setTestMetadata, Severity, attachJson } from '../../utils';

test.describe('Example API', () => {
  let apiClient: ApiClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request);
  });

  test('GET /endpoint', async () => {
    await setTestMetadata({
      feature: 'Example API',
      story: 'Get data',
      severity: Severity.CRITICAL,
    });

    const response = await apiClient.get('/endpoint');

    expect(response.status).toBe(200);
    await attachJson('Response', response.data);
  });
});
```

## 🏷️ Allure Annotations

The framework supports various Allure annotations:

```typescript
import { setTestMetadata, Severity } from '../../utils';

await setTestMetadata({
  feature: 'Feature Name',      // @allure.label.feature
  story: 'User Story',          // @allure.label.story
  epic: 'Epic Name',            // @allure.label.epic
  severity: Severity.CRITICAL,  // @allure.label.severity
  owner: 'QA Team',             // @allure.label.owner
  tag: 'smoke',                 // @allure.label.tag
  description: 'Test description',
});
```

### Severity Levels

- `Severity.BLOCKER` - Blocker defects
- `Severity.CRITICAL` - Critical functionality
- `Severity.NORMAL` - Normal priority
- `Severity.MINOR` - Minor issues
- `Severity.TRIVIAL` - Trivial issues

## 📎 Attachments

### Screenshot
```typescript
await googlePage.takeScreenshot('Screenshot name');
```

### JSON Data
```typescript
import { attachJson } from '../../utils';
await attachJson('Response Data', responseObject);
```

### Text
```typescript
import { attachText } from '../../utils';
await attachText('Log', 'Some text content');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
