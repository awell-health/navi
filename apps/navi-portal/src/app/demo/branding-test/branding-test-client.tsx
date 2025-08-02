"use client";

import React from "react";
import { ActivityHeader } from "@/components/activity-header";
import { Form } from "@/components/activities/form/form-activity";
import { Message } from "@/components/activities/message/message-activity";
import { Checklist } from "@/components/activities/checklist/checklist-activity";
import { Typography } from "@/components/ui";
import { awellDefaultBranding } from "@/lib/branding/defaults";
import { MockActivityProvider } from "./mock-activity-provider";
import type {
  ChecklistActivityData,
  MessageActivityData,
  FormActivityData,
} from "@awell-health/navi-core";

// Mock activity data for branding testing
const checklistActivity: ChecklistActivityData = {
  id: "demo-checklist",
  action: "ASSIGNED",
  careflow_id: "demo-careflow",
  container_name: "Branding Test Checklist",
  date: new Date().toISOString(),
  indirect_object: {
    id: "demo-patient",
    type: "PATIENT",
    name: "Demo Patient",
    email: "demo@example.com",
    preferred_language: "en",
  },
  object: {
    id: "checklist-object",
    type: "CHECKLIST",
    name: "Sample Interactive Checklist",
    email: null,
    preferred_language: null,
  },
  pathway_definition_id: "demo-pathway",
  reference_id: "demo-ref-checklist",
  reference_type: "NAVIGATION",
  resolution: null,
  session_id: null,
  status: "ACTIVE",
  tenant_id: "demo-tenant",
  is_user_activity: true,
  sub_activities: [],
  inputs: {
    type: "CHECKLIST",
    checklist: {
      title: "Sample Interactive Checklist",
      items: [
        "Review your custom branding colors and fonts",
        "Test form interactions and hover states",
        "Verify accessibility and contrast ratios",
        "Check responsive design on different screen sizes",
      ],
    },
  },
  outputs: null,
};

const messageActivity: MessageActivityData = {
  id: "demo-message",
  action: "ASSIGNED",
  careflow_id: "demo-careflow",
  container_name: "Branding Test Message",
  date: new Date().toISOString(),
  indirect_object: {
    id: "demo-patient",
    type: "PATIENT",
    name: "Demo Patient",
    email: "demo@example.com",
    preferred_language: "en",
  },
  object: {
    id: "message-object",
    type: "MESSAGE",
    name: "Rich Content Message",
    email: null,
    preferred_language: null,
  },
  pathway_definition_id: "demo-pathway",
  reference_id: "demo-ref-message",
  reference_type: "NAVIGATION",
  resolution: null,
  session_id: null,
  status: "ACTIVE",
  tenant_id: "demo-tenant",
  is_user_activity: true,
  sub_activities: [],
  inputs: {
    type: "MESSAGE",
    message: {
      id: "demo-message-content",
      subject: "Welcome to Your Branded Experience",
      body: `<h1 class="slate-h1">Custom Branding Preview</h1><h2 class="slate-h2">Typography & Formatting</h2><p class="slate-p">This message demonstrates how your <strong class="slate-bold">custom branding</strong> appears across different content types. Test your <em class="slate-italic">typography</em>, <u class="slate-underline">colors</u>, and <s class="slate-strikethrough">styling</s> choices.</p><h3 class="slate-h3">Interactive Elements</h3><p class="slate-p">Links should reflect your brand: <a rel="noreferrer" target="_blank" href="https://awellhealth.com">Visit Awell Health</a></p><ul class="slate-ul"><li class="slate-li"><div style="position:relative">Bulleted lists with your styling</div></li><li class="slate-li"><div style="position:relative">Check spacing and indentation</div></li><li class="slate-li"><div style="position:relative">Verify color consistency</div></li></ul><ol class="slate-ol"><li class="slate-li"><div style="position:relative">Numbered lists maintain hierarchy</div></li><li class="slate-li"><div style="position:relative">Font weights should be consistent</div></li><li class="slate-li"><div style="position:relative">Test readability across content</div></li></ol>`,
      format: "HTML",
      attachments: null,
    },
  },
  outputs: null,
};

