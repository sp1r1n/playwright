// Export base fixtures
export { test as baseTest, expect } from './base.fixture';

// Export API fixtures
export { test as apiTest } from './api.fixture';
export type { ApiFixtures } from './api.fixture';

// Export UI fixtures (includes API fixtures)
export { test as uiTest } from './ui.fixture';
export type { UiFixtures } from './ui.fixture';

// Re-export commonly used types
export type { BaseFixtures } from './base.fixture';
