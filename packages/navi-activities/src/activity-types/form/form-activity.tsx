import React, { useEffect, useState } from 'react';
import type { BaseActivityProps, FormActivityData, FormFieldEvent, FormValidationState } from '@awell-health/navi-core';
import { useActivityEvents } from '../../hooks/use-activity-events';

export interface FormActivityProps extends BaseActivityProps {
  activity: BaseActivityProps['activity'] & {
    inputs?: {
      form?: FormActivityData;
    };
  };
  onSubmit?: (activityId: string, data: Record<string, unknown>) => void | Promise<void>;
}

/**
 * FormActivity component - manages form lifecycle and aggregates field events
 * Follows Stripe Elements pattern for events
 */
export function FormActivity({
  activity,
  disabled = false,
  className = '',
  eventHandlers,
  onSubmit,
}: FormActivityProps) {
  const { emitActivityEvent, handleFieldEvent } = useActivityEvents(
    activity.id,
    'FORM',
    eventHandlers
  );

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validationState, setValidationState] = useState<FormValidationState>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = activity.inputs?.form;
  const questions = form?.questions || [];

  // Emit ready event when component mounts
  useEffect(() => {
    emitActivityEvent('activity-ready');
  }, [emitActivityEvent]);

  // Calculate and emit progress when form data changes
  useEffect(() => {
    const answeredCount = Object.keys(formData).filter(key => {
      const value = formData[key];
      return value !== undefined && value !== null && value !== '';
    }).length;

    emitActivityEvent('activity-progress', {
      progress: answeredCount,
      total: questions.length
    });
  }, [formData, questions.length, emitActivityEvent]);

  const handleFieldChange = (questionKey: string, value: any) => {
    // Update form data
    setFormData(prev => ({ ...prev, [questionKey]: value }));

    // Create field event
    const fieldEvent: FormFieldEvent = {
      type: 'field-change',
      fieldId: questionKey,
      questionKey,
      data: { value },
      timestamp: Date.now()
    };

    // Let the activity hook handle the field event
    handleFieldEvent(fieldEvent);
  };

  const handleFieldFocus = (questionKey: string) => {
    setFocusedField(questionKey);
    
    const fieldEvent: FormFieldEvent = {
      type: 'field-focus',
      fieldId: questionKey,
      questionKey,
      timestamp: Date.now()
    };

    handleFieldEvent(fieldEvent);
    emitActivityEvent('activity-focus');
  };

  const handleFieldBlur = (questionKey: string) => {
    setFocusedField(null);
    
    const fieldEvent: FormFieldEvent = {
      type: 'field-blur',
      fieldId: questionKey,
      questionKey,
      timestamp: Date.now()
    };

    handleFieldEvent(fieldEvent);
    emitActivityEvent('activity-blur');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (onSubmit) {
        await onSubmit(activity.id, formData);
      }

      // Emit completion event
      emitActivityEvent('activity-complete', {
        submissionData: {
          activityId: activity.id,
          formData,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      emitActivityEvent('activity-error', {
        error: error instanceof Error ? error.message : 'Failed to submit form'
      });
    }
  };

  const renderQuestionField = (question: any) => {
    const value = formData[question.key] || '';
    const isRequired = question.required;
    const isFocused = focusedField === question.key;

    // Basic field rendering for now - will be replaced with proper question components
    const baseStyle = {
      width: '100%',
      padding: '0.75rem',
      border: `2px solid ${isFocused ? '#3b82f6' : '#e5e7eb'}`,
      borderRadius: '0.375rem',
      fontSize: '1rem',
      transition: 'border-color 0.2s ease',
      outline: 'none'
    };

    switch (question.userQuestionType) {
      case 'SHORT_TEXT':
        return (
          <input
            type="text"
            value={value}
            placeholder={question.placeholder || ''}
            onChange={(e) => handleFieldChange(question.key, e.target.value)}
            onFocus={() => handleFieldFocus(question.key)}
            onBlur={() => handleFieldBlur(question.key)}
            disabled={disabled}
            style={baseStyle}
          />
        );
      
      case 'LONG_TEXT':
        return (
          <textarea
            value={value}
            placeholder={question.placeholder || ''}
            onChange={(e) => handleFieldChange(question.key, e.target.value)}
            onFocus={() => handleFieldFocus(question.key)}
            onBlur={() => handleFieldBlur(question.key)}
            disabled={disabled}
            rows={4}
            style={baseStyle}
          />
        );
      
      case 'NUMBER':
        return (
          <input
            type="number"
            value={value}
            placeholder={question.placeholder || ''}
            onChange={(e) => handleFieldChange(question.key, e.target.value)}
            onFocus={() => handleFieldFocus(question.key)}
            onBlur={() => handleFieldBlur(question.key)}
            disabled={disabled}
            style={baseStyle}
          />
        );
      
      case 'EMAIL':
        return (
          <input
            type="email"
            value={value}
            placeholder={question.placeholder || ''}
            onChange={(e) => handleFieldChange(question.key, e.target.value)}
            onFocus={() => handleFieldFocus(question.key)}
            onBlur={() => handleFieldBlur(question.key)}
            disabled={disabled}
            style={baseStyle}
          />
        );
      
      case 'YES_NO':
        return (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name={question.key}
                value="yes"
                checked={value === 'yes'}
                onChange={(e) => handleFieldChange(question.key, e.target.value)}
                onFocus={() => handleFieldFocus(question.key)}
                onBlur={() => handleFieldBlur(question.key)}
                disabled={disabled}
              />
              Yes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name={question.key}
                value="no"
                checked={value === 'no'}
                onChange={(e) => handleFieldChange(question.key, e.target.value)}
                onFocus={() => handleFieldFocus(question.key)}
                onBlur={() => handleFieldBlur(question.key)}
                disabled={disabled}
              />
              No
            </label>
          </div>
        );
      
      case 'MULTIPLE_CHOICE':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {question.options?.map((option: any) => (
              <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name={question.key}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleFieldChange(question.key, e.target.value)}
                  onFocus={() => handleFieldFocus(question.key)}
                  onBlur={() => handleFieldBlur(question.key)}
                  disabled={disabled}
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            placeholder={question.placeholder || ''}
            onChange={(e) => handleFieldChange(question.key, e.target.value)}
            onFocus={() => handleFieldFocus(question.key)}
            onBlur={() => handleFieldBlur(question.key)}
            disabled={disabled}
            style={baseStyle}
          />
        );
    }
  };

  if (!form) {
    return (
      <div className={`navi-form-activity ${className}`}>
        <div>No form data available</div>
      </div>
    );
  }

  const answeredCount = Object.keys(formData).filter(key => {
    const value = formData[key];
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <div className={`navi-form-activity ${className}`}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {form.title}
        </h1>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          <span>Form • {activity.status}</span>
          <span>{answeredCount} of {questions.length} questions answered</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {questions.map((question) => (
            <div key={question.id} style={{
              padding: '1.5rem',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                {question.title}
                {question.required && (
                  <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
                )}
              </label>
              {renderQuestionField(question)}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={disabled}
            style={{
              backgroundColor: disabled ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            Submit Form
          </button>
        </div>
      </form>
    </div>
  );
}