const formActivity: FormActivityData = {
  id: "demo-form",
  action: "ASSIGNED",
  careflow_id: "demo-careflow",
  container_name: "Branding Test Form",
  date: new Date().toISOString(),
  indirect_object: {
    id: "demo-patient",
    type: "PATIENT",
    name: "Demo Patient",
    email: "demo@example.com",
    preferred_language: "en",
  },
  object: {
    id: "form-object",
    type: "FORM",
    name: "UI Component Test",
    email: null,
    preferred_language: null,
  },
  pathway_definition_id: "demo-pathway",
  reference_id: "demo-ref-form",
  reference_type: "NAVIGATION",
  resolution: null,
  session_id: null,
  status: "ACTIVE",
  tenant_id: "demo-tenant",
  is_user_activity: true,
  sub_activities: [],
  inputs: {
    type: "FORM",
    form: {
      id: "demo-form-content",
      key: "brandingTestForm",
      title: "UI Component Test",
      trademark: null,
      questions: [
        {
          id: "desc-1",
          key: "description",
          title:
            '<p class="slate-p">This form showcases different question types with your custom branding. Test how your colors, fonts, and styling appear across UI components.</p>',
          definition_id: "desc-def",
          question_type: "NO_INPUT",
          user_question_type: "DESCRIPTION",
          data_point_value_type: null,
          is_required: false,
          options: [],
          config: {
            recode_enabled: false,
            use_select: null,
            mandatory: false,
            slider: null,
            phone: null,
            number: null,
            multiple_select: null,
            date_validation: null,
            file_storage: null,
            input_validation: null,
          },
          rule: null,
        },
        {
          id: "text-1",
          key: "shortText",
          title: "Short Text Input",
          definition_id: "text-def",
          question_type: "INPUT",
          user_question_type: "SHORT_TEXT",
          data_point_value_type: "STRING",
          is_required: false,
          options: [],
          config: {
            recode_enabled: false,
            use_select: null,
            mandatory: false,
            slider: null,
            phone: null,
            number: null,
            multiple_select: null,
            date_validation: null,
            file_storage: null,
            input_validation: null,
          },
          rule: null,
        },
        {
          id: "select-1",
          key: "singleSelect",
          title: "Single Select (Radio Buttons)",
          definition_id: "select-def",
          question_type: "MULTIPLE_CHOICE",
          user_question_type: "MULTIPLE_CHOICE",
          data_point_value_type: "STRING",
          is_required: false,
          options: [
            {
              id: "opt-1",
              label: "Primary Brand Color",
              value: "primary",
            },
            {
              id: "opt-2",
              label: "Secondary Brand Color",
              value: "secondary",
            },
            {
              id: "opt-3",
              label: "Accent Color",
              value: "accent",
            },
          ],
          config: {
            recode_enabled: false,
            use_select: false,
            mandatory: false,
            slider: null,
            phone: null,
            number: null,
            multiple_select: null,
            date_validation: null,
            file_storage: null,
            input_validation: null,
          },
          rule: null,
        },
        {
          id: "multi-1",
          key: "multiSelect",
          title: "Multiple Select (Checkboxes)",
          definition_id: "multi-def",
          question_type: "MULTIPLE_CHOICE",
          user_question_type: "MULTIPLE_SELECT",
          data_point_value_type: "STRINGS_ARRAY",
          is_required: false,
          options: [
            {
              id: "multi-opt-1",
              label: "Typography Styling",
              value: "typography",
            },
            {
              id: "multi-opt-2",
              label: "Color Scheme",
              value: "colors",
            },
            {
              id: "multi-opt-3",
              label: "Button Styling",
              value: "buttons",
            },
          ],
          config: {
            recode_enabled: false,
            use_select: false,
            mandatory: false,
            slider: null,
            phone: null,
            number: null,
            multiple_select: null,
            date_validation: null,
            file_storage: null,
            input_validation: null,
          },
          rule: null,
        },
        {
          id: "bool-1",
          key: "yesNo",
          title: "Yes/No Question",
          definition_id: "bool-def",
          question_type: "INPUT",
          user_question_type: "YES_NO",
          data_point_value_type: "BOOLEAN",
          is_required: false,
          options: [],
          config: {
            recode_enabled: false,
            use_select: null,
            mandatory: false,
            slider: null,
            phone: null,
            number: null,
            multiple_select: null,
            date_validation: null,
            file_storage: null,
            input_validation: null,
          },
          rule: null,
        },
        {
          id: "slider-1",
          key: "slider",
          title: "Slider Component",
          definition_id: "slider-def",
          question_type: "INPUT",
          user_question_type: "SLIDER",
          data_point_value_type: "NUMBER",
          is_required: false,
          options: [],
          config: {
            recode_enabled: false,
            use_select: null,
            mandatory: false,
            slider: {
              min: 0,
              max: 10,
              step_value: 1,
              min_label: "Poor",
              max_label: "Excellent",
              is_value_tooltip_on: true,
              display_marks: true,
              show_min_max_values: true,
            },
            phone: null,
            number: null,
            multiple_select: null,
            date_validation: null,
            file_storage: null,
            input_validation: null,
          },
          rule: null,
        },
        {
          id: "date-1",
          key: "date",
          title: "Date Picker",
          definition_id: "date-def",
          question_type: "INPUT",
          user_question_type: "DATE",
          data_point_value_type: "DATE",
          is_required: false,
          options: [],
          config: {
            recode_enabled: false,
            use_select: null,
            mandatory: false,
            slider: null,
            phone: null,
            number: null,
            multiple_select: null,
            date_validation: null,
            file_storage: null,
            input_validation: null,
          },
          rule: null,
        },
        {
          id: "email-1",
          key: "email",
          title: "Email Address",
          definition_id: "email-def",
          question_type: "INPUT",
          user_question_type: "EMAIL",
          data_point_value_type: "STRING",
          is_required: false,
          options: [],
          config: {
            recode_enabled: false,
            use_select: null,
            mandatory: false,
            slider: null,
            phone: null,
            number: null,
            multiple_select: null,
            date_validation: null,
            file_storage: null,
            input_validation: null,
          },
          rule: null,
        },
        {
          id: "number-1",
          key: "number",
          title: "Numeric Input",
          definition_id: "number-def",
          question_type: "INPUT",
          user_question_type: "NUMBER",
          data_point_value_type: "NUMBER",
          is_required: false,
          options: [],
          config: {
            recode_enabled: false,
            use_select: null,
            mandatory: false,
            slider: null,
            phone: null,
            number: null,
            multiple_select: null,
            date_validation: null,
            file_storage: null,
            input_validation: null,
          },
          rule: null,
        },
        {
          id: "textarea-1",
          key: "longText",
          title: "Long Text Area",
          definition_id: "textarea-def",
          question_type: "INPUT",
          user_question_type: "LONG_TEXT",
          data_point_value_type: "STRING",
          is_required: false,
          options: [],
          config: {
            recode_enabled: false,
            use_select: null,
            mandatory: false,
            slider: null,
            phone: null,
            number: null,
            multiple_select: null,
            date_validation: null,
            file_storage: null,
            input_validation: null,
          },
          rule: null,
        },
        {
          id: "phone-1",
          key: "phone",
          title: "Phone Number",
          definition_id: "phone-def",
          question_type: "INPUT",
          user_question_type: "TELEPHONE",
          data_point_value_type: "TELEPHONE",
          is_required: false,
          options: [],
          config: {
            recode_enabled: false,
            use_select: null,
            mandatory: false,
            slider: null,
            phone: {
              default_country: "US",
              available_countries: [],
            },
            number: null,
            multiple_select: null,
            date_validation: null,
            file_storage: null,
            input_validation: null,
          },
          rule: null,
        },
      ],
    },
  },
  outputs: null,
};

