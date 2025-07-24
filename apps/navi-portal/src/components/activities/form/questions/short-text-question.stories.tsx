import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ShortTextQuestion } from "./short-text-question";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof ShortTextQuestion> = {
  title: "Form/Questions/ShortTextQuestion",
  component: ShortTextQuestion,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "text",
      description: "Current value of the input",
    },
    disabled: {
      control: "boolean",
      description: "Whether the question is disabled",
    },
    error: {
      control: "text",
      description: "External error message",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ShortTextQuestion>;

// Base question from storybook-activities.json
const baseQuestion: Question = {
  id: "cMK8eVpxfEYp",
  key: "firstName",
  title: "What is your first name?",
  definition_id: "mEHObAXFI81q",
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
};

// Question with validation from storybook-activities.json
const validationQuestion: Question = {
  ...baseQuestion,
  id: "cMK8eVpxfEYp",
  key: "firstName",
  title: "What is your first name?",
  is_required: false,
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
    input_validation: {
      mode: "simple",
      pattern: "^[A-Za-z]{5}$",
      helper_text: "5 letters, please",
      simpleConfig: {
        exactLength: 5,
        allowed: {
          letters: true,
          numbers: false,
          whitespace: false,
          special: false,
        },
      },
    },
  }
};

export const Default: Story = {
  args: {
    question: baseQuestion,
    value: "",
    onChange: (value: string) => console.log("Value changed:", value),
    onFocus: () => console.log("Input focused"),
    onBlur: () => console.log("Input blurred"),
  },
};

export const WithValue: Story = {
  args: {
    question: baseQuestion,
    value: "John",
    onChange: (value: string) => console.log("Value changed:", value),
  },
};

export const Required: Story = {
  args: {
    question: {
      ...baseQuestion,
      is_required: true,
    },
    value: "",
    onChange: (value: string) => console.log("Value changed:", value),
  },
};

export const WithValidation: Story = {
  args: {
    question: validationQuestion,
    value: "",
    onChange: (value: string) => console.log("Value changed:", value),
  },
};

export const ValidationError: Story = {
  args: {
    question: validationQuestion,
    value: "abc",
    onChange: (value: string) => console.log("Value changed:", value),
  },
};

export const ExternalError: Story = {
  args: {
    question: baseQuestion,
    value: "John",
    error: "This name is already taken",
    onChange: (value: string) => console.log("Value changed:", value),
  },
};

export const Disabled: Story = {
  args: {
    question: baseQuestion,
    value: "John",
    disabled: true,
    onChange: (value: string) => console.log("Value changed:", value),
  },
};

// Interactive story with state
export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    
    return (
      <ShortTextQuestion
        {...args}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    question: validationQuestion,
  },
};