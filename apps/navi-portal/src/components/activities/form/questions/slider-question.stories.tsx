import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { SliderQuestion } from "./slider-question";
import type { Question } from "@/lib/awell-client/generated/graphql";
import { Typography } from "@/components/ui/typography";

const meta: Meta<typeof SliderQuestion> = {
  title: "Components/Form Questions/SliderQuestion",
  component: SliderQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Range slider input with configurable min/max, labels, and tooltip using react-hook-form",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SliderQuestion>;

const baseQuestion: Question = {
  id: "test-slider",
  key: "testSlider",
  title: "Slider",
  definition_id: "sliderField",
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
      min_label: "Min label",
      max_label: "Max label",
      is_value_tooltip_on: false,
      display_marks: false,
      show_min_max_values: false,
      __typename: "SliderConfig"
    },
    phone: null,
    number: null,
    multiple_select: null,
    date_validation: null,
    file_storage: null,
    input_validation: null,
    __typename: "QuestionConfig"
  },
  rule: null,
  __typename: "Question"
};

const advancedQuestion: Question = {
  ...baseQuestion,
  title: "A slider with min and max values",
  config: {
    ...baseQuestion.config!,
    slider: {
      min: -10,
      max: 10,
      step_value: 1,
      min_label: "negative 10",
      max_label: "positive 10",
      is_value_tooltip_on: true,
      display_marks: true,
      show_min_max_values: true,
      __typename: "SliderConfig"
    }
  }
};

// Simple wrapper for form context
function FormWrapper({ question }: { question: Question }) {
  const { control } = useForm({
    defaultValues: {
      [question.key]: question.config?.slider?.min || 0,
    },
  });

  return (
    <div className="w-96">
      <Controller
        name={question.key}
        control={control}
        render={({ field, fieldState }) => (
          <SliderQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <FormWrapper question={baseQuestion} />,
};

export const WithTooltipAndMarks: Story = {
  render: () => <FormWrapper question={advancedQuestion} />,
};

export const Required: Story = {
  render: () => (
    <FormWrapper
      question={{
        ...baseQuestion,
        title: "Pain level (required)",
        is_required: true,
        config: {
          ...baseQuestion.config!,
          slider: {
            ...baseQuestion.config!.slider!,
            min_label: "No pain",
            max_label: "Severe pain",
            show_min_max_values: true,
            is_value_tooltip_on: true
          }
        }
      }}
    />
  ),
};

export const Disabled: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testSlider: 7 },
    });

    return (
      <div className="w-96">
        <Controller
          name="testSlider"
          control={control}
          render={({ field, fieldState }) => (
            <SliderQuestion
              question={{
                ...advancedQuestion,
                config: {
                  ...advancedQuestion.config!,
                  slider: {
                    ...advancedQuestion.config!.slider!,
                    is_value_tooltip_on: true
                  }
                }
              }}
              field={field}
              fieldState={fieldState}
              disabled
            />
          )}
        />
      </div>
    );
  },
};

export const WithValidation: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { testSlider: 0 },
      mode: "onChange",
    });

    return (
      <div className="w-96">
        <Controller
          name="testSlider"
          control={control}
          rules={{
            min: { value: 5, message: "Please select at least 5" },
          }}
          render={({ field, fieldState }) => (
            <SliderQuestion
              question={{
                ...baseQuestion,
                title: "Rate your satisfaction (minimum 5)",
                is_required: true,
                config: {
                  ...baseQuestion.config!,
                  slider: {
                    ...baseQuestion.config!.slider!,
                    min_label: "Very dissatisfied",
                    max_label: "Very satisfied",
                    show_min_max_values: true,
                    is_value_tooltip_on: true
                  }
                }
              }}
              field={field}
              fieldState={fieldState}
            />
          )}
        />
        <Typography.Small className="text-muted-foreground mt-4">
          This slider requires a minimum value of 5.
        </Typography.Small>
      </div>
    );
  },
};