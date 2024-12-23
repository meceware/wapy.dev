// CSS
import './globals.css';

// Imports
import { Inter } from 'next/font/google';
import { ThemeProvider, SessionProvider } from '@/components/providers';
import Footer from '@/components/footer';
import { siteConfig } from '@/components/config';
import { Toaster } from '@/components/ui/sonner';
import { auth } from '@/lib/auth';
import { CookieConsent } from '@/components/cookie-consent';
// Fonts
const inter = Inter({ subsets: ['latin'] });

// Metadata
export const metadata = {
  metadataBase: new URL( siteConfig.url ),
  alternates: {
    canonical: '/',
  },
  title: {
    default: siteConfig.name,
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
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [ `${ siteConfig.url }/og.png` ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [ `${ siteConfig.url }/og.png` ],
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
  // TODO: verification: {
  // TODO:   google: 'google',
  // TODO: },
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
export default async function RootLayout({ children, member, visitor }) {
  const session = await auth();

  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={ session }>
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
            <div className='flex min-h-screen flex-col'>
              { session ? member : visitor }
              { children }
              <Footer name={siteConfig.name} author={ siteConfig.author } github={ siteConfig.links.github } />
            </div>
            <Toaster richColors closeButton />
            <CookieConsent />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
