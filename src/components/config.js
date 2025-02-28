export const siteConfig = {
  name: 'Wapy.dev',
  title: 'Wapy.dev - Subscription Manager',
  description: 'Effortlessly track and manage all your subscriptions and recurring expenses in a powerful, easy-to-read dashboard. Know exactly what you\'re spending and get timely notifications to ensure you never miss a payment.',
  keywords: 'subscription tracker, subscription management, recurring payments, expense tracker, manage subscriptions, budgeting tools, personal finance tracker, track my subscriptions, expense management, subscription monitoring, money-saving tools, wapy, meceware',
  url: process.env.SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://www.wapy.dev' : 'http://localhost:3000'),
  links: {
    github: 'https://github.com/meceware/wapy.dev',
  },
  author: {
    name: 'meceware',
    url: 'https://www.meceware.com/',
  },
  from: 'Wapy.dev Subscription Manager',
};
