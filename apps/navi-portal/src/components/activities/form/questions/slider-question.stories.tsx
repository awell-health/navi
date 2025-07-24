import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { SliderQuestion, createSliderValidationRules } from "./slider-question";
import { FormFixture } from "./form-fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof SliderQuestion> = {
  title: "Activities/Form/Questions/SliderQuestion",
  component: SliderQuestion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Question title",
    },
    is_required: {
      control: "boolean",
      description: "Whether the field is required",
    },
    min: {
      control: { type: "number", step: 1 },
      description: "Minimum slider value",
    },
    max: {
      control: { type: "number", step: 1 },
      description: "Maximum slider value",
    },
    step_value: {
      control: { type: "number", step: 0.1, min: 0.1 },
      description: "Step increment for slider",
    },
    min_label: {
      control: "text",
      description: "Label for minimum value",
    },
    max_label: {
      control: "text",
      description: "Label for maximum value",
    },
    is_value_tooltip_on: {
      control: "boolean",
      description: "Show current value above slider",
    },
    display_marks: {
      control: "boolean",
      description: "Show tick marks below slider",
    },
    show_min_max_values: {
      control: "boolean",
      description: "Show min/max labels",
    },
    disabled: {
      control: "boolean",
      description: "Disable the slider",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Base story with configurable args
export const Configurable: Story = {
  args: {
    title: "Rate your experience",
    is_required: false,
    min: 0,
    max: 10,
    step_value: 1,
    min_label: "Poor",
    max_label: "Excellent",
    is_value_tooltip_on: true,
    display_marks: false,
    show_min_max_values: true,
    disabled: false,
  },
  render: (args) => {
    const question: Question = {
      id: "configurable-slider",
      key: "slider_field",
      title: args.title,
      definition_id: "sliderField",
      question_type: "INPUT",
      user_question_type: "SLIDER",
      data_point_value_type: "NUMBER",
      is_required: args.is_required,
      options: [],
      config: {
        recode_enabled: false,
        use_select: null,
        mandatory: false,
        slider: {
          min: args.min,
          max: args.max,
          step_value: args.step_value,
          min_label: args.min_label,
          max_label: args.max_label,
          is_value_tooltip_on: args.is_value_tooltip_on,
          display_marks: args.display_marks,
          show_min_max_values: args.show_min_max_values,
          __typename: "SliderConfig",
        },
        phone: null,
        number: null,
        multiple_select: null,
        date_validation: null,
        file_storage: null,
        input_validation: null,
        __typename: "QuestionConfig",
      },
      rule: null,
      __typename: "Question",
    };

    return (
      <FormFixture
        question={question}
        validationRules={createSliderValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <SliderQuestion
            question={question}
            field={field}
            fieldState={fieldState}
            disabled={args.disabled}
          />
        )}
      </FormFixture>
    );
  },
};

// Preset examples for common use cases
export const PainScale: Story = {
  args: {
    title: "Rate your pain level",
    is_required: true,
    min: 0,
    max: 10,
    step_value: 1,
    min_label: "No pain",
    max_label: "Worst pain",
    is_value_tooltip_on: true,
    display_marks: false,
    show_min_max_values: true,
    disabled: false,
  },
  render: Configurable.render,
};

export const SatisfactionSurvey: Story = {
  args: {
    title: "How satisfied are you with our service?",
    is_required: false,
    min: 1,
    max: 5,
    step_value: 1,
    min_label: "Very dissatisfied",
    max_label: "Very satisfied",
    is_value_tooltip_on: true,
    display_marks: true,
    show_min_max_values: true,
    disabled: false,
  },
  render: Configurable.render,
};

export const Temperature: Story = {
  args: {
    title: "Temperature change",
    is_required: false,
    min: -20,
    max: 50,
    step_value: 0.5,
    min_label: "Much colder",
    max_label: "Much warmer",
    is_value_tooltip_on: true,
    display_marks: true,
    show_min_max_values: true,
    disabled: false,
  },
  render: Configurable.render,
};
