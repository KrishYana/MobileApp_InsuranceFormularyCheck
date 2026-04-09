// Test the API client configuration (not interceptors)
// We need to mock the modules that client.ts imports

jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  },
}));

jest.mock('../../errors/errorLogger', () => ({
  errorLogger: { log: jest.fn() },
}));

// Mock Platform to control the host selection
jest.mock('react-native', () => ({
  Platform: {
    select: jest.fn((options: Record<string, string>) => options.ios || options.default),
    OS: 'ios',
  },
}));

describe('apiClient configuration', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('creates an axios instance with timeout of 15000ms', () => {
    const { apiClient } = require('../client');
    expect(apiClient.defaults.timeout).toBe(15000);
  });

  it('sets Content-Type header to application/json', () => {
    const { apiClient } = require('../client');
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('has a baseURL set', () => {
    const { apiClient } = require('../client');
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(typeof apiClient.defaults.baseURL).toBe('string');
  });

  it('baseURL ends with /v1', () => {
    const { apiClient } = require('../client');
    expect(apiClient.defaults.baseURL).toMatch(/\/v1$/);
  });

  it('has request interceptors installed', () => {
    const { apiClient } = require('../client');
    // Axios stores interceptors internally; at least one should be set up
    expect(apiClient.interceptors.request.handlers.length).toBeGreaterThan(0);
  });

  it('has response interceptors installed', () => {
    const { apiClient } = require('../client');
    expect(apiClient.interceptors.response.handlers.length).toBeGreaterThan(0);
  });
});
