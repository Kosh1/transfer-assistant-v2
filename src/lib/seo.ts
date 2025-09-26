import { Metadata } from 'next';

export const generateSEOMetadata = (language: string = 'en'): Metadata => {
  const baseUrl = 'https://transfer-assistant.vercel.app';
  
  const seoConfig = {
    en: {
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
      ]
    },
    de: {
      title: 'Wien Privater Transfer Service | Rational Transfer | Beste Preise & Sofortbuchung',
      description: 'Buchen Sie die besten privaten Transfers in Wien mit Rational Transfer. Vergleichen Sie sofort Preise von allen Anbietern, erhalten Sie Echtzeit-Analysen und buchen Sie Ihre Fahrt in Minuten. Professionelle Fahrer, Meet & Greet Service, kostenlose Stornierung.',
      keywords: [
        'Wien privater Transfer',
        'Wien Flughafen Transfer',
        'privater Transfer Wien',
        'Wien Taxi Service',
        'Flughafen Transfer Wien',
        'Wien Transfer Buchung',
        'privates Auto Wien',
        'Wien Chauffeur Service',
        'Transfer Wien Flughafen',
        'Wien Transport',
        'KI Transfer Assistent',
        'Transfer Preisvergleich',
        'Wien Reisen',
        'Österreich Transfers'
      ]
    },
    ru: {
      title: 'Частный трансфер Вены | Rational Transfer | Лучшие цены и мгновенное бронирование',
      description: 'Забронируйте лучший частный трансфер в Вене с Rational Transfer. Сравните цены от всех поставщиков мгновенно, получите анализ в реальном времени и забронируйте поездку за минуты. Профессиональные водители, встреча в аэропорту, бесплатная отмена.',
      keywords: [
        'частный трансфер Вена',
        'трансфер аэропорт Вена',
        'частный трансфер Вена',
        'такси Вена',
        'трансфер аэропорт Вена',
        'бронирование трансфер Вена',
        'частный автомобиль Вена',
        'шофер Вена',
        'трансфер Вена аэропорт',
        'транспорт Вена',
        'ИИ помощник трансфер',
        'сравнение цен трансфер',
        'путешествия Вена',
        'трансферы Австрия'
      ]
    }
  };

  const config = seoConfig[language as keyof typeof seoConfig] || seoConfig.en;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    authors: [{ name: 'Rational Transfer Team' }],
    creator: 'Rational Transfer',
    publisher: 'Rational Transfer',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/',
      languages: {
        'en': '/en',
        'de': '/de',
        'ru': '/ru',
        'fr': '/fr',
        'es': '/es',
        'it': '/it',
        'zh': '/zh',
      },
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: baseUrl,
      siteName: 'Rational Transfer',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Vienna Private Transfer Service - Rational Transfer',
        },
      ],
      locale: language === 'de' ? 'de_AT' : language === 'ru' ? 'ru_RU' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
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
  };
};

export const generatePageSEOMetadata = (
  pageTitle: string,
  pageDescription: string,
  keywords: string[] = [],
  language: string = 'en'
): Metadata => {
  const baseUrl = 'https://transfer-assistant.vercel.app';
  
  return {
    title: `${pageTitle} | Rational Transfer`,
    description: pageDescription,
    keywords: [
      ...keywords,
      'Vienna transfer',
      'private transfer',
      'airport transfer',
      'Vienna transportation'
    ],
    openGraph: {
      title: `${pageTitle} | Rational Transfer`,
      description: pageDescription,
      url: baseUrl,
      siteName: 'Rational Transfer',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      locale: language === 'de' ? 'de_AT' : language === 'ru' ? 'ru_RU' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | Rational Transfer`,
      description: pageDescription,
      images: ['/og-image.jpg'],
    },
  };
};
