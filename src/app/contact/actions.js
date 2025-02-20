'use server';

import { Resend } from 'resend';
import { z } from 'zod';
import { siteConfig } from '@/components/config';

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
      replyTo: `${name} <${email_address}>`,
      subject: `Contact form submission from ${name}`,
      text: `New Contact Form Submission

Name: ${name}
Email: ${email_address}

Message:
${message}

This is an automated message from ${siteConfig.name}.`,
      html: `
          <body style="margin: 0; padding: 0; background-color: #efefef;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0;">
              <tr>
                <td align="center" style="padding: 1rem 2rem;">
                  <div style="max-width: 400px; background-color: #ffffff; padding: 1rem; text-align: left;">
                    <h2 style="margin: 1rem 0; color: #000000;">Contact Form Submission</h2>
                    <p>This is an automated message from ${siteConfig.name}.</p>
                    <div style="margin: 1rem 0;">
                      <strong>Name:</strong> ${name}<br>
                      <strong>Email:</strong> ${email_address}<br><br>
                      <strong>Message:</strong><br>
                      ${message}
                    </div>
                  </div>
                  <div style="max-width: 400px; color: #999999; text-align: center;">
                    <p style="padding-bottom: 0.5rem;">Made with ♥ by <a href="${siteConfig.url}" target="_blank">${siteConfig.name}</a></p>
                    <div style="text-align: center;">
                      <img src="${siteConfig.url}/icon.png" alt="${siteConfig.from}" style="width: 96px;">
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </body>
      `,
    });

    return {
      message: 'Email sent successfully',
      status: 200,
    };
  } catch (error) {
    console.warn('Error sending email:', error);
    return {
      error: 'Error sending email',
      status: 500,
    };
  }
}