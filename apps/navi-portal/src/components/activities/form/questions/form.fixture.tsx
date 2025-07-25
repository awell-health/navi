/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import {
  useForm,
  Controller,
  type ControllerRenderProps,
  type ControllerFieldState,
} from "react-hook-form";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Typography, Button } from "@/components/ui";

interface FormFixtureProps {
  question: Question;
  validationRules?: Record<string, unknown>;
  activityId?: string;
  children: (props: {
    field: ControllerRenderProps<Record<string, unknown>, string>;
    fieldState: ControllerFieldState;
  }) => React.ReactElement;
}

/**
 * Reusable form fixture for Storybook stories
 * Handles activity events, form submission, and provides react-hook-form context
 */
export function FormFixture({
  question,
  validationRules = {},
  activityId = "storybook-demo",
  children,
}: FormFixtureProps) {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      [question.key]: undefined,
    },
    mode: "onChange",
  });

  const watchedValue = watch(question.key);

  // 1. Ready event on mount
  useEffect(() => {
    console.log("🎯", {
      type: "activity-ready",
      activityId,
      timestamp: new Date().toISOString(),
    });
  }, [activityId]);

  // 2. Data changes via watch()
  useEffect(() => {
    const subscription = watch((data, { name, type }) => {
      if (name && type === "change") {
        console.log("🎯", {
          type: "activity-data-change",
          activityId,
          field: name,
          value: data[name],
          timestamp: new Date().toISOString(),
        });

        const filledFields = Object.values(data).filter(Boolean).length;
        const totalFields = Object.keys(data).length;

        console.log("🎯", {
          type: "activity-progress",
          activityId,
          progress: filledFields,
          total: totalFields,
          percentage: Math.round((filledFields / totalFields) * 100),
          timestamp: new Date().toISOString(),
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, activityId]);

  // 3. Form-level focus/blur
  const onFormFocus = () => {
    console.log("🎯", {
      type: "activity-focus",
      activityId,
      timestamp: new Date().toISOString(),
    });
  };

  const onFormBlur = () => {
    console.log("🎯", {
      type: "activity-blur",
      activityId,
      timestamp: new Date().toISOString(),
    });
  };

  const onSubmit = (data: any) => {
    console.log("🎯", {
      type: "activity-complete",
      activityId,
      submissionData: data,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="w-96 space-y-4 p-4 border rounded-lg">
      <div className="space-y-2">
        <Typography.H3>Form Demo</Typography.H3>
        <Typography.Small className="text-muted-foreground">
          Open your browser console to see activity events
        </Typography.Small>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        onFocus={onFormFocus}
        onBlur={onFormBlur}
        className="space-y-4"
      >
        <Controller
          name={question.key}
          control={control}
          rules={validationRules}
          render={({ field, fieldState }) => children({ field, fieldState })}
        />

        <Button type="submit" className="w-full">
          Submit Form
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>
            Current value:{" "}
            {watchedValue !== undefined && watchedValue !== null
              ? watchedValue.toString()
              : "None"}
          </div>
          <div>Activity ID: {activityId}</div>
        </div>
      </form>
    </div>
  );
}
