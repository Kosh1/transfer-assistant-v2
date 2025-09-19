'use client';

import React from 'react';

interface StructuredDataProps {
  type: 'Organization' | 'Service' | 'WebSite' | 'FAQPage';
  data: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const getStructuredData = () => {
    switch (type) {
      case 'Organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Transfer Assistant",
          "description": "AI-powered private transfer assistant for Vienna",
          "url": "https://transfer-assistant.vercel.app",
          "logo": "https://transfer-assistant.vercel.app/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+43-1-234-5678",
            "contactType": "customer service",
            "availableLanguage": ["English", "German", "Russian", "French", "Spanish", "Italian", "Chinese"]
          },
          "sameAs": [
            "https://twitter.com/transferassistant",
            "https://facebook.com/transferassistant"
          ]
        };

      case 'Service':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Vienna Private Transfer Service",
          "description": "AI-powered private transfer service for Vienna with real-time price comparison and instant booking",
          "provider": {
            "@type": "Organization",
            "name": "Transfer Assistant"
          },
          "serviceType": "Transportation Service",
          "areaServed": {
            "@type": "City",
            "name": "Vienna",
            "containedInPlace": {
              "@type": "Country",
              "name": "Austria"
            }
          },
          "offers": {
            "@type": "Offer",
            "description": "Private transfer service with AI-powered price comparison",
            "priceRange": "€25-€150",
            "availability": "24/7"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Vienna Transfer Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Airport Transfer",
                  "description": "Private transfer from Vienna Airport to city center"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "City Transfer",
                  "description": "Private transfer within Vienna city"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Long Distance Transfer",
                  "description": "Private transfer to destinations outside Vienna"
                }
              }
            ]
          }
        };

      case 'WebSite':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Transfer Assistant",
          "url": "https://transfer-assistant.vercel.app",
          "description": "AI-powered private transfer assistant for Vienna",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://transfer-assistant.vercel.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Transfer Assistant"
          }
        };

      case 'FAQPage':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How do I book a transfer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Simply tell me your travel details and I'll find the best transfer options for you. You can then book directly through the provider's website."
              }
            },
            {
              "@type": "Question",
              "name": "What is included in the price?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The price includes the transfer service, professional driver, and vehicle. Additional services like meet & greet may be included depending on the provider."
              }
            },
            {
              "@type": "Question",
              "name": "Can I cancel my booking?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most providers offer free cancellation up to 24 hours before your transfer. Check the specific cancellation policy for each option."
              }
            },
            {
              "@type": "Question",
              "name": "How do I get cashback?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Some providers offer cashback when booking through our platform. Look for the cashback percentage displayed on each option."
              }
            }
          ]
        };

      default:
        return data;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData(), null, 2)
      }}
    />
  );
};

export default StructuredData;
