import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { LanguageProvider } from '../../hooks/useTranslation';
import { Box } from '@mui/material';
import ThemeProvider from '../../components/ThemeProvider';
import Header from '../../components/Header';
import StructuredData from '../../components/StructuredData';
import { generateSEOMetadata } from '../../lib/seo';
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

const locales = ['en', 'ru', 'fr', 'de', 'es', 'it', 'zh'];

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  
  if (!locales.includes(locale)) {
    return {};
  }

  return generateSEOMetadata(locale);
}

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!locales.includes(locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
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
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider initialLocale={locale}>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
              <Header />
              {children}
            </Box>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
