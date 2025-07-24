import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { ImageQuestion, createImageValidationRules } from "./image-question";
import { FormFixture } from "./form-fixture";
import type { Question } from "@/lib/awell-client/generated/graphql";

const meta: Meta<typeof ImageQuestion> = {
  title: "Components/Form Questions/ImageQuestion",
  component: ImageQuestion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Image upload component with preview functionality that handles image uploads to Google Cloud Storage via signed URLs. Supports drag and drop, image type validation, live preview, and displays upload progress. Uses react-hook-form Controller pattern and includes validation utilities.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImageQuestion>;

const baseQuestion: Question = {
  id: "test-image",
  key: "testImage",
  title: "Upload Image",
  definition_id: "imageUpload",
  question_type: "INPUT",
  user_question_type: "IMAGE",
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
      file_storage_config_slug: "image-storage",
      accepted_file_types: null,
    },
    input_validation: null,
    __typename: "QuestionConfig"
  },
  rule: null,
  __typename: "Question"
};

export const Default: Story = {
  render: () => (
    <FormFixture question={baseQuestion}>
      {({ field, fieldState }) => (
        <ImageQuestion
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
      title: "Upload profile photo (required)",
      is_required: true 
    };
    
    return (
      <FormFixture 
        question={question}
        validationRules={createImageValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <ImageQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const SpecificImageTypes: Story = {
  render: () => {
    const question = { 
      ...baseQuestion, 
      title: "Upload JPEG or PNG image",
      config: {
        ...baseQuestion.config,
        file_storage: {
          __typename: "FileStorageQuestionConfig",
          file_storage_config_slug: "photo-storage",
          accepted_file_types: ["image/jpeg", "image/png"],
        }
      }
    };
    
    return (
      <FormFixture question={question}>
        {({ field, fieldState }) => (
          <ImageQuestion
            question={question}
            field={field}
            fieldState={fieldState}
          />
        )}
      </FormFixture>
    );
  },
};

export const MedicalPhotos: Story = {
  render: () => {
    const question = { 
      ...baseQuestion, 
      title: "Upload medical photos",
      config: {
        ...baseQuestion.config,
        file_storage: {
          __typename: "FileStorageQuestionConfig",
          file_storage_config_slug: "medical-photos",
          accepted_file_types: ["image/*"],
        }
      }
    };
    
    return (
      <FormFixture question={question}>
        {({ field, fieldState }) => (
          <ImageQuestion
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
      title: "Upload identification photo (required)",
      is_required: true,
      config: {
        ...baseQuestion.config,
        file_storage: {
          __typename: "FileStorageQuestionConfig",
          file_storage_config_slug: "id-photos",
          accepted_file_types: ["image/jpeg", "image/png", "image/webp"],
        }
      }
    };
    
    return (
      <FormFixture 
        question={question}
        validationRules={createImageValidationRules(question)}
      >
        {({ field, fieldState }) => (
          <ImageQuestion
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
      title: "Previous image upload (readonly)" 
    };
    
    return (
      <FormFixture 
        question={question}
        defaultValue="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face"
      >
        {({ field, fieldState }) => (
          <ImageQuestion
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