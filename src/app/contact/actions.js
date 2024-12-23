'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  name: z.string().min(2),
  email_address: z.string().email(),
  message: z.string().min(10),
  honey_pot_email: z.string().optional(),
});

export async function sendContactForm(formData) {
  try {
    const validatedFields = schema.safeParse({
      name: formData.name,
      email_address: formData.email_address,
      message: formData.message,
      honey_pot_email: formData.honey_pot_email,
    });

    if (!validatedFields.success) {
      return {
        error: 'Invalid form data',
        status: 400,
      };
    }

    const { name, email_address, message, honey_pot_email } = validatedFields.data;

    // Check for spam
    if (honey_pot_email) {
      return {
        error: 'Form submission rejected',
        status: 400,
      };
    }

    await resend.emails.send({
      from: `Contact Form <${process.env.RESEND_FROM}>`,
      to: process.env.RESEND_CONTACT_EMAIL,
      subject: `Contact Form Submission from ${name}`,
      text: `
Name: ${name}
Email: ${email_address}
Message: ${message}
      `,
    });

    return {
      message: 'Email sent successfully',
      status: 200,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      error: 'Error sending email',
      status: 500,
    };
  }
}