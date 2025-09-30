'use client';

import React from 'react';

interface HreflangTagsProps {
  currentLocale: string;
  baseUrl?: string;
}

const HreflangTags: React.FC<HreflangTagsProps> = ({ 
  currentLocale, 
  baseUrl = 'https://transfer-assistant.vercel.app' 
}) => {
  const locales = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ru', name: 'Русский' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'it', name: 'Italiano' },
    { code: 'zh', name: '中文' }
  ];

  return (
    <>
      {locales.map((locale) => (
        <link
          key={locale.code}
          rel="alternate"
          hrefLang={locale.code}
          href={`${baseUrl}/${locale.code}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}/en`}
      />
    </>
  );
};

export default HreflangTags;
