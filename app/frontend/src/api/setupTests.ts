import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Start MSW mock server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers and clear localStorage/mocks after each test
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  vi.clearAllMocks();
});

// Clean up MSW server after all tests
afterAll(() => server.close());
