// Analytics utility for Yandex.Metrika
declare global {
  interface Window {
    ym: (counterId: number, action: string, ...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(104294341, 'reachGoal', eventName, eventParams);
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(104294341, 'hit', url);
  }
};

// Predefined event names
export const ANALYTICS_EVENTS = {
  // Navigation events
  NAV_LOGO_CLICK: 'nav_logo_click',
  NAV_PRIVACY_CLICK: 'nav_privacy_click',
  
  // Chat events
  CHAT_MESSAGE_SEND: 'chat_message_send',
  CHAT_VOICE_START: 'chat_voice_start',
  CHAT_VOICE_STOP: 'chat_voice_stop',
  CHAT_INPUT_FOCUS: 'chat_input_focus',
  CHAT_INPUT_CHANGE: 'chat_input_change',
  
  // Transfer events
  TRANSFER_OPTION_CLICK: 'transfer_option_click',
  TRANSFER_BOOKING_CLICK: 'transfer_booking_click',
  TRANSFER_PROVIDER_CLICK: 'transfer_provider_click',
  TRANSFER_RATING_VIEW: 'transfer_rating_view',
  TRANSFER_CASHBACK_VIEW: 'transfer_cashback_view',
  TRANSFER_COUPON_VIEW: 'transfer_coupon_view',
  
  // FAQ events
  FAQ_ITEM_EXPAND: 'faq_item_expand',
  FAQ_ITEM_COLLAPSE: 'faq_item_collapse',
  
  // Language events
  LANGUAGE_SWITCHER_OPEN: 'language_switcher_open',
  LANGUAGE_CHANGE: 'language_change',
} as const;
