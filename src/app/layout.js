// CSS
import './globals.css';

// Imports
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { ThemeProvider, SessionProvider } from '@/components/providers';
import Footer from '@/components/footer';
import { siteConfig } from '@/components/config';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { CookieConsent } from '@/components/cookie-consent';
import Header from '@/components/header';
import { Icons } from '@/components/icons';
import { PushNotificationProvider } from '@/components/providers';
import { HeaderMemberMainNavigation, HeaderMemberIconNavigation } from '@/components/header-member';
import { PushNotificationToggle } from '@/components/notifications/notification-toggle';
import { AddToHomeScreen } from '@/components/add-to-home-screen';

// Fonts
const inter = Inter({ subsets: ['latin'] });

// Metadata
export const metadata = {
  metadataBase: new URL( siteConfig.url ),
  alternates: {
    canonical: '/',
  },
  title: {
    default: siteConfig.title,
    template: `%s | ${ siteConfig.name }`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [ siteConfig.author ],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
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
    images: [ `/og.png` ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [ `/og.png` ],
  },
  icons: {
    icon: [
      { url: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  category: 'technology',
};

// Viewport
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '0 0% 100%' }, // TODO: does this work?
    { media: '(prefers-color-scheme: dark)', color: '240 10% 3.9%' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// Root Layout
export default async function RootLayout({ children }) {
  const session = await auth();

  const iconNavigation = (
    <>
      <Button variant='ghost' size='icon' title='Sign in' asChild>
        <Link href='/login'>
          <Icons.signIn className='h-5 w-5' />
        </Link>
      </Button>
    </>
  );

  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={ session }>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
            <PushNotificationProvider>
              <div className='flex min-h-screen flex-col'>
                <Header
                  mainNavigation={session ? HeaderMemberMainNavigation : undefined}
                  iconNavigation={session ? HeaderMemberIconNavigation : iconNavigation}
                />
                <main className='flex flex-col h-full grow items-center p-8 md:p-12'>
                  <div className='container flex flex-col items-center gap-6 text-center grow relative'>
                    { children }
                  </div>
                </main>
                <Footer author={ siteConfig.author } github={ siteConfig.links.github } />
              </div>
              { session && <PushNotificationToggle vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''} /> }
              { session && <AddToHomeScreen /> }
            </PushNotificationProvider>
            <Toaster richColors closeButton />
            <CookieConsent />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
