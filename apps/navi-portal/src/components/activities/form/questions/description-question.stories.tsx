import type { Meta, StoryObj } from "@storybook/react";
import { DescriptionQuestion } from "./description-question";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof DescriptionQuestion> = {
  title: "Form/Questions/DescriptionQuestion",
  component: DescriptionQuestion,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the question is disabled",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DescriptionQuestion>;

// Base question data from storybook-activities.json
const baseQuestion: Question = {
  id: "pPj71qF7bB4y",
  key: "typePChildrenTextDescription1",
  title: "<p class=\"slate-p\">Description 1 </p>",
  definition_id: "ixY0ZEdNKJDG",
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
      title: `
        <h1 class="slate-h1">Welcome to the Form</h1>
        <p class="slate-p">This is a <strong class="slate-bold">description question</strong> that can contain rich HTML content including:</p>
        <ul class="slate-ul">
          <li class="slate-li"><div style="position:relative">Bold and italic text</div></li>
          <li class="slate-li"><div style="position:relative">Lists and links</div></li>
          <li class="slate-li"><div style="position:relative">Headers and formatting</div></li>
        </ul>
        <p class="slate-p">Please read the instructions carefully before proceeding.</p>
      `,
    },
  },
};

export const SimpleText: Story = {
  args: {
    question: {
      ...baseQuestion,
      title: "This is a simple text description without any formatting.",
    },
  },
};

export const Disabled: Story = {
  args: {
    question: baseQuestion,
    disabled: true,
  },
};