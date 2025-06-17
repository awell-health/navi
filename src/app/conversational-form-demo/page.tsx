'use client';

import { ConversationalForm, ConversationalFormStep } from '@/components/ui/conversational-form';

const sampleHealthcareFormSteps: ConversationalFormStep[] = [
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
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
        description: 'We\'ll use this to send you appointment reminders'
      },
      {
      id: 'dateOfBirth',
        type: 'date',
        label: 'Date of Birth',
        required: true
      }
    ]
  },
  {
    id: 'medical-history',
    title: 'Medical History',
    subtitle: 'Tell us about your health background',
    fields: [
      {
        id: 'hasAllergies',
        type: 'radio',
        label: 'Do you have any known allergies?',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'unsure', label: 'I\'m not sure' }
        ]
      },
      {
        id: 'allergies',
        type: 'textarea',
        label: 'Please describe your allergies',
        description: 'List any medications, foods, or environmental allergies',
        validation: { max: 500 }
      },
      {
        id: 'currentMedications',
        type: 'textarea',
        label: 'Current Medications',
        description: 'List all medications, vitamins, and supplements you\'re currently taking',
        validation: { max: 1000 }
      }
    ]
  },
  {
    id: 'visit-details',
    title: 'Visit Information',
    subtitle: 'Tell us about your visit today',
    fields: [
      {
        id: 'visitReason',
        type: 'select',
        label: 'Primary reason for visit',
        required: true,
        options: [
          { value: 'routine-checkup', label: 'Routine checkup' },
          { value: 'follow-up', label: 'Follow-up appointment' },
          { value: 'illness', label: 'Illness or injury' },
          { value: 'preventive-care', label: 'Preventive care' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        id: 'symptoms',
        type: 'textarea',
        label: 'Current symptoms',
        description: 'Describe any symptoms you\'re experiencing',
        validation: { max: 1000 }
      },
      {
        id: 'painLevel',
        type: 'select',
        label: 'Pain level (1-10)',
        options: [
          { value: '0', label: '0 - No pain' },
          { value: '1', label: '1 - Minimal pain' },
          { value: '2', label: '2 - Mild pain' },
          { value: '3', label: '3 - Uncomfortable' },
          { value: '4', label: '4 - Moderate pain' },
          { value: '5', label: '5 - Significant pain' },
          { value: '6', label: '6 - Distressing pain' },
          { value: '7', label: '7 - Intense pain' },
          { value: '8', label: '8 - Severe pain' },
          { value: '9', label: '9 - Extreme pain' },
          { value: '10', label: '10 - Worst possible pain' }
        ]
      }
    ]
  },
  {
    id: 'consent',
    title: 'Consent & Preferences',
    subtitle: 'Review and confirm your preferences',
    fields: [
      {
        id: 'consentTreatment',
        type: 'checkbox',
        label: 'I consent to receive medical treatment',
        description: 'I understand and consent to the medical treatment recommended by my healthcare provider',
        required: true
      },
      {
        id: 'consentCommunication',
        type: 'checkbox',
        label: 'Communication preferences',
        description: 'I consent to receive appointment reminders and health information via email and SMS'
      },
      {
        id: 'emergencyContact',
        type: 'text',
        label: 'Emergency contact name',
        required: true
      },
      {
        id: 'emergencyPhone',
        type: 'text',
        label: 'Emergency contact phone',
        required: true,
        validation: {
          pattern: '^[\\+]?[1-9][\\d\\s\\-\\(\\)]{7,14}$',
          message: 'Please enter a valid phone number'
        }
      }
    ]
  }
];

export default function ConversationalFormDemo() {
  const handleFormSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted with data:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Form submitted successfully! Check console for data.');
  };

  const handleStepChange = (currentStep: number, totalSteps: number) => {
    console.log(`Step ${currentStep} of ${totalSteps}`);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Healthcare Intake Form
          </h1>
          <p className="text-lg text-muted-foreground">
            Please complete this form before your appointment
          </p>
        </div>

        <ConversationalForm
          steps={sampleHealthcareFormSteps}
          onSubmit={handleFormSubmit}
          onStepChange={handleStepChange}
          showProgress={true}
          submitButtonText="Complete Intake"
          nextButtonText="Next Step"
          previousButtonText="Previous"
          className="bg-card p-8 rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
} 