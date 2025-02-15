import { siteConfig } from '@/components/config';

export default function manifest() {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: `/`,
    icons: [
      { src: '/icons/icon-32.png', type: 'image/png', sizes: '32x32' },
      { src: '/icons/icon-96.png', type: 'image/png', sizes: '96x96' },
      { src: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/icons/icon-256.png', type: 'image/png', sizes: '256x256' },
      { src: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
      { src: '/web-app-manifest-192x192.png', type: 'image/png', sizes: '192x192', purpose: 'maskable' },
      { src: '/web-app-manifest-512x512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  };
}