interface BrandingTestClientProps {
  orgId: string;
  hasCustomBranding: boolean;
}

export function BrandingTestClient({
  orgId,
  hasCustomBranding,
}: BrandingTestClientProps) {
  const handleActivityClick = () => {
    // No-op for demo
  };

  return (
    <MockActivityProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <ActivityHeader onActivityListClick={handleActivityClick} />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 space-y-12">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <Typography.H1>
              {hasCustomBranding
                ? "Branding Test Page"
                : "Unstyled Components Preview"}
            </Typography.H1>
            <Typography.P className="text-muted-foreground max-w-2xl mx-auto">
              {hasCustomBranding
                ? "This page showcases different UI components with your custom branding applied. Your colors, fonts, and styling are active across all components."
                : "This page shows unstyled UI components. Set up your organization branding on the CareOps platform to see how your custom styling will transform these components."}
            </Typography.P>
            {orgId !== awellDefaultBranding.orgId && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <Typography.P className="text-sm">
                  <strong>Testing Org ID:</strong>{" "}
                  <code className="bg-primary/10 px-2 py-1 rounded">
                    {orgId}
                  </code>
                </Typography.P>
              </div>
            )}
          </div>

          {/* Message Activity Demo */}
          <section className="space-y-4">
            <Typography.H2>Message Activity</Typography.H2>
            <Typography.P className="text-muted-foreground">
              Rich text messaging with HTML content, including headers, lists,
              and formatting.
            </Typography.P>
            <div className="bg-card rounded-lg border p-6">
              <Message
                activity={messageActivity}
                disabled={true}
                eventHandlers={{}}
              />
            </div>
          </section>

          {/* Checklist Activity Demo */}
          <section className="space-y-4">
            <Typography.H2>Checklist Activity</Typography.H2>
            <Typography.P className="text-muted-foreground">
              Interactive checklists with progress tracking and completion
              states.
            </Typography.P>
            <div className="bg-card rounded-lg border p-6">
              <Checklist
                activity={checklistActivity}
                disabled={false}
                eventHandlers={{}}
              />
            </div>
          </section>

          {/* Form Activity Demo */}
          <section className="space-y-4">
            <Typography.H2>Form Activity</Typography.H2>
            <Typography.P className="text-muted-foreground">
              Comprehensive form with various question types: text inputs,
              selects, sliders, dates, and more.
            </Typography.P>
            <div className="bg-card rounded-lg border p-6">
              <Form
                activity={formActivity}
                disabled={false}
                eventHandlers={{}}
                renderMode="traditional"
                showProgress={true}
              />
            </div>
          </section>

          {/* Instructions */}
          <section className="bg-muted/50 rounded-lg p-6 space-y-4">
            <Typography.H3>Testing Your Branding</Typography.H3>
            <Typography.P>
              Use this page to test how your custom branding looks with
              different components:
            </Typography.P>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                <strong>Colors:</strong> Check how your primary, secondary, and
                accent colors appear across buttons, inputs, and highlights
              </li>
              <li>
                <strong>Typography:</strong> Verify that custom fonts render
                correctly in headers, body text, and form labels
              </li>
              <li>
                <strong>Layout:</strong> Ensure spacing, borders, and component
                sizing align with your design system
              </li>
              <li>
                <strong>Accessibility:</strong> Test color contrast and
                readability with your brand colors
              </li>
              <li>
                <strong>Interactions:</strong> Try clicking buttons, filling
                forms, and checking items to see hover and focus states
              </li>
            </ul>
            <Typography.P className="text-sm text-muted-foreground">
              Access this page at:{" "}
              <code className="bg-muted px-2 py-1 rounded">
                /demo/branding-test
              </code>
              {orgId !== awellDefaultBranding.orgId && (
                <>
                  {" "}
                  or{" "}
                  <code className="bg-muted px-2 py-1 rounded">
                    /demo/branding-test?org-id={orgId}
                  </code>
                </>
              )}
            </Typography.P>
          </section>
        </div>
      </div>
    </MockActivityProvider>
  );
}
