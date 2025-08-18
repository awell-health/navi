"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import type { AuthenticationState } from "@awell-health/navi-core";

// Minimal response schema for /api/session/jwt
const JwtResponseSchema = z.object({ jwt: z.string().min(1) }).partial();

// Minimal payload schema focused on the single field we consume client-side
const JwtPayloadAuthSchema = z.object({
  authentication_state: z
    .enum(["unauthenticated", "verified", "authenticated"])
    .optional(),
});

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return atob(normalized);
  } catch {
    return "{}";
  }
}

export function useAuthState() {
  const [authState, setAuthState] =
    useState<AuthenticationState>("unauthenticated");
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const fetchAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const res = await fetch("/api/session/jwt", { credentials: "include" });
      if (!res.ok) {
        setIsLoadingAuth(false);
        return;
      }

      const json = await res.json();
      const parsed = JwtResponseSchema.safeParse(json);
      if (!parsed.success || !parsed.data.jwt) {
        setIsLoadingAuth(false);
        return;
      }

      const jwt = parsed.data.jwt;
      const payloadPart = jwt.split(".")[1];
      if (!payloadPart) {
        setIsLoadingAuth(false);
        return;
      }

      const decodedJson = base64UrlDecode(payloadPart);
      const decoded = JwtPayloadAuthSchema.safeParse(JSON.parse(decodedJson));
      if (decoded.success) {
        setAuthState(decoded.data.authentication_state ?? "unauthenticated");
      }
    } catch {
      // noop; leave defaults
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchAuth();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchAuth]);

  return { authState, isLoadingAuth, refreshAuth: fetchAuth };
}
