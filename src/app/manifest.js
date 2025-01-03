import { siteConfig } from '@/components/config';

export default function manifest() {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: `/`,
    icons: [
      { src: '/favicon.ico', type: 'image/x-icon', sizes: '16x16 32x32' },
      { src: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
      { src: '/web-app-manifest-192x192.png', type: 'image/png', sizes: '192x192', purpose: 'maskable' },
      { src: '/web-app-manifest-512x512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  };
}