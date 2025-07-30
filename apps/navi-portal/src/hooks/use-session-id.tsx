"use client";

import { useState, useEffect } from "react";

/**
 * Hook to get the current session ID from the JWT token
 *
 * The session ID is stored as the `sub` field in the JWT payload.
 * This hook leverages the existing JWT infrastructure and caches the result.
 *
 * @returns sessionId string or null if no session/JWT available
 */
export function useSessionId(): string | null {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchSessionId() {
      try {
        // Use the same endpoint that Apollo client uses for JWT access
        const response = await fetch("/api/session/jwt", {
          credentials: "include", // Include cookies for session validation
        });

        if (!response.ok) {
          console.debug("No JWT available for session ID extraction");
          if (mounted) {
            setSessionId(null);
          }
          return;
        }

        const { jwt } = await response.json();

        if (!jwt) {
          if (mounted) {
            setSessionId(null);
          }
          return;
        }

        // Decode JWT payload to extract sub (session ID)
        // JWT format: header.payload.signature
        const payloadPart = jwt.split(".")[1];
        if (!payloadPart) {
          console.error("Invalid JWT format");
          if (mounted) {
            setSessionId(null);
          }
          return;
        }

        // Decode base64url payload
        const decodedPayload = JSON.parse(
          atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"))
        );

        const extractedSessionId = decodedPayload.sub;

        if (mounted) {
          setSessionId(extractedSessionId || null);
        }
      } catch (error) {
        console.error("Error extracting session ID from JWT:", error);
        if (mounted) {
          setSessionId(null);
        }
      }
    }

    fetchSessionId();

    return () => {
      mounted = false;
    };
  }, []);

  return sessionId;
}

/**
 * Hook with loading state for when you need to know if the session ID is still being fetched
 */
export function useSessionIdWithLoading(): {
  sessionId: string | null;
  isLoading: boolean;
} {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchSessionId() {
      try {
        const response = await fetch("/api/session/jwt", {
          credentials: "include",
        });

        if (!response.ok) {
          if (mounted) {
            setSessionId(null);
            setIsLoading(false);
          }
          return;
        }

        const { jwt } = await response.json();

        if (!jwt) {
          if (mounted) {
            setSessionId(null);
            setIsLoading(false);
          }
          return;
        }

        const payloadPart = jwt.split(".")[1];
        if (!payloadPart) {
          if (mounted) {
            setSessionId(null);
            setIsLoading(false);
          }
          return;
        }

        const decodedPayload = JSON.parse(
          atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"))
        );

        if (mounted) {
          setSessionId(decodedPayload.sub || null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error extracting session ID from JWT:", error);
        if (mounted) {
          setSessionId(null);
          setIsLoading(false);
        }
      }
    }

    fetchSessionId();

    return () => {
      mounted = false;
    };
  }, []);

  return { sessionId, isLoading };
}
