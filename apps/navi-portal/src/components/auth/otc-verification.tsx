"use client";

import React, { useState } from "react";
import { Button } from "../ui";

interface OtcVerificationCardProps {
  onVerified: () => void;
}

export function OtcVerificationCard({ onVerified }: OtcVerificationCardProps) {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [otcError, setOtcError] = useState<string>("");
  const [otcInfo, setOtcInfo] = useState<string>("");

  async function startOtc(): Promise<void> {
    setOtcError("");
    setOtcInfo("");
    try {
      const res = await fetch("/api/otc/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          method: "sms",
          phoneNumber: "+16176920449",
        }),
      });
      if (!res.ok) {
        const { error } = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setOtcError(error || "Failed to start verification");
        return;
      }
      setOtcInfo("Code sent. Please enter it below.");
      setIsVerifying(true);
    } catch (_e) {
      setOtcError("Failed to start verification");
    }
  }

  async function verifyOtc(): Promise<void> {
    setOtcError("");
    try {
      const res = await fetch("/api/otc/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: otp }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          remainingAttempts?: number;
        };
        setOtcError(
          data.error
            ? `${data.error}${
                typeof data.remainingAttempts === "number"
                  ? ` (${data.remainingAttempts} attempts left)`
                  : ""
              }`
            : "Verification failed"
        );
        return;
      }
      onVerified();
      setIsVerifying(false);
      setOtcInfo("");
      setOtp("");
    } catch (_e) {
      setOtcError("Verification failed");
    }
  }

  return (
    <div className="mb-4 rounded-md border p-4">
      {!isVerifying ? (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            Please complete verification to view previous activities.
          </div>
          <Button onClick={startOtc} type="button" className="text-sm">
            Authenticate
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full rounded-md border p-2 tracking-widest text-center"
              placeholder="Enter code"
              aria-label="Verification code"
            />
          </div>
          {otcInfo && (
            <div className="text-xs text-muted-foreground">{otcInfo}</div>
          )}
          {otcError && <div className="text-xs text-red-600">{otcError}</div>}
          <div className="flex items-center justify-between gap-3">
            <button
              className="px-3 py-2 rounded-md border text-sm"
              onClick={() => {
                setIsVerifying(false);
                setOtp("");
                setOtcError("");
                setOtcInfo("");
              }}
            >
              Cancel
            </button>
            <button
              className="px-3 py-2 rounded-md bg-amber-500 text-white text-sm disabled:opacity-50"
              onClick={verifyOtc}
              disabled={otp.length < 4}
            >
              Verify
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
