import { vi } from 'vitest'

// Mock environment variables for all tests
vi.mock('@/env', () => ({
  env: {
    NODE_ENV: 'test' as const,
    JWT_SIGNING_KEY: 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=', // 32-byte key for testing
    TOKEN_ENCRYPTION_KEY: 'YmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmI=', // 32-byte key for testing
  },
})) 