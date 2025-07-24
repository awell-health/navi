import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { FileQuestion, createFileValidationRules } from "./file-question";
import { FormFixture } from "./form-fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof FileQuestion> = {
  title: "Activities/Form/Questions/FileUpload/FileQuestion",
  component: FileQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "File upload component that handles document uploads to Google Cloud Storage via signed URLs. Supports drag and drop, file type validation, and displays upload progress. Uses react-hook-form Controller pattern and includes validation utilities.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FileQuestion>;

const baseQuestion: Question = {
  id: "test-file",
  key: "testFile",
  title: "Upload Document",
  definition_id: "fileUpload",
  question_type: "INPUT",
  user_question_type: "FILE",
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
    file_storage: {
      __typename: "FileStorageQuestionConfig",
      file_storage_config_slug: "document-storage",
      accepted_file_types: null,
    },
    input_validation: null,
    __typename: "QuestionConfig",
  },
  rule: null,
  __typename: "Question",
};

export const Default: Story = {
  render: () => (
    <FormFixture question={baseQuestion}>
      {({ field, fieldState }) => (
        <FileQuestion
          question={baseQuestion}
          field={field}
          fieldState={fieldState}
        />
      )}
    </FormFixture>
  ),
};

export const Required: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Upload required document",
      is_required: true,
    };

    return (
      <FormFixture
        question={question}
        validationRules={createFileValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <FileQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const WithFileTypeRestrictions: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Upload PDF or Word document",
      config: {
        ...baseQuestion.config,
        file_storage: {
          __typename: "FileStorageQuestionConfig",
          file_storage_config_slug: "document-storage",
          accepted_file_types: [
            "application/pdf",
            ".doc",
            ".docx",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
        },
      },
    };

    return (
      <FormFixture question={question}>
        {({ field, fieldState }) => (
          <FileQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const WithValidation: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Upload medical records (required)",
      is_required: true,
      config: {
        ...baseQuestion.config,
        file_storage: {
          __typename: "FileStorageQuestionConfig",
          file_storage_config_slug: "medical-records",
          accepted_file_types: ["application/pdf", "image/*"],
        },
      },
    };

    return (
      <FormFixture
        question={question}
        validationRules={createFileValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <FileQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const question = {
      ...baseQuestion,
      title: "Previous upload (readonly)",
    };

    return (
      <FormFixture
        question={question}
        defaultValue="https://storage.googleapis.com/stub-bucket/files/example-document.pdf"
      >
        {({ field, fieldState }) => (
          <FileQuestion
            question={question}
            field={field}
            fieldState={fieldState}
            disabled
          />
        )}
      </FormFixture>
    );
  },
};
