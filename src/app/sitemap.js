import { siteConfig } from '@/components/config';

export default function sitemap() {
  return [
    {
      url: `${siteConfig.url}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 1
    },
    {
      url: `${siteConfig.url}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${siteConfig.url}/login`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${siteConfig.url}/privacy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${siteConfig.url}/refund-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${siteConfig.url}/pricing`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${siteConfig.url}/terms-of-service`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6
    }
  ];
}
