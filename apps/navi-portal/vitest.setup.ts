import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock environment variables for all tests
vi.mock('@/env', () => ({
  env: {
    NODE_ENV: 'test' as const,
    JWT_KEY_ID: 'abcdefghijklm012345nopqrstuvwxyz',
    JWT_SIGNING_KEY: 'abcdefghijklmnopqrstuvwxyz012345', // 32-byte key for testing
    TOKEN_ENCRYPTION_KEY: 'abcdefghijklmnopqrstuvwxyz012345', // 32-byte key for testing
  },
}))

// Mock Vercel KV for tests
vi.mock('@vercel/kv', () => ({
  kv: {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
})) 