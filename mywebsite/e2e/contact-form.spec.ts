/**
 * Contact form E2E tests
 */

import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('displays contact form correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
    await expect(
      page.getByText('Get in touch for opportunities and collaborations')
    ).toBeVisible();

    // Check form fields
    await expect(page.getByLabel('Name *')).toBeVisible();
    await expect(page.getByLabel('Email *')).toBeVisible();
    await expect(page.getByLabel('Message *')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Send Message' })
    ).toBeVisible();
  });

  test('shows validation errors for empty form submission', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(
      page.getByText('Message must be at least 10 characters')
    ).toBeVisible();
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.getByLabel('Name *').fill('John Doe');
    await page.getByLabel('Email *').fill('invalid-email');
    await page
      .getByLabel('Message *')
      .fill('This is a test message with enough characters.');

    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(
      page.getByText('Please enter a valid email address')
    ).toBeVisible();
  });

  test('shows validation error for short message', async ({ page }) => {
    await page.getByLabel('Name *').fill('John Doe');
    await page.getByLabel('Email *').fill('john@example.com');
    await page.getByLabel('Message *').fill('Short');

    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(
      page.getByText('Message must be at least 10 characters')
    ).toBeVisible();
  });

  test('clears validation errors when user starts typing', async ({ page }) => {
    // Submit empty form to trigger validation errors
    await page.getByRole('button', { name: 'Send Message' }).click();
    await expect(page.getByText('Name is required')).toBeVisible();

    // Start typing in name field
    await page.getByLabel('Name *').fill('J');

    // Error should be cleared
    await expect(page.getByText('Name is required')).not.toBeVisible();
  });

  test('updates character count for message field', async ({ page }) => {
    const messageField = page.getByLabel('Message *');

    await messageField.fill('Hello world');
    await expect(page.getByText('11/2000 characters')).toBeVisible();

    await messageField.fill('');
    await expect(page.getByText('0/2000 characters')).toBeVisible();
  });

  test('handles successful form submission', async ({ page }) => {
    // Mock successful API response
    await page.route('/api/contact', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: "Message sent successfully! I'll get back to you soon.",
        }),
      });
    });

    // Fill form with valid data
    await page.getByLabel('Name *').fill('John Doe');
    await page.getByLabel('Email *').fill('john@example.com');
    await page
      .getByLabel('Message *')
      .fill(
        'This is a test message with enough characters to pass validation.'
      );

    // Submit form
    await page.getByRole('button', { name: 'Send Message' }).click();

    // Check loading state
    await expect(page.getByText('Sending...')).toBeVisible();

    // Check success state
    await expect(page.getByText('Message Sent Successfully!')).toBeVisible();
    await expect(
      page.getByText(
        "Thank you for reaching out. I'll get back to you as soon as possible."
      )
    ).toBeVisible();

    // Check that "Send another message" button is present
    await expect(page.getByText('Send another message')).toBeVisible();
  });

  test('handles rate limiting error', async ({ page }) => {
    // Mock rate limiting response
    await page.route('/api/contact', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Too many requests',
          message: 'Please wait before submitting another message.',
          retryAfter: 900, // 15 minutes
        }),
      });
    });

    // Fill and submit form
    await page.getByLabel('Name *').fill('John Doe');
    await page.getByLabel('Email *').fill('john@example.com');
    await page.getByLabel('Message *').fill('This is a test message.');

    await page.getByRole('button', { name: 'Send Message' }).click();

    // Check error message
    await expect(
      page.getByText(/Please wait before submitting another message/)
    ).toBeVisible();
    await expect(page.getByText(/try again in 15 minutes/)).toBeVisible();
  });

  test('handles server validation errors', async ({ page }) => {
    // Mock validation error response
    await page.route('/api/contact', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Validation failed',
          details: [
            { field: 'email', message: 'Invalid email format' },
            {
              field: 'message',
              message: 'Message contains inappropriate content',
            },
          ],
        }),
      });
    });

    // Fill and submit form
    await page.getByLabel('Name *').fill('John Doe');
    await page.getByLabel('Email *').fill('john@example.com');
    await page.getByLabel('Message *').fill('This is a test message.');

    await page.getByRole('button', { name: 'Send Message' }).click();

    // Check field-specific errors
    await expect(page.getByText('Invalid email format')).toBeVisible();
    await expect(
      page.getByText('Message contains inappropriate content')
    ).toBeVisible();
  });

  test('handles general server errors', async ({ page }) => {
    // Mock server error response
    await page.route('/api/contact', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
          message: 'Something went wrong. Please try again later.',
        }),
      });
    });

    // Fill and submit form
    await page.getByLabel('Name *').fill('John Doe');
    await page.getByLabel('Email *').fill('john@example.com');
    await page.getByLabel('Message *').fill('This is a test message.');

    await page.getByRole('button', { name: 'Send Message' }).click();

    // Check error message
    await expect(
      page.getByText('Something went wrong. Please try again later.')
    ).toBeVisible();
  });

  test('allows sending another message after success', async ({ page }) => {
    // Mock successful API response
    await page.route('/api/contact', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Message sent successfully!',
        }),
      });
    });

    // Fill and submit form
    await page.getByLabel('Name *').fill('John Doe');
    await page.getByLabel('Email *').fill('john@example.com');
    await page.getByLabel('Message *').fill('This is a test message.');

    await page.getByRole('button', { name: 'Send Message' }).click();

    // Wait for success message
    await expect(page.getByText('Message Sent Successfully!')).toBeVisible();

    // Click "Send another message"
    await page.getByText('Send another message').click();

    // Form should be visible again
    await expect(page.getByLabel('Name *')).toBeVisible();
    await expect(page.getByLabel('Email *')).toBeVisible();
    await expect(page.getByLabel('Message *')).toBeVisible();

    // Form should be empty
    await expect(page.getByLabel('Name *')).toHaveValue('');
    await expect(page.getByLabel('Email *')).toHaveValue('');
    await expect(page.getByLabel('Message *')).toHaveValue('');
  });

  test('disables form during submission', async ({ page }) => {
    // Mock slow API response
    await page.route('/api/contact', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Message sent successfully!',
        }),
      });
    });

    // Fill form
    await page.getByLabel('Name *').fill('John Doe');
    await page.getByLabel('Email *').fill('john@example.com');
    await page.getByLabel('Message *').fill('This is a test message.');

    // Submit form
    await page.getByRole('button', { name: 'Send Message' }).click();

    // Check that form fields are disabled
    await expect(page.getByLabel('Name *')).toBeDisabled();
    await expect(page.getByLabel('Email *')).toBeDisabled();
    await expect(page.getByLabel('Message *')).toBeDisabled();
    await expect(
      page.getByRole('button', { name: /Sending.../ })
    ).toBeDisabled();
  });

  test('supports keyboard navigation', async ({ page }) => {
    // Tab through form fields
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Name *')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email *')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Message *')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: 'Send Message' })
    ).toBeFocused();
  });

  test('shows honeypot field is hidden', async ({ page }) => {
    // Honeypot field should not be visible to users
    const honeypotField = page.locator('input[name="website"]');
    await expect(honeypotField).toBeHidden();
  });

  test('displays contact information section', async ({ page }) => {
    await expect(page.getByText('Other Ways to Connect')).toBeVisible();
    await expect(page.getByText(/contact@example.com/)).toBeVisible();
    await expect(
      page.getByText(/Response time is typically within 24-48 hours/)
    ).toBeVisible();
  });
});
