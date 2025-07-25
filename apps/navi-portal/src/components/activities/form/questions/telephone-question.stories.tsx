import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  TelephoneQuestion,
  createTelephoneValidationRules,
} from "./telephone-question";
import { FormFixture } from "./form.fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

// Custom args interface for the story
interface TelephoneStoryArgs {
  title: string;
  isRequired: boolean;
  defaultCountry: string;
  availableCountries: string[];
  disabled: boolean;
}

const meta: Meta<TelephoneStoryArgs> = {
  title: "Activities/Form/Questions/TelephoneQuestion",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Question title",
    },
    isRequired: {
      control: "boolean",
      description: "Whether the question is required",
    },
    defaultCountry: {
      control: "select",
      options: [
        "US",
        "GB",
        "CA",
        "FR",
        "DE",
        "ES",
        "IT",
        "NL",
        "BE",
        "CH",
        "PT",
      ],
      description: "Default country for the phone input",
    },
    availableCountries: {
      control: "object",
      description:
        "Array of allowed country codes (empty array allows all countries)",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Configurable: Story = {
  args: {
    title: "Phone number",
    isRequired: false,
    defaultCountry: "US",
    availableCountries: [],
    disabled: false,
  },
  render: (args) => {
    // Create dynamic question based on args
    const question: Question = {
      id: "configurable-telephone",
      key: "telephone_field",
      title: args.title,
      definition_id: "phoneNumber",
      question_type: "INPUT",
      user_question_type: "TELEPHONE",
      data_point_value_type: "TELEPHONE",
      is_required: args.isRequired,
      options: [],
      config: {
        recode_enabled: false,
        use_select: null,
        mandatory: false,
        slider: null,
        phone: {
          default_country: args.defaultCountry,
          available_countries: args.availableCountries,
          __typename: "PhoneConfig",
        },
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

    const validationRules = createTelephoneValidationRules(question);

    return (
      <FormFixture question={question} validationRules={validationRules}>
        {({ field, fieldState }) => (
          <TelephoneQuestion
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

// Preset configurations for common use cases
Configurable.args = {
  title: "Phone number",
  isRequired: false,
  defaultCountry: "US",
  availableCountries: [],
  disabled: false,
};

// Example presets (can be selected from the story controls)
export const USOnly: Story = {
  ...Configurable,
  args: {
    ...Configurable.args,
    title: "US Phone number",
    defaultCountry: "US",
    availableCountries: ["US"],
  },
};

export const EuropeanPhone: Story = {
  ...Configurable,
  args: {
    ...Configurable.args,
    title: "European phone number",
    defaultCountry: "GB",
    availableCountries: ["BE", "FR", "DE", "PT", "ES", "GB", "CH", "NL", "IT"],
  },
};

export const NorthAmerican: Story = {
  ...Configurable,
  args: {
    ...Configurable.args,
    title: "North American phone number",
    defaultCountry: "US",
    availableCountries: ["US", "CA"],
  },
};

export const Required: Story = {
  ...Configurable,
  args: {
    ...Configurable.args,
    title: "Phone number (required)",
    isRequired: true,
  },
};

export const Disabled: Story = {
  ...Configurable,
  args: {
    ...Configurable.args,
    title: "Phone number (disabled)",
    disabled: true,
  },
};
