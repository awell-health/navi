"use server";

import { kv } from "@vercel/kv";
import type { PublishableKeyData } from "@awell-health/navi-core";
import { minimatch } from "minimatch";

export interface ValidatedKeyData
  extends Pick<PublishableKeyData, "orgId" | "tenantId" | "environment"> {
  isValid: boolean;
}

const KEY_PREFIX = "publishable-key:";

export async function getPublishableKey(
  key: string
): Promise<PublishableKeyData | null> {
  if (!key) return null;
  const kvKey = `${KEY_PREFIX}${key}`;
  return (await kv.get(kvKey)) as PublishableKeyData | null;
}

export async function setPublishableKey(
  key: string,
  keyData: Omit<PublishableKeyData, "createdAt" | "updatedAt">
) {
  const kvKey = `${KEY_PREFIX}${key}`;
  const now = new Date().toISOString();
  const dataToStore: PublishableKeyData = {
    ...keyData,
    createdAt: now,
    updatedAt: now,
  };
  await kv.set(kvKey, dataToStore);
}

export async function updatePublishableKey(
  key: string,
  updates: Partial<Omit<PublishableKeyData, "key" | "createdAt">>
) {
  const existing = await getPublishableKey(key);
  if (!existing) throw new Error(`Publishable key not found: ${key}`);
  const kvKey = `${KEY_PREFIX}${key}`;
  const updatedData: PublishableKeyData = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await kv.set(kvKey, updatedData);
}

export async function deletePublishableKey(key: string) {
  if (!key) return;
  await kv.del(`${KEY_PREFIX}${key}`);
}

export async function validateKey(
  publishableKey: string,
  origin?: string
): Promise<ValidatedKeyData | null> {
  if (
    !publishableKey.startsWith("pk_test-") &&
    !publishableKey.startsWith("pk_live-") &&
    !publishableKey.startsWith("pk_test_") &&
    !publishableKey.startsWith("pk_live_")
  ) {
    return null;
  }

  const keyData = await getPublishableKey(publishableKey);
  if (!keyData || !keyData.isActive) return null;

  if (origin) {
    const originHost = new URL(origin).host.replace(/^https?:\/\//, "");
    if (
      !keyData.allowedDomains?.some((domain) => minimatch(originHost, domain))
    ) {
      return null;
    }
  }

  return {
    orgId: keyData.orgId,
    tenantId: keyData.tenantId,
    environment: keyData.environment,
    isValid: true,
  };
}
