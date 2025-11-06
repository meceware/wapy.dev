import { createTransport } from 'nodemailer';

const mailServerConfiguration = {
  host: process.env?.EMAIL_SERVER_HOST ? process.env.EMAIL_SERVER_HOST : '',
  port: process.env?.EMAIL_SERVER_PORT ? process.env.EMAIL_SERVER_PORT : 587,
  auth: {
    user: process.env?.EMAIL_SERVER_USER ? process.env.EMAIL_SERVER_USER : '',
    pass: process.env?.EMAIL_SERVER_PASSWORD ? process.env.EMAIL_SERVER_PASSWORD : '',
  },
};

const mailFrom = process.env?.EMAIL_FROM ? process.env.EMAIL_FROM : '?';

const mailContact = process.env?.EMAIL_CONTACT_EMAIL ? process.env.EMAIL_CONTACT_EMAIL : '';

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