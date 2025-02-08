import { siteConfig } from '@/components/config';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/account',
        '/api',
        '/api/*',
        '/edit',
        '/edit/new',
        '/edit/*',
        '/login',
        '/reports',
        '/signout',
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
