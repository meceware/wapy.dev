import { siteConfig } from '@/components/config';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/account',
        '/api/*',
        '/edit/*',
        '/reports',
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
