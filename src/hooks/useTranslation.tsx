'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TranslationContextType {
  t: (key: string) => string;
  language: string;
  setLanguage: (lang: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Simplified translations
const translations = {
  en: {
    'landing.title': 'Vienna Transfer Assistant',
    'landing.subtitle': 'AI-powered private transfer assistant for Vienna. Find the best transfer options with real-time price comparison.',
    'chat.placeholder': 'Tell me about your transfer needs...',
    'chat.welcome': 'Hello! I\'m your transfer assistant. Tell me about your transfer needs - where you\'re going, when, how many people, etc. I\'ll help you find the best options!',
    'faq.title': 'Frequently Asked Questions',
    'faq.question1': 'How does the transfer booking work?',
    'faq.answer1': 'Simply tell our AI assistant about your transfer needs - where you\'re going, when, how many people, and luggage. We\'ll find the best options for you.',
    'faq.question2': 'What types of vehicles are available?',
    'faq.answer2': 'We offer various vehicle types including standard cars, executive sedans, minivans, and buses depending on your group size and preferences.',
    'faq.question3': 'How do I book a transfer?',
    'faq.answer3': 'Once you\'ve selected your preferred option, you\'ll be redirected to the provider\'s booking page where you can complete your reservation.',
  },
  ru: {
    'landing.title': 'Помощник по трансферам в Вене',
    'landing.subtitle': 'ИИ-помощник для частных трансферов в Вене. Найдите лучшие варианты трансферов с сравнением цен в реальном времени.',
    'chat.placeholder': 'Расскажите о ваших потребностях в трансфере...',
    'chat.welcome': 'Привет! Я ваш помощник по трансферам. Расскажите мне о ваших потребностях в трансфере - куда вы едете, когда, сколько человек и т.д. Я помогу найти лучшие варианты!',
    'faq.title': 'Часто задаваемые вопросы',
    'faq.question1': 'Как работает бронирование трансфера?',
    'faq.answer1': 'Просто расскажите нашему ИИ-помощнику о ваших потребностях в трансфере - куда вы едете, когда, сколько человек и багажа. Мы найдем лучшие варианты для вас.',
    'faq.question2': 'Какие типы автомобилей доступны?',
    'faq.answer2': 'Мы предлагаем различные типы автомобилей, включая стандартные автомобили, представительские седаны, минивэны и автобусы в зависимости от размера вашей группы и предпочтений.',
    'faq.question3': 'Как забронировать трансфер?',
    'faq.answer3': 'После выбора предпочтительного варианта вы будете перенаправлены на страницу бронирования поставщика, где сможете завершить бронирование.',
  },
  de: {
    'landing.title': 'Wien Transfer Assistent',
    'landing.subtitle': 'KI-gestützter privater Transfer-Assistent für Wien. Finden Sie die besten Transfer-Optionen mit Echtzeit-Preisvergleich.',
    'chat.placeholder': 'Erzählen Sie mir von Ihren Transfer-Bedürfnissen...',
    'chat.welcome': 'Hallo! Ich bin Ihr Transfer-Assistent. Erzählen Sie mir von Ihren Transfer-Bedürfnissen - wohin Sie fahren, wann, wie viele Personen, etc. Ich helfe Ihnen, die besten Optionen zu finden!',
    'faq.title': 'Häufig gestellte Fragen',
    'faq.question1': 'Wie funktioniert die Transfer-Buchung?',
    'faq.answer1': 'Erzählen Sie einfach unserem KI-Assistenten von Ihren Transfer-Bedürfnissen - wohin Sie fahren, wann, wie viele Personen und Gepäck. Wir finden die besten Optionen für Sie.',
    'faq.question2': 'Welche Fahrzeugtypen sind verfügbar?',
    'faq.answer2': 'Wir bieten verschiedene Fahrzeugtypen an, einschließlich Standardautos, Executive-Limousinen, Minivans und Busse, je nach Gruppengröße und Vorlieben.',
    'faq.question3': 'Wie buche ich einen Transfer?',
    'faq.answer3': 'Nach der Auswahl Ihrer bevorzugten Option werden Sie zur Buchungsseite des Anbieters weitergeleitet, wo Sie Ihre Reservierung abschließen können.',
  },
  fr: {
    'landing.title': 'Assistant Transfer Vienne',
    'landing.subtitle': 'Assistant de transfert privé alimenté par IA pour Vienne. Trouvez les meilleures options de transfert avec comparaison de prix en temps réel.',
    'chat.placeholder': 'Parlez-moi de vos besoins de transfert...',
    'chat.welcome': 'Bonjour ! Je suis votre assistant de transfert. Parlez-moi de vos besoins de transfert - où vous allez, quand, combien de personnes, etc. Je vous aiderai à trouver les meilleures options !',
    'faq.title': 'Questions fréquemment posées',
    'faq.question1': 'Comment fonctionne la réservation de transfert ?',
    'faq.answer1': 'Parlez simplement à notre assistant IA de vos besoins de transfert - où vous allez, quand, combien de personnes et de bagages. Nous trouverons les meilleures options pour vous.',
    'faq.question2': 'Quels types de véhicules sont disponibles ?',
    'faq.answer2': 'Nous proposons différents types de véhicules, y compris des voitures standard, des berlines executive, des minivans et des bus selon la taille de votre groupe et vos préférences.',
    'faq.question3': 'Comment réserver un transfert ?',
    'faq.answer3': 'Une fois que vous avez sélectionné votre option préférée, vous serez redirigé vers la page de réservation du fournisseur où vous pourrez finaliser votre réservation.',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (translations[browserLang as keyof typeof translations]) {
      setLanguage(browserLang);
    }
  }, []);

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
