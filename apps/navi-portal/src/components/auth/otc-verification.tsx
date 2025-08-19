"use client";

import React, { useMemo, useState } from "react";
import { Button, Input } from "../ui";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";

interface OtcVerificationCardProps {
  onVerified: () => void;
}

export function OtcVerificationCard({ onVerified }: OtcVerificationCardProps) {
  type OtcFlowState =
    | "idle" // user has not started authentication
    | "requesting" // sending request to start OTC
    | "awaitingCode" // code sent, awaiting input
    | "verifying" // sending verification request
    | "verified"; // verification completed

  const [flowState, setFlowState] = useState<OtcFlowState>("idle");
  const [otp, setOtp] = useState<string>("");
  const [otcError, setOtcError] = useState<string>("");
  const [otcInfo, setOtcInfo] = useState<string>("");

  const isLoading = useMemo(
    () => flowState === "requesting" || flowState === "verifying",
    [flowState]
  );

  async function startOtc(): Promise<void> {
    if (isLoading) return;
    setOtcError("");
    setOtcInfo("");
    try {
      setFlowState("requesting");
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
      setFlowState("awaitingCode");
    } catch (_e) {
      setOtcError("Failed to start verification");
    } finally {
      // If we are still in requesting due to an early return, go back to idle
      setFlowState((prev) => (prev === "requesting" ? "idle" : prev));
    }
  }

  async function verifyOtc(): Promise<void> {
    if (isLoading) return;
    setOtcError("");
    try {
      setFlowState("verifying");
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
      setFlowState("verified");
      setOtcInfo("");
      setOtp("");
    } catch (_e) {
      setOtcError("Verification failed");
    } finally {
      // If verification did not complete, return to awaitingCode
      setFlowState((prev) => (prev === "verifying" ? "awaitingCode" : prev));
    }
  }
  const otpSlotClassName = "bg-white rounded-md text-lg font-mono";

  return (
    <div className="mb-4 p-4 border-1 rounded-md border-primary bg-primary/10">
      {flowState === "idle" || flowState === "requesting" ? (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            Please complete verification to view previous activities.
          </div>
          <Button
            onClick={startOtc}
            type="button"
            className="text-sm"
            disabled={isLoading}
          >
            Authenticate
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 w-full justify-center">
            <InputOTP
              pattern="[0-9]*"
              maxLength={6}
              disabled={isLoading}
              onChange={(value) => {
                setOtp(value);
              }}
              value={otp}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className={otpSlotClassName} />
                <InputOTPSlot index={1} className={otpSlotClassName} />
                <InputOTPSlot index={2} className={otpSlotClassName} />
                <InputOTPSlot index={3} className={otpSlotClassName} />
                <InputOTPSlot index={4} className={otpSlotClassName} />
                <InputOTPSlot index={5} className={otpSlotClassName} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {otcInfo && (
            <div className="text-xs text-muted-foreground">{otcInfo}</div>
          )}
          {otcError && <div className="text-xs text-red-600">{otcError}</div>}
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              className="text-sm"
              onClick={() => {
                setFlowState("idle");
                setOtp("");
                setOtcError("");
                setOtcInfo("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={verifyOtc}
              disabled={otp.length < 4 || isLoading}
              type="button"
              className="text-sm"
            >
              Verify
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
