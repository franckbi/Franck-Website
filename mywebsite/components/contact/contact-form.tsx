/**
 * Contact form component with client-side validation and error handling
 */

'use client';

import { useState } from 'react';
import {
  ContactFormSchema,
  type ContactFormData,
} from '@/lib/validation/schemas';
import { useAnalytics } from '@/lib/hooks/use-analytics';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  general?: string;
}

interface SubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  errors: FormErrors;
}

export function ContactForm() {
  const analytics = useAnalytics({ component: 'ContactForm' });
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
    website: '', // Honeypot field
  });

  const [state, setState] = useState<SubmissionState>({
    isSubmitting: false,
    isSuccess: false,
    errors: {},
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific error when user starts typing
    if (state.errors[name as keyof FormErrors]) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [name]: undefined },
      }));
    }
  };

  const validateForm = (): boolean => {
    const result = ContactFormSchema.safeParse(formData);

    if (result.success) {
      setState(prev => ({ ...prev, errors: {} }));
      return true;
    }

    const errors: FormErrors = {};
    result.error.issues.forEach(issue => {
      const field = issue.path[0] as string;
      if (field !== 'website' && field in errors) {
        // Don't show honeypot errors
        errors[field as keyof FormErrors] = issue.message;
      }
    });

    setState(prev => ({ ...prev, errors }));
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    analytics.startInteraction();

    if (!validateForm()) {
      analytics.trackEvent('contact-form-validation-error');
      return;
    }

    setState(prev => ({
      ...prev,
      isSubmitting: true,
      errors: {},
      isSuccess: false,
    }));

    analytics.trackEvent('contact-form-submit-start');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setState(prev => ({
            ...prev,
            isSubmitting: false,
            errors: {
              general: `${data.message} Please try again in ${Math.ceil(data.retryAfter / 60)} minutes.`,
            },
          }));
          return;
        }

        if (response.status === 400 && data.details) {
          const fieldErrors: FormErrors = {};
          data.details.forEach((detail: { field: string; message: string }) => {
            fieldErrors[detail.field as keyof FormErrors] = detail.message;
          });
          setState(prev => ({
            ...prev,
            isSubmitting: false,
            errors: fieldErrors,
          }));
          return;
        }

        throw new Error(data.message || 'Failed to send message');
      }

      // Success
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        isSuccess: true,
        errors: {},
      }));

      analytics.endInteraction('contact-form-submit');
      analytics.trackEvent('contact-form-success', {
        hasName: !!formData.name,
        messageLength: formData.message.length,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        message: '',
        website: '',
      });
    } catch (error) {
      analytics.endInteraction('contact-form-submit');
      analytics.trackEvent('contact-form-error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      analytics.reportError(
        error instanceof Error
          ? error
          : new Error('Contact form submission failed')
      );

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: {
          general:
            error instanceof Error
              ? error.message
              : 'Something went wrong. Please try again.',
        },
      }));
    }
  };

  if (state.isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <div className="text-green-600 dark:text-green-400 text-2xl mb-2">
            ✓
          </div>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            Message Sent Successfully!
          </h3>
          <p className="text-green-700 dark:text-green-300 mb-4">
            Thank you for reaching out. I&apos;ll get back to you as soon as
            possible.
          </p>
          <button
            onClick={() => setState(prev => ({ ...prev, isSuccess: false }))}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 underline"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General error message */}
        {state.errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">
              {state.errors.general}
            </p>
          </div>
        )}

        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={state.isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              state.errors.name
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="Your full name"
            aria-describedby={state.errors.name ? 'name-error' : undefined}
          />
          {state.errors.name && (
            <p
              id="name-error"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {state.errors.name}
            </p>
          )}
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={state.isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              state.errors.email
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="your.email@example.com"
            aria-describedby={state.errors.email ? 'email-error' : undefined}
          />
          {state.errors.email && (
            <p
              id="email-error"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {state.errors.email}
            </p>
          )}
        </div>

        {/* Message field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            disabled={state.isSubmitting}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
              state.errors.message
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="Tell me about your project, opportunity, or just say hello..."
            aria-describedby={
              state.errors.message ? 'message-error' : undefined
            }
          />
          {state.errors.message && (
            <p
              id="message-error"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {state.errors.message}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formData.message.length}/2000 characters
          </p>
        </div>

        {/* Honeypot field - hidden from users */}
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />

        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={state.isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {state.isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending...
              </span>
            ) : (
              'Send Message'
            )}
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          * Required fields. Your information will be kept private and secure.
        </p>
      </form>
    </div>
  );
}
