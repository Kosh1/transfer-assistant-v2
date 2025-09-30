import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '../hooks/useTranslation'
import { Box } from '@mui/material'
import ThemeProvider from '../components/ThemeProvider'
import Header from '../components/Header'
import StructuredData from '../components/StructuredData'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vienna Private Transfer Service | Rational Transfer | Best Prices & Instant Booking',
  description: 'Book the best Vienna private transfers with Rational Transfer. Compare prices from all providers instantly, get real-time analysis, and book your ride in minutes. Professional drivers, meet & greet service, free cancellation.',
  keywords: [
    'Vienna private transfer',
    'Vienna airport transfer',
    'private transfer Vienna',
    'Vienna taxi service',
    'airport transfer Vienna',
    'Vienna transfer booking',
    'private car Vienna',
    'Vienna chauffeur service',
    'transfer Vienna airport',
    'Vienna transportation',
    'Rational Transfer',
    'transfer price comparison',
    'Vienna travel',
    'Austria transfers'
  ],
  authors: [{ name: 'Rational Transfer Team' }],
  creator: 'Rational Transfer',
  publisher: 'Rational Transfer',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://transfer-assistant.vercel.app'),
  alternates: {
    canonical: 'https://transfer-assistant.vercel.app',
    languages: {
      'en': '/en',
      'de': '/de',
      'ru': '/ru',
      'fr': '/fr',
      'es': '/es',
      'it': '/it',
      'zh': '/zh',
      'x-default': '/en',
    },
  },
  openGraph: {
    title: 'Vienna Private Transfer Service | Rational Transfer',
    description: 'Book the best Vienna private transfers with Rational Transfer. Compare prices from all providers instantly and book your ride in minutes.',
    url: 'https://transfer-assistant.vercel.app',
    siteName: 'Rational Transfer',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Vienna Private Transfer Service - AI-Powered Assistant',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vienna Private Transfer Service | Rational Transfer',
    description: 'Book the best Vienna private transfers with Rational Transfer. Compare prices instantly and book in minutes.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚗</text></svg>',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StructuredData type="Organization" data={{}} />
        <StructuredData type="Service" data={{}} />
        <StructuredData type="WebSite" data={{}} />
        
        {/* Yandex.Metrika counter */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=104294341', 'ym');

              ym(104294341, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
            `
          }}
        />
        <noscript>
          <div>
            <img 
              src="https://mc.yandex.ru/watch/104294341" 
              style={{position: 'absolute', left: '-9999px'}} 
              alt="" 
            />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}
        
        <ThemeProvider>
          <LanguageProvider>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
              <Header />
              {children}
            </Box>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
