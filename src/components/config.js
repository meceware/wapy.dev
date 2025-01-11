export const siteConfig = {
  name: 'Wapy.dev',
  description: 'Subscription and Expense Tracker',
  keywords: 'subscription, expense, tracker, wapy, meceware',
  url: process.env.SITE_URL || 'http://localhost:3000',
  links: {
    github: 'https://github.com/meceware/wapy.dev',
  },
  author: {
    name: 'meceware',
    url: 'https://www.meceware.com/',
  },
  from: 'Wapy.dev Subscription Manager',
  subscriptionReminderFrom: `Wapy.dev Subscription Reminder <${process.env.RESEND_FROM}>`,
};
