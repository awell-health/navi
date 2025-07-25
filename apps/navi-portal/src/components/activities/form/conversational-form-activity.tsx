import React from "react";
import type { FormActivityProps } from "./form-activity";
import { Form } from "./form-activity";

/**
 * ConversationalForm - convenience wrapper for conversational form mode
 * Automatically sets up conversational mode with good defaults
 */
export function ConversationalForm(
  props: Omit<FormActivityProps, "renderMode" | "showProgress">
) {
  return <Form {...props} renderMode="conversational" showProgress={true} />;
}

export type ConversationalFormProps = Omit<
  FormActivityProps,
  "renderMode" | "showProgress"
>;
