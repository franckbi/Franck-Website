/**
 * Contact form API route
 * Handles form submissions with validation, rate limiting, and email sending
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ContactFormSchema } from '@/lib/validation/schemas';
import { rateLimit, getRateLimitHeaders } from '@/lib/utils/rate-limit';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email template for contact form submissions
const createEmailTemplate = (data: {
  name: string;
  email: string;
  message: string;
}) => ({
  from: process.env.FROM_EMAIL || 'noreply@example.com',
  to: process.env.TO_EMAIL || 'contact@example.com',
  subject: `Portfolio Contact: ${data.name}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
        New Contact Form Submission
      </h2>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #555; margin-bottom: 5px;">From:</h3>
        <p style="margin: 0; padding: 10px; background: #f9f9f9; border-radius: 4px;">
          <strong>${data.name}</strong><br>
          <a href="mailto:${data.email}" style="color: #0066cc;">${data.email}</a>
        </p>
      </div>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #555; margin-bottom: 5px;">Message:</h3>
        <div style="padding: 15px; background: #f9f9f9; border-radius: 4px; white-space: pre-wrap;">
          ${data.message}
        </div>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>This message was sent from your portfolio contact form.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      </div>
    </div>
  `,
  text: `
New Contact Form Submission

From: ${data.name} (${data.email})

Message:
${data.message}

Timestamp: ${new Date().toISOString()}
  `,
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Apply rate limiting
    const rateLimitResult = rateLimit(clientIP, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 3, // 3 submissions per 15 minutes
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please wait before submitting another message.',
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        },
        {
          status: 429,
          headers: getRateLimitHeaders(
            rateLimitResult.remaining,
            rateLimitResult.resetTime
          ),
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = ContactFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Please check your input and try again.',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { name, email, message, website } = validationResult.data;

    // Honeypot check - if website field is filled, it's likely spam
    if (website && website.length > 0) {
      // Log spam attempt but return success to avoid revealing honeypot
      console.warn('Spam attempt detected:', { clientIP, email });
      return NextResponse.json(
        { success: true, message: 'Message sent successfully!' },
        { status: 200 }
      );
    }

    // Additional spam checks
    const spamKeywords = ['viagra', 'casino', 'lottery', 'bitcoin', 'crypto'];
    const messageText = message.toLowerCase();
    const hasSpamKeywords = spamKeywords.some(keyword =>
      messageText.includes(keyword)
    );

    if (hasSpamKeywords) {
      console.warn('Spam keywords detected:', { clientIP, email });
      return NextResponse.json(
        { success: true, message: 'Message sent successfully!' },
        { status: 200 }
      );
    }

    // Check if required environment variables are set
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        {
          error: 'Configuration error',
          message: 'Email service is not properly configured.',
        },
        { status: 500 }
      );
    }

    // Send email
    const emailTemplate = createEmailTemplate({ name, email, message });

    const emailResult = await resend!.emails.send(emailTemplate);

    if (emailResult.error) {
      console.error('Email sending failed:', emailResult.error);
      return NextResponse.json(
        {
          error: 'Email sending failed',
          message: 'Unable to send your message. Please try again later.',
        },
        { status: 500 }
      );
    }

    // Log successful submission (without sensitive data)
    console.log('Contact form submission successful:', {
      emailId: emailResult.data?.id,
      clientIP,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully! I'll get back to you soon.",
      },
      {
        status: 200,
        headers: getRateLimitHeaders(
          rateLimitResult.remaining,
          rateLimitResult.resetTime
        ),
      }
    );
  } catch (error) {
    console.error('Contact API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Something went wrong. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
