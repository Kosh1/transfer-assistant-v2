# 📊 Analytics Events Documentation

## 🎯 Overview
This document describes all analytics events tracked in the Transfer Assistant application using Yandex.Metrika.

## 📈 Event Categories

### 🧭 Navigation Events
| Event Name | Description | Parameters |
|------------|-------------|------------|
| `nav_logo_click` | User clicks on the logo/title | None |
| `nav_privacy_click` | User clicks on Privacy link | None |
| `nav_support_click` | User clicks on Support button | None |

### 💬 Chat Events
| Event Name | Description | Parameters |
|------------|-------------|------------|
| `chat_message_send` | User sends a message | `message_length`, `has_session` |
| `chat_voice_start` | User starts voice recording | None |
| `chat_voice_stop` | User stops voice recording | None |
| `chat_input_focus` | User focuses on input field | None |
| `chat_input_change` | User types in input field | None |

### 🚗 Transfer Events
| Event Name | Description | Parameters |
|------------|-------------|------------|
| `transfer_booking_click` | User clicks Booking.com button | `provider`, `price`, `currency`, `route` |
| `transfer_provider_click` | User clicks provider website button | `provider`, `price`, `currency`, `route` |
| `transfer_rating_view` | User views rating details | `rating_source`, `rating_score`, `rating_count` |
| `transfer_cashback_view` | User views cashback details | `cashback_percentage`, `cashback_description` |
| `transfer_coupon_view` | User views coupon details | `coupon_code`, `coupon_discount` |

### ❓ FAQ Events
| Event Name | Description | Parameters |
|------------|-------------|------------|
| `faq_item_expand` | User expands FAQ item | `faq_id` |
| `faq_item_collapse` | User collapses FAQ item | `faq_id` |

### 🌐 Language Events
| Event Name | Description | Parameters |
|------------|-------------|------------|
| `language_switcher_open` | User opens language switcher | None |
| `language_change` | User changes language | `from_language`, `to_language` |

## 🔧 Implementation Details

### Analytics Setup
- **Counter ID**: 104294341
- **Provider**: Yandex.Metrika
- **Features**: SSR support, webvisor, clickmap, ecommerce, accurate track bounce, track links

### Event Tracking Function
```typescript
trackEvent(eventName: string, eventParams?: Record<string, any>)
```

### Usage Example
```typescript
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics';

// Track a simple event
trackEvent(ANALYTICS_EVENTS.NAV_LOGO_CLICK);

// Track an event with parameters
trackEvent(ANALYTICS_EVENTS.CHAT_MESSAGE_SEND, {
  message_length: 50,
  has_session: true
});
```

## 📊 Event Flow Examples

### User Journey: Transfer Search
1. `chat_input_focus` - User focuses on input
2. `chat_input_change` - User types message
3. `chat_message_send` - User sends message
4. `transfer_booking_click` - User clicks booking button
5. `transfer_rating_view` - User views rating details

### User Journey: Language Change
1. `language_switcher_open` - User opens language menu
2. `language_change` - User selects new language

### User Journey: FAQ Interaction
1. `faq_item_expand` - User expands FAQ item
2. `faq_item_collapse` - User collapses FAQ item

## 🎯 Business Value

### Key Metrics to Track
- **Conversion Rate**: `transfer_booking_click` / `chat_message_send`
- **Engagement**: FAQ interactions, language changes
- **User Behavior**: Voice vs text input usage
- **Content Performance**: Which FAQ items are most viewed

### A/B Testing Opportunities
- Different chat interface designs
- FAQ item ordering
- Language switcher placement
- Transfer result presentation

## 🔍 Debugging

### Check Events in Browser Console
```javascript
// Check if Yandex.Metrika is loaded
console.log(typeof window.ym);

// Manually trigger an event
window.ym(104294341, 'reachGoal', 'test_event');
```

### Common Issues
1. **Events not firing**: Check if `window.ym` is available
2. **SSR issues**: Events only fire on client-side
3. **Parameter validation**: Ensure parameter types match expected format

## 📈 Reporting

### Yandex.Metrika Dashboard
- Navigate to Goals section
- View conversion funnels
- Analyze user behavior flows
- Export data for further analysis

### Custom Reports
- Track conversion from chat to booking
- Monitor language preference changes
- Analyze FAQ engagement patterns
- Measure voice vs text input usage
