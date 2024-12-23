const nextConfig = {
  serverRuntimeConfig: {
    name: 'Wapy',
    description: 'Personal Subscription and Expense Tracker',
    keywords: 'subscription, expense, tracker, wapy, meceware',
    url: process.env.SITE_URL,
    ogImage: '/public/og.png',
    links: {
      github: 'https://github.com/meceware/wapy.dev',
    },
    author: {
      name: 'meceware',
      url: 'https://www.meceware.com/',
    },
  },
};

export default nextConfig;
