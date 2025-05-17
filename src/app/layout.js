// CSS
import './globals.css';

// Imports
import { Inter } from 'next/font/google';
import { auth } from '@/lib/auth';
import { ThemeProvider, SessionProvider } from '@/components/providers';
import Footer from '@/components/footer';
import { siteConfig } from '@/components/config';
import { Toaster } from '@/components/ui/sonner';
import { CookieConsent } from '@/components/cookie-consent';
import Header from '@/components/header';
import { PushNotificationProvider } from '@/components/providers';
import { HeaderMemberMainNavigation, HeaderMemberIconNavigation } from '@/components/header-member';
import { HeaderVisitorIconNavigation } from '@/components/header-visitor';
import { PushNotificationToggle } from '@/components/notifications/notification-toggle';
import { AddToHomeScreen } from '@/components/add-to-home-screen';

// Fonts
const inter = Inter({ subsets: ['latin'] });

// Metadata
export const metadata = {
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: './',
  },
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [siteConfig.author],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    noimageindex: false,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: ['/images/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/images/x.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-256.png', sizes: '256x256', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
};

// Viewport
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${siteConfig.url}/#software`,
  'name': siteConfig.name,
  'description': siteConfig.description,
  'applicationCategory': 'FinanceApplication',
  'operatingSystem': 'Web',
  'url': siteConfig.url,
  'offers': [
    {
      '@type': 'Offer',
      'name': 'Premium Plan',
      'category': 'SubscriptionPlan',
      'price': '1.50',
      'priceCurrency': 'EUR',
      'availability': 'https://schema.org/InStock',
      'priceValidUntil': `${(new Date()).getFullYear()}-12-31`,
      'seller': {
        '@type': 'Organization',
        'name': siteConfig.author.name,
        'url': siteConfig.author.url
      }
    },
    {
      '@type': 'Offer',
      'name': 'Self-Hosted Edition',
      'price': '0',
      'priceCurrency': 'EUR',
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': siteConfig.author.name,
        'url': siteConfig.author.url
      }
    }
  ],
  'featureList': [
    'Subscription tracking',
    'Payment reminders',
    'Multi-currency support',
    'Expense analytics',
    'Timezone support',
    'Push notifications',
    'Email notifications',
    'Webhook notifications',
  ],
  'screenshot': `${siteConfig.url}/images/og.png`,
  'softwareVersion': '1.0',
  'datePublished': '2025-02-25',
  'keywords': siteConfig.keywords,
  'author': {
    '@type': 'Organization',
    'name': siteConfig.author.name,
    'url': siteConfig.author.url
  },
  'provider': {
    '@type': 'Organization',
    'name': siteConfig.author.name,
    'url': siteConfig.author.url
  }
};

// Root Layout
export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={session}>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
            <PushNotificationProvider>
              <div className='flex min-h-screen flex-col'>
                <Header
                  mainNavigation={session ? HeaderMemberMainNavigation : undefined}
                  iconNavigation={session ? HeaderMemberIconNavigation : HeaderVisitorIconNavigation}
                />
                <main className='flex flex-col h-full grow items-center p-4 sm:p-8 md:p-12'>
                  <div className='container flex flex-col items-center gap-6 text-center grow relative'>
                    {children}
                  </div>
                </main>
                <Footer author={siteConfig.author} github={siteConfig.links.github} />
              </div>
              {session && <PushNotificationToggle vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''} />}
              {session && <AddToHomeScreen />}
            </PushNotificationProvider>
            <Toaster richColors closeButton />
            <CookieConsent />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
