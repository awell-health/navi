import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ConversationalForm, ConversationalFormStep } from './conversational-form';

const meta: Meta<typeof ConversationalForm> = {
  title: 'Components/ConversationalForm',
  component: ConversationalForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A multi-step conversational form component designed for healthcare applications. Features validation, progress tracking, and accessibility compliance (WCAG 2.1 AA).'
      }
    }
  },
  args: {
    onSubmit: fn(),
    onStepChange: fn(),
  },
  argTypes: {
    showProgress: {
      control: 'boolean',
      description: 'Show or hide the progress indicator'
    },
    submitButtonText: {
      control: 'text',
      description: 'Custom text for the submit button'
    },
    nextButtonText: {
      control: 'text', 
      description: 'Custom text for the next button'
    },
    previousButtonText: {
      control: 'text',
      description: 'Custom text for the previous button'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Healthcare patient intake form
const patientIntakeSteps: ConversationalFormStep[] = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    subtitle: 'Help us get to know you better',
    fields: [
      {
        id: 'firstName',
        type: 'text',
        label: 'First Name',
        required: true,
        validation: { min: 2, max: 50 }
      },
      {
        id: 'lastName',
        type: 'text',
        label: 'Last Name',
        required: true,
        validation: { min: 2, max: 50 }
      },
      {
        id: 'dateOfBirth',
        type: 'date',
        label: 'Date of Birth',
        required: true
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
        description: 'We\'ll use this to send you appointment reminders'
      }
    ]
  },
  {
    id: 'contact-info',
    title: 'Contact Information',
    subtitle: 'How can we reach you?',
    fields: [
      {
        id: 'phone',
        type: 'text',
        label: 'Phone Number',
        required: true,
        description: 'Include area code'
      },
      {
        id: 'address',
        type: 'textarea',
        label: 'Address',
        required: true,
        description: 'Street address, city, state, ZIP code'
      },
      {
        id: 'emergencyContact',
        type: 'text',
        label: 'Emergency Contact Name',
        required: true
      },
      {
        id: 'emergencyPhone',
        type: 'text',
        label: 'Emergency Contact Phone',
        required: true
      }
    ]
  },
  {
    id: 'medical-history',
    title: 'Medical History',
    subtitle: 'Tell us about your health',
    fields: [
      {
        id: 'primaryConcern',
        type: 'textarea',
        label: 'Primary Health Concern',
        required: true,
        description: 'Describe the main reason for your visit'
      },
      {
        id: 'allergies',
        type: 'textarea',
        label: 'Known Allergies',
        description: 'List any known allergies to medications, foods, or other substances'
      },
      {
        id: 'medications',
        type: 'textarea',
        label: 'Current Medications',
        description: 'List all medications you are currently taking'
      }
    ]
  },
  {
    id: 'preferences',
    title: 'Preferences & Consent',
    subtitle: 'Almost done!',
    fields: [
      {
        id: 'preferredContact',
        type: 'radio',
        label: 'Preferred Contact Method',
        required: true,
        options: [
          { value: 'phone', label: 'Phone' },
          { value: 'email', label: 'Email' },
          { value: 'text', label: 'Text Message' }
        ]
      },
      {
        id: 'privacyConsent',
        type: 'checkbox',
        label: 'Privacy Policy Agreement',
        description: 'I agree to the privacy policy and terms of service',
        required: true
      },
      {
        id: 'marketingConsent',
        type: 'checkbox',
        label: 'Marketing Communications',
        description: 'I would like to receive health tips and appointment reminders'
      }
    ]
  }
];

// Simple contact form
const contactFormSteps: ConversationalFormStep[] = [
  {
    id: 'contact',
    title: 'Get in Touch',
    subtitle: 'We\'d love to hear from you',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Your Name',
        required: true
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true
      },
      {
        id: 'subject',
        type: 'select',
        label: 'Subject',
        required: true,
        options: [
          { value: 'general', label: 'General Inquiry' },
          { value: 'support', label: 'Technical Support' },
          { value: 'billing', label: 'Billing Question' },
          { value: 'feedback', label: 'Feedback' }
        ]
      }
    ]
  },
  {
    id: 'message',
    title: 'Your Message',
    subtitle: 'Tell us more about your inquiry',
    fields: [
      {
        id: 'message',
        type: 'textarea',
        label: 'Message',
        required: true,
        validation: { min: 10, max: 500 },
        description: 'Please provide details about your inquiry'
      },
      {
        id: 'urgency',
        type: 'radio',
        label: 'Urgency Level',
        required: true,
        options: [
          { value: 'low', label: 'Low - Response within 48 hours' },
          { value: 'medium', label: 'Medium - Response within 24 hours' },
          { value: 'high', label: 'High - Response within 4 hours' }
        ]
      },
      {
        id: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to Newsletter',
        description: 'Keep me updated with news and updates'
      }
    ]
  }
];

export const PatientIntake: Story = {
  args: {
    steps: patientIntakeSteps,
    showProgress: true,
    submitButtonText: 'Complete Registration',
    nextButtonText: 'Continue',
    previousButtonText: 'Go Back'
  },
  parameters: {
    docs: {
      description: {
        story: 'A comprehensive patient intake form for healthcare providers. Includes personal information, contact details, medical history, and consent preferences.'
      }
    }
  }
};

export const ContactForm: Story = {
  args: {
    steps: contactFormSteps,
    showProgress: true,
    submitButtonText: 'Send Message',
    nextButtonText: 'Next',
    previousButtonText: 'Back'
  },
  parameters: {
    docs: {
      description: {
        story: 'A simple two-step contact form with subject selection and message composition.'
      }
    }
  }
};

export const WithoutProgress: Story = {
  args: {
    steps: contactFormSteps,
    showProgress: false,
    submitButtonText: 'Submit',
  },
  parameters: {
    docs: {
      description: {
        story: 'Form without progress indicator for simpler use cases.'
      }
    }
  }
};

export const SingleStep: Story = {
  args: {
    steps: [
      {
        id: 'single',
        title: 'Quick Form',
        subtitle: 'Just a few details',
        fields: [
          {
            id: 'name',
            type: 'text',
            label: 'Name',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            required: true
          },
          {
            id: 'agree',
            type: 'checkbox',
            label: 'I agree to the terms',
            required: true
          }
        ]
      }
    ],
    showProgress: false,
    submitButtonText: 'Get Started'
  },
  parameters: {
    docs: {
      description: {
        story: 'A single-step form that still uses the conversational form structure for consistency.'
      }
    }
  }
};

export const ValidationExample: Story = {
  args: {
    steps: [
      {
        id: 'validation',
        title: 'Form Validation',
        subtitle: 'Try submitting without filling fields to see validation in action',
        fields: [
          {
            id: 'username',
            type: 'text',
            label: 'Username',
            required: true,
            validation: { min: 3, max: 20 },
            description: 'Must be 3-20 characters'
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            required: true
          },
          {
            id: 'age',
            type: 'number',
            label: 'Age',
            required: true,
            validation: { min: 18, max: 120 },
            description: 'Must be 18 or older'
          },
          {
            id: 'bio',
            type: 'textarea',
            label: 'Bio',
            validation: { max: 200 },
            description: 'Optional, max 200 characters'
          }
        ]
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates various validation rules including required fields, length constraints, and format validation.'
      }
    }
  }
}; 