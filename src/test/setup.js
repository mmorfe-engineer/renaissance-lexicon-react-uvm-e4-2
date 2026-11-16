/**
 * Vitest setup file
 */
import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';

// Extend expect with jest-dom matchers
expect.extend({
  // Add any custom matchers if needed
});

// Mock localStorage for tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => Object.keys(store)[index] || null,
    store
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock crypto.randomUUID for consistent IDs in tests
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-1234-5678-9abc-def012345678'
  }
});

// Mock AbortController
global.AbortController = class AbortController {
  constructor() {
    this.signal = {
      aborted: false,
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  }
  abort() {
    this.signal.aborted = true;
  }
};

// Mock fetch
global.fetch = vitest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve([])
  })
);

// Global test timeout
vitest.setConfig({ testTimeout: 10000 });
