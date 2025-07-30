// In-memory publishable key store for development
// TODO: Replace with proper database in production

import type { TokenEnvironment } from "@awell-health/navi-core";

interface PublishableKeyData {
  key: string;
  orgId: string;
  tenantId: string;
  environment: TokenEnvironment;
  allowedDomains: string[];
  isActive: boolean;
}

// Development publishable keys store
const DEVELOPMENT_KEYS: PublishableKeyData[] = [
  {
    key: "pk_test_awell_dev_123",
    orgId: "awell-dev",
    tenantId: "awell-dev-tenant",
    environment: "development",
    allowedDomains: [
      "localhost:3000",
      "localhost:3001",
      "127.0.0.1:3000",
      "127.0.0.1:3001",
    ],
    isActive: true,
  },
  {
    key: "pk_test_awell_dev",
    orgId: "organization-test-9dc35114-e414-4f27-8530-58eff7ed042c",
    tenantId: "_v0nvLX5zCNd",
    environment: "development",
    allowedDomains: ["localhost:3001"],
    isActive: true,
  },
  {
    key: "pk_test_baker",
    orgId: "organization-test-8e708b30-8414-4cc2-a20b-b6a0c0b98ad4",
    tenantId: "h1TcvWEcVCU7",
    environment: "development",
    allowedDomains: ["localhost:3001"],
    isActive: true,
  },
  {
    key: "pk_test_healthcare_org_789",
    orgId: "healthcare-org",
    tenantId: "healthcare-org-tenant",
    environment: "development",
    allowedDomains: [
      "localhost:3000",
      "localhost:3001",
      "portal.healthcare-org.com",
    ],
    isActive: true,
  },
];

export interface ValidatedKeyData {
  orgId: string;
  tenantId: string;
  environment: TokenEnvironment;
  isValid: boolean;
}

/**
 * Validates a publishable key and returns organization data
 * @param publishableKey The key to validate (e.g., "pk_test_awell_dev_123")
 * @param origin Optional origin for domain validation
 * @returns Organization data if valid, null if invalid
 */
export function validatePublishableKey(
  publishableKey: string,
  origin?: string
): ValidatedKeyData | null {
  // Basic format validation
  if (
    !publishableKey.startsWith("pk_test_") &&
    !publishableKey.startsWith("pk_live_")
  ) {
    console.warn("❌ Invalid publishable key format:", publishableKey);
    return null;
  }

  // Find key in development store
  const keyData = DEVELOPMENT_KEYS.find((k) => k.key === publishableKey);

  if (!keyData) {
    console.warn("❌ Publishable key not found:", publishableKey);
    return null;
  }

  if (!keyData.isActive) {
    console.warn("❌ Publishable key is inactive:", publishableKey);
    return null;
  }

  // Validate origin if provided (more strict for production environments)
  if (origin && keyData.environment.startsWith("production")) {
    const originHost = new URL(origin).host;
    if (!keyData.allowedDomains.includes(originHost)) {
      console.warn("❌ Origin not allowed for key:", {
        publishableKey,
        origin,
        allowedDomains: keyData.allowedDomains,
      });
      return null;
    }
  }

  console.log("✅ Publishable key validated:", {
    key: publishableKey,
    orgId: keyData.orgId,
    tenantId: keyData.tenantId,
    environment: keyData.environment,
  });

  return {
    orgId: keyData.orgId,
    tenantId: keyData.tenantId,
    environment: keyData.environment,
    isValid: true,
  };
}

/**
 * Extract organization ID from a publishable key without full validation
 * Useful for logging and debugging
 */
export function extractOrgIdFromKey(publishableKey: string): string | null {
  const keyData = DEVELOPMENT_KEYS.find((k) => k.key === publishableKey);
  return keyData?.orgId || null;
}

/**
 * Get all development keys (for testing/debugging)
 */
export function getDevelopmentKeys(): PublishableKeyData[] {
  return DEVELOPMENT_KEYS.map((key) => ({ ...key }));
}
