import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { DescriptionQuestion } from "./description-question";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof DescriptionQuestion> = {
  title: "Components/Form Questions/DescriptionQuestion",
  component: DescriptionQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Read-only rich content display. Prioritizes Slate JSON (perfect branding) over HTML fallback.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DescriptionQuestion>;

const baseQuestion: Question = {
  id: "test-description",
  key: "testDescription",
  title:
    "<p>This is a simple description with <strong>bold text</strong> and <em>italic text</em>.</p>",
  definition_id: "description",
  question_type: "NO_INPUT",
  user_question_type: "DESCRIPTION",
  data_point_value_type: null,
  is_required: false,
  options: [],
  config: null,
  rule: null,
};

export const Default: Story = {
  args: {
    question: baseQuestion,
  },
};

export const RichContent: Story = {
  args: {
    question: {
      ...baseQuestion,
      title:
        '<h1 class="slate-h1">i&#x27;m a header</h1><h2 class="slate-h2">me too</h2><h3 class="slate-h3">dont forget about meeeeee</h3><p class="slate-p"><s class="slate-strikethrough">hello</s> <em class="slate-italic">i&#x27;m</em> a <strong class="slate-bold">description</strong> <u class="slate-underline">with</u> <a href="https://awellhealth.com"  target="_blank" rel="noreferrer" url="https://awellhealth.com">a link</a></p><ol class="slate-ol"><li class="slate-li"><div style="position:relative">numbered</div></li></ol><ul class="slate-ul"><li class="slate-li"><div style="position:relative">bulleted</div></li></ul>',
    },
  },
};

export const WithLists: Story = {
  args: {
    question: {
      ...baseQuestion,
      title: `
        <h2 class="slate-h2">Instructions</h2>
        <p class="slate-p">Please follow these steps:</p>
        <ol class="slate-ol">
          <li class="slate-li"><div style="position:relative">Complete the form below</div></li>
          <li class="slate-li"><div style="position:relative">Review your answers</div></li>
          <li class="slate-li"><div style="position:relative">Submit when ready</div></li>
        </ol>
        <p class="slate-p">Important notes:</p>
        <ul class="slate-ul">
          <li class="slate-li"><div style="position:relative">All fields are required</div></li>
          <li class="slate-li"><div style="position:relative">Data is encrypted</div></li>
        </ul>
      `,
    },
  },
};

export const Disabled: Story = {
  args: {
    question: baseQuestion,
    disabled: true,
  },
};

// Enhanced branding demonstration story
export const BrandingDemo: Story = {
  render: () => {
    const jsonContentQuestion: Question = {
      ...baseQuestion,
      title: JSON.stringify([
        {
          type: "h1",
          children: [{ text: "JSON Content with Perfect Branding" }],
        },
        {
          type: "h2",
          children: [{ text: "SlateViewer Integration" }],
        },
        {
          type: "p",
          children: [
            { text: "This content is stored as " },
            { text: "Slate JSON", bold: true },
            { text: " and rendered using " },
            { text: "SlateViewer", italic: true },
            { text: " for perfect branding integration." },
          ],
        },
        {
          type: "ul",
          children: [
            {
              type: "li",
              children: [
                {
                  type: "lic",
                  children: [
                    { text: "Automatic font family inheritance", bold: true },
                  ],
                },
              ],
            },
            {
              type: "li",
              children: [
                {
                  type: "lic",
                  children: [{ text: "Dynamic font size scaling", bold: true }],
                },
              ],
            },
            {
              type: "li",
              children: [
                {
                  type: "lic",
                  children: [
                    { text: "Perfect color theme adaptation", bold: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "h3",
          children: [{ text: "Why JSON is Better" }],
        },
        {
          type: "p",
          children: [
            {
              text: "JSON content uses Typography components directly, ensuring ",
            },
            { text: "perfect branding consistency", italic: true },
            { text: " without complex CSS selectors or mappings." },
          ],
        },
      ]),
    };

    const htmlContentQuestion: Question = {
      ...baseQuestion,
      title: `
        <h1>HTML Fallback Content</h1>
        <h2>Basic Styling</h2>
        <p>This content is HTML and uses simple prose styles as a fallback. While it still adapts to colors and basic styling, it doesn't have the same perfect branding integration as JSON content.</p>
        <p><strong>Note:</strong> Most content should be JSON for optimal branding.</p>
      `,
    };

    return (
      <div className="max-w-2xl space-y-8">
        <div>
          <h4 className="font-medium mb-4 text-lg">
            🎯 JSON Content (Preferred)
          </h4>
          <DescriptionQuestion question={jsonContentQuestion} />
        </div>

        <div>
          <h4 className="font-medium mb-4 text-lg">📄 HTML Fallback</h4>
          <DescriptionQuestion question={htmlContentQuestion} />
        </div>

        <div className="p-4 bg-muted rounded-lg text-sm">
          <h4 className="font-medium mb-2">🎨 Branding Strategy:</h4>
          <div className="space-y-2 text-muted-foreground">
            <div>
              ✅ <strong>JSON + SlateViewer</strong>: Perfect branding via
              Typography components
            </div>
            <div>
              📝 <strong>HTML + Prose</strong>: Basic fallback with simple
              styling
            </div>
            <div>
              ⚡ <strong>Smart Detection</strong>: Automatically chooses best
              approach
            </div>
          </div>
          <div className="mt-3 text-xs">
            Switch between healthcare organization themes to see automatic
            adaptation!
          </div>
        </div>
      </div>
    );
  },
};
