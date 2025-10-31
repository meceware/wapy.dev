import { createTransport } from 'nodemailer';

// TODO: Deprecate Resend by 01.01.2026

const mailServerConfiguration = {
  host: process.env?.EMAIL_SERVER_HOST ? process.env.EMAIL_SERVER_HOST : (
    process.env?.RESEND_API_KEY ? 'smtp.resend.com' : ''
  ),
  port: process.env?.EMAIL_SERVER_PORT ? process.env.EMAIL_SERVER_PORT : 587,
  auth: {
    user: process.env?.EMAIL_SERVER_USER ? process.env.EMAIL_SERVER_USER : (
      process.env?.RESEND_API_KEY ? 'resend' : ''
    ),
    pass: process.env?.EMAIL_SERVER_PASSWORD ? process.env.EMAIL_SERVER_PASSWORD : (
      process.env?.RESEND_API_KEY ? process.env.RESEND_API_KEY : ''
    ),
  },
};

const mailFrom = process.env?.EMAIL_FROM ? process.env.EMAIL_FROM : process.env?.RESEND_FROM;

const mailContact = process.env?.EMAIL_CONTACT_EMAIL ? process.env.EMAIL_CONTACT_EMAIL : process.env?.RESEND_CONTACT_EMAIL;

const mailSend = async (params) => {
  const transport = createTransport(mailServerConfiguration);
  const result = await transport.sendMail(params);

  const rejected = result.rejected || [];
  const pending = result.pending || [];
  const failed = rejected.concat(pending).filter(Boolean);
  if (failed.length) {
    throw new Error(`Email (${failed.join(", ")}) could not be sent`);
  }
}

export { mailFrom, mailContact, mailSend };