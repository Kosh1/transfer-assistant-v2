'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  DirectionsCar,
  People,
  Luggage,
  Schedule,
  Star,
  Euro,
  Language,
  OpenInNew,
  Hotel,
} from '@mui/icons-material';
import { TransferData, TransferOption } from '../types';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics';

interface TransferResultsProps {
  transferData: TransferData;
  transferOptions: TransferOption[];
  transferAnalysis: string;
  userLanguage: string;
}

const TransferResults: React.FC<TransferResultsProps> = ({
  transferData,
  transferOptions,
  transferAnalysis,
  userLanguage
}) => {
  // Get Google Place ID for location
  const getLocationId = (location: string): string => {
    if (!location) return '';
    
    const locationLower = location.toLowerCase().trim();
    
    const locationMap: Record<string, string> = {
      // Major Airports
      'vienna airport': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'vienna international airport': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'schwechat airport': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'венский аэропорт': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'аэропорт вены': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'аэропорт': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      
      'geneva airport': 'ChIJN5MjroBkjEcRMKa4TvKpEeU',
      'gva': 'ChIJN5MjroBkjEcRMKa4TvKpEeU',
      
      'innsbruck airport': 'ChIJRdBNVHVrnUcRGT-I40h8Q1k',
      'inn': 'ChIJRdBNVHVrnUcRGT-I40h8Q1k',
      
      'salzburg airport': 'ChIJMUEWmiSQdkcRb5nIVkNvPB4',
      'szg': 'ChIJMUEWmiSQdkcRb5nIVkNvPB4',
      
      'basel airport': 'ChIJQ3OaSAO8kUcRVCoHgGyXib8',
      'bsl': 'ChIJQ3OaSAO8kUcRVCoHgGyXib8',
      
      'grenoble airport': 'ChIJf1xyMojaikcRwz1R6tX-knU',
      'gnb': 'ChIJf1xyMojaikcRwz1R6tX-knU',
      
      // Major Cities
      'vienna city center': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      'vienna city': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      'vienna': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      'вена': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      'венна': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      'wien': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      
      'geneva city': 'ChIJ6-LQkwZljEcRObwLezWVtqA',
      'innsbruck city': 'ChIJc8r44c9unUcRDZsdKH0cIJ0',
      'salzburg city': 'ChIJsdQIqd2adkcRPfcqQaGD4cE',
      'basel city': 'ChIJQ3OaSAO8kUcRVCoHgGyXib8',
      'grenoble city': 'ChIJf1xyMojaikcRwz1R6tX-knU',
      
      // Train Stations
      'vienna hauptbahnhof': 'ChIJUU071tupbUcRyFdx20Nwgqg',
      'vienna main station': 'ChIJUU071tupbUcRyFdx20Nwgqg',
      'hauptbahnhof': 'ChIJUU071tupbUcRyFdx20Nwgqg',
      'вокзал вены': 'ChIJUU071tupbUcRyFdx20Nwgqg',
      'железнодорожный вокзал': 'ChIJUU071tupbUcRyFdx20Nwgqg',
      
      'geneva train station': 'ChIJUU071tupbUcRyFdx20Nwgqg',
      'innsbruck train station': 'ChIJUU071tupbUcRyFdx20Nwgqg',
      'salzburg train station': 'ChIJUU071tupbUcRyFdx20Nwgqg',
      'basel train station': 'ChIJUU071tupbUcRyFdx20Nwgqg',
      'grenoble train station': 'ChIJUU071tupbUcRyFdx20Nwgqg'
    };
    
    return locationMap[locationLower] || '';
  };

  // Get location type (airport, train_station, city)
  const getLocationType = (location: string): string => {
    const locationLower = location.toLowerCase().trim();
    
    if (locationLower.includes('airport') || locationLower.includes('аэропорт')) {
      return 'airport';
    }
    if (locationLower.includes('station') || locationLower.includes('hauptbahnhof') || locationLower.includes('вокзал')) {
      return 'train_station';
    }
    return 'city';
  };

  const handleVisitBooking = (option: TransferOption) => {
    // Track analytics event
    trackEvent(ANALYTICS_EVENTS.TRANSFER_BOOKING_CLICK, {
      provider: option.provider,
      price: option.price.amount,
      currency: option.price.currency,
      route: `${transferData.from} → ${transferData.to}`
    });
    
    // Get Google Place IDs for pickup and dropoff
    const pickupId = getLocationId(transferData.from);
    const dropoffId = getLocationId(transferData.to);
    
    // Get location types
    const pickupType = getLocationType(transferData.from);
    const dropoffType = getLocationType(transferData.to);
    
    // Generate Booking.com search URL with all parameters
    const searchParams = new URLSearchParams({
      'date': transferData.date,
      'passengers': transferData.passengers.toString(),
      'time': transferData.time,
      'lang': transferData.language || userLanguage || 'en',
      'currency': 'EUR',
      'aid': '304142',
      'label': 'gen173nr-10Egp0YXhpLWluZGV4KIICOOgHSAlYBGipAYgBAZgBM7gBB8gBDNgBA-gBAfgBAYgCAagCAbgCna7axgbAAgHSAiQ3OTA4ZGYxNy1mZTQyLTQ3NjQtYTBjOS1iNDI5ZTRlNTU2ZjjYAgHgAgE'
    });
    
    // Add pickup and dropoff if we have valid Place IDs
    if (pickupId) {
      searchParams.set('pickup', pickupId);
      searchParams.set('pickupType', pickupType);
    }
    if (dropoffId) {
      searchParams.set('dropoff', dropoffId);
      searchParams.set('dropoffType', dropoffType);
    }
    
    // Add additional parameters
    searchParams.set('comments', 'p2OLplgP6kqBccWQK722tg');
    searchParams.set('preSelectedResultReference', '1');
    
    const bookingSearchUrl = `https://taxis.booking.com/search/?${searchParams.toString()}`;
    window.open(bookingSearchUrl, '_blank');
  };

  const handleVisitWebsite = (option: TransferOption) => {
    if (option.website && option.website !== '#') {
      // Track analytics event
      trackEvent(ANALYTICS_EVENTS.TRANSFER_PROVIDER_CLICK, {
        provider: option.provider,
        price: option.price.amount,
        currency: option.price.currency,
        route: `${transferData.from} → ${transferData.to}`
      });
      
      window.open(option.website, '_blank');
    }
  };


  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getRatingColor = (rating: string | null) => {
    if (!rating) return 'default';
    const numRating = parseFloat(rating);
    if (numRating >= 4.5) return 'success';
    if (numRating >= 4.0) return 'primary';
    if (numRating >= 3.0) return 'warning';
    return 'error';
  };

  const getTranslation = (key: string, params: Record<string, string> = {}) => {
    const translations: { [key: string]: { [lang: string]: string } } = {
      'ratingBasedOn': {
        'en': `Based on ${params.count} reviews`,
        'ru': `Основано на ${params.count} отзывах`,
        'fr': `Basé sur ${params.count} avis`,
        'es': `Basado en ${params.count} reseñas`,
        'de': `Basierend auf ${params.count} Bewertungen`,
        'it': `Basato su ${params.count} recensioni`,
        'zh': `基于 ${params.count} 条评论`
      },
      'otherRatings': {
        'en': `Other ratings (${params.count}):`,
        'ru': `Другие рейтинги (${params.count}):`,
        'fr': `Autres notes (${params.count}):`,
        'es': `Otras calificaciones (${params.count}):`,
        'de': `Andere Bewertungen (${params.count}):`,
        'it': `Altre valutazioni (${params.count}):`,
        'zh': `其他评分 (${params.count}):`
      },
      'clickToVisit': {
        'en': 'Click to visit source',
        'ru': 'Нажмите для перехода к источнику',
        'fr': 'Cliquez pour visiter la source',
        'es': 'Haga clic para visitar la fuente',
        'de': 'Klicken Sie, um die Quelle zu besuchen',
        'it': 'Clicca per visitare la fonte',
        'zh': '点击访问来源'
      },
      'visitSource': {
        'en': 'Visit source',
        'ru': 'Перейти к источнику',
        'fr': 'Visiter la source',
        'es': 'Visitar fuente',
        'de': 'Quelle besuchen',
        'it': 'Visita fonte',
        'zh': '访问来源'
      },
      'source': {
        'en': `Source: ${params.source}`,
        'ru': `Источник: ${params.source}`,
        'fr': `Source: ${params.source}`,
        'es': `Fuente: ${params.source}`,
        'de': `Quelle: ${params.source}`,
        'it': `Fonte: ${params.source}`,
        'zh': `来源: ${params.source}`
      },
      'ratingFrom': {
        'en': `Rating from ${params.source}`,
        'ru': `Рейтинг с ${params.source}`,
        'fr': `Note de ${params.source}`,
        'es': `Calificación de ${params.source}`,
        'de': `Bewertung von ${params.source}`,
        'it': `Valutazione da ${params.source}`,
        'zh': `来自 ${params.source} 的评分`
      },
      'top': {
        'en': 'Top',
        'ru': 'Топ',
        'fr': 'Top',
        'es': 'Top',
        'de': 'Top',
        'it': 'Top',
        'zh': '顶级'
      },
      'high': {
        'en': 'High',
        'ru': 'Высокий',
        'fr': 'Élevé',
        'es': 'Alto',
        'de': 'Hoch',
        'it': 'Alto',
        'zh': '高'
      },
      'cashbackOffers': {
        'en': 'Cashback Offers',
        'ru': 'Кэшбек предложения',
        'fr': 'Offres de cashback',
        'es': 'Ofertas de cashback',
        'de': 'Cashback-Angebote',
        'it': 'Offerte di cashback',
        'zh': '返现优惠'
      },
      'cashback': {
        'en': 'cashback',
        'ru': 'кэшбек',
        'fr': 'cashback',
        'es': 'cashback',
        'de': 'Cashback',
        'it': 'cashback',
        'zh': '返现'
      },
      'cashbackLabel': {
        'en': 'Cashback',
        'ru': 'Кэшбек',
        'fr': 'Cashback',
        'es': 'Cashback',
        'de': 'Cashback',
        'it': 'Cashback',
        'zh': '返现'
      },
      'noCashback': {
        'en': 'No cashback available',
        'ru': 'Кэшбек недоступен',
        'fr': 'Aucun cashback disponible',
        'es': 'No hay cashback disponible',
        'de': 'Kein Cashback verfügbar',
        'it': 'Nessun cashback disponibile',
        'zh': '无返现可用'
      },
      'couponsDiscounts': {
        'en': 'Coupons & Discounts',
        'ru': 'Купоны и скидки',
        'fr': 'Coupons et réductions',
        'es': 'Cupones y descuentos',
        'de': 'Gutscheine und Rabatte',
        'it': 'Coupon e sconti',
        'zh': '优惠券和折扣'
      },
      'coupons': {
        'en': 'Coupons',
        'ru': 'Купоны',
        'fr': 'Coupons',
        'es': 'Cupones',
        'de': 'Gutscheine',
        'it': 'Coupon',
        'zh': '优惠券'
      },
      'available': {
        'en': 'available',
        'ru': 'доступно',
        'fr': 'disponible',
        'es': 'disponible',
        'de': 'verfügbar',
        'it': 'disponibile',
        'zh': '可用'
      },
      'noCoupons': {
        'en': 'No coupons available',
        'ru': 'Купоны недоступны',
        'fr': 'Aucun coupon disponible',
        'es': 'No hay cupones disponibles',
        'de': 'Keine Gutscheine verfügbar',
        'it': 'Nessun coupon disponibile',
        'zh': '无优惠券可用'
      },
      'conditions': {
        'en': 'Conditions',
        'ru': 'Условия',
        'fr': 'Conditions',
        'es': 'Condiciones',
        'de': 'Bedingungen',
        'it': 'Condizioni',
        'zh': '条件'
      },
      'ratingNotFound': {
        'en': 'Rating not found',
        'ru': 'Рейтинг не найден',
        'fr': 'Note non trouvée',
        'es': 'Calificación no encontrada',
        'de': 'Bewertung nicht gefunden',
        'it': 'Valutazione non trovata',
        'zh': '未找到评分'
      }
    };

    return translations[key]?.[userLanguage] || translations[key]?.['en'] || key;
  };

  const getRatingSourceInfo = (source: string) => {
    const sourceMap: { [key: string]: { name: string; description: string; icon: string; priority: number } } = {
      'Trustpilot': {
        name: 'Trustpilot',
        description: getTranslation('ratingFrom', { source: 'Trustpilot' }),
        icon: '🟢',
        priority: 1
      },
      'TripAdvisor': {
        name: 'TripAdvisor',
        description: getTranslation('ratingFrom', { source: 'TripAdvisor' }),
        icon: '🟡',
        priority: 2
      },
      'Google': {
        name: 'Google Reviews',
        description: getTranslation('ratingFrom', { source: 'Google' }),
        icon: '🔵',
        priority: 3
      },
      'Booking.com': {
        name: 'Booking.com',
        description: getTranslation('ratingFrom', { source: 'Booking.com' }),
        icon: '🟡',
        priority: 3
      }
    };
    
    return sourceMap[source] || {
      name: source,
      description: getTranslation('ratingFrom', { source }),
      icon: '⭐',
      priority: 4
    };
  };

  const handleRatingClick = (rating: any) => {
    if (rating?.url) {
      // Track analytics event
      trackEvent(ANALYTICS_EVENTS.TRANSFER_RATING_VIEW, {
        rating_source: rating.source,
        rating_score: rating.score,
        rating_count: rating.count
      });
      
      window.open(rating.url, '_blank');
    }
  };

  const handleCouponClick = (coupon: any) => {
    if (coupon?.url) {
      // Track analytics event
      trackEvent(ANALYTICS_EVENTS.TRANSFER_COUPON_VIEW, {
        coupon_code: coupon.code,
        coupon_discount: coupon.discount
      });
      
      window.open(coupon.url, '_blank');
    }
  };

  const handleCashbackClick = (cashback: any) => {
    if (cashback?.url) {
      // Track analytics event
      trackEvent(ANALYTICS_EVENTS.TRANSFER_CASHBACK_VIEW, {
        cashback_percentage: cashback.percentage,
        cashback_description: cashback.description
      });
      
      window.open(cashback.url, '_blank');
    }
  };

  return (
    <Box sx={{ mb: 6 }}>
      {/* Transfer Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Transfer Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCar sx={{ fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Route
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {transferData.from} → {transferData.to}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People sx={{ fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Passengers
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {transferData.passengers}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Luggage sx={{ fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Luggage
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {transferData.luggage} pieces
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Date & Time
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {transferData.date} at {transferData.time}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>


      {/* Transfer Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Available Transfer Options
        </Typography>
        
        <Grid container spacing={3}>
          {transferOptions.map((option, index) => (
            <Grid item xs={12} md={6} lg={4} key={option.rank}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    }
                  }}
                >
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {option.provider}
                        </Typography>
                        {option.carDetails.carExample && option.carDetails.carExample !== 'Standard Model' && (
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500, mt: 0.5 }}>
                            {option.carDetails.carExample}
                          </Typography>
                        )}
                        {option.carDetails.carDescription && option.carDetails.carDescription !== 'Standard Vehicle' && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {option.carDetails.carDescription}
                          </Typography>
                        )}
                      </Box>
                      <Chip 
                        label={`#${option.rank}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>

                    {/* Price */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatPrice(option.price.amount, option.price.currency)}
                      </Typography>
                      {option.price.originalAmount && option.price.originalAmount > option.price.amount && (
                        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                          {formatPrice(option.price.originalAmount, option.price.currency)}
                        </Typography>
                      )}
                    </Box>

                    {/* Details */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Up to {option.carDetails.capacity} passengers
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Luggage sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {option.carDetails.luggage} luggage pieces
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {option.duration}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Rating Section */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                        ⭐ Rating
                      </Typography>
                      {option.rating ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                          <Tooltip
                            title={
                              <Box sx={{ p: 1 }}>
                                {/* Основной рейтинг */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {getRatingSourceInfo(option.rating.source).icon} {getRatingSourceInfo(option.rating.source).name}
                                  </Typography>
                                  {getRatingSourceInfo(option.rating.source).priority <= 2 && (
                                    <Chip 
                                      label={getRatingSourceInfo(option.rating.source).priority === 1 
                                        ? getTranslation('top')
                                        : getTranslation('high')
                                      } 
                                      size="small" 
                                      color={getRatingSourceInfo(option.rating.source).priority === 1 ? 'success' : 'primary'}
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem', height: 20 }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {getRatingSourceInfo(option.rating.source).description}
                                </Typography>
                                {option.rating.count && (
                                  <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                                    {getTranslation('ratingBasedOn', { count: option.rating.count.toString() })}
                                  </Typography>
                                )}
                                
                                {/* Дополнительные рейтинги */}
                                {option.allRatings && option.allRatings.length > 1 && (
                                  <>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                                      {getTranslation('otherRatings', { count: (option.allRatings.length - 1).toString() })}
                                    </Typography>
                                    {option.allRatings
                                      .filter(r => r.source !== option.rating?.source)
                                      .map((rating, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                          <Typography variant="caption" sx={{ minWidth: 60 }}>
                                            {getRatingSourceInfo(rating.source).icon} {rating.source}:
                                          </Typography>
                                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                            {rating.score}/5
                                          </Typography>
                                          {rating.count && (
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                              ({rating.count})
                                            </Typography>
                                          )}
                                        </Box>
                                      ))
                                    }
                                  </>
                                )}
                                
                                {option.rating.url ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                    <OpenInNew sx={{ fontSize: 12 }} />
                                    <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                      {getTranslation('clickToVisit')}
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic', mt: 1 }}>
                                    {getTranslation('source', { source: option.rating.source })}
                                  </Typography>
                                )}
                              </Box>
                            }
                            arrow
                            placement="top"
                            componentsProps={{
                              tooltip: {
                                sx: {
                                  maxWidth: 300,
                                  bgcolor: 'grey.900',
                                  '& .MuiTooltip-arrow': {
                                    color: 'grey.900',
                                  },
                                },
                              },
                            }}
                          >
                            <Chip 
                              label={
                                option.allRatings && option.allRatings.length > 1
                                  ? `${option.rating.score}/5 +${option.allRatings.length - 1}`
                                  : `${option.rating.score}/5`
                              }
                              size="small" 
                              color={getRatingColor(option.rating.score.toString())}
                              variant="outlined"
                              clickable
                              onClick={() => handleRatingClick(option.rating)}
                              sx={{
                                cursor: option.rating?.url ? 'pointer' : 'default',
                                '&:hover': option.rating?.url ? {
                                  transform: 'scale(1.05)',
                                  transition: 'transform 0.2s ease-in-out',
                                } : {},
                                opacity: option.rating?.url ? 1 : 0.8,
                              }}
                            />
                          </Tooltip>
                          {option.rating.count && (
                            <Typography variant="caption" color="text.secondary">
                              ({option.rating.count} reviews)
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {getTranslation('ratingNotFound')}
                        </Typography>
                      )}
                    </Box>

                    {/* Cashback & Coupons Section */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                        💰 Offers
                      </Typography>
                      
                      {/* Cashback */}
                      {option.cashback ? (
                        <Box sx={{ mb: 1 }}>
                          <Tooltip
                            title={
                              <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                  💰 {getTranslation('cashbackOffers')}
                                </Typography>
                                {option.allCashback && option.allCashback.length > 0 ? (
                                  option.allCashback.map((cashback, index) => (
                                    <Box key={index} sx={{ mb: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {cashback.percentage} {getTranslation('cashback')}
                                        </Typography>
                                        {cashback.url && (
                                          <Button
                                            size="small"
                                            startIcon={<OpenInNew />}
                                            onClick={() => window.open(cashback.url, '_blank')}
                                            sx={{ 
                                              minWidth: 'auto', 
                                              p: 0.5,
                                              color: 'primary.light',
                                              '&:hover': { color: 'primary.main' }
                                            }}
                                          >
                                            {getTranslation('visitSource')}
                                          </Button>
                                        )}
                                      </Box>
                                      {cashback.description && (
                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                          {cashback.description}
                                        </Typography>
                                      )}
                                    </Box>
                                  ))
                                ) : (
                                  <Typography variant="body2">
                                    {option.cashback.percentage}% {userLanguage === 'ru' ? 'кэшбек' : 'cashback'}
                                  </Typography>
                                )}
                              </Box>
                            }
                            arrow
                            placement="top"
                            componentsProps={{
                              tooltip: {
                                sx: {
                                  maxWidth: 300,
                                  bgcolor: 'grey.900',
                                  '& .MuiTooltip-arrow': {
                                    color: 'grey.900',
                                  },
                                },
                              },
                            }}
                          >
                            <Chip 
                              label={
                                option.allCashback && option.allCashback.length > 1
                                  ? `${getTranslation('cashbackLabel')}: ${option.cashback.percentage} +${option.allCashback.length - 1}`
                                  : `${getTranslation('cashbackLabel')}: ${option.cashback.percentage}`
                              }
                              size="small" 
                              color="success" 
                              variant="outlined"
                              sx={{ mr: 1 }}
                              clickable
                              onClick={() => {
                                // Если есть URL у первого кэшбека, открываем его
                                if (option.allCashback && option.allCashback.length > 0 && option.allCashback[0].url) {
                                  handleCashbackClick(option.allCashback[0]);
                                }
                              }}
                            />
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                          {getTranslation('noCashback')}
                        </Typography>
                      )}

                      {/* Coupons */}
                      {option.coupons && option.coupons.length > 0 ? (
                        <Box sx={{ mb: 1 }}>
                          <Tooltip
                            title={
                              <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                  🎫 {getTranslation('couponsDiscounts')}
                                </Typography>
                                {option.allCoupons && option.allCoupons.length > 0 ? (
                                  option.allCoupons.map((coupon, index) => (
                                    <Box key={index} sx={{ mb: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {coupon.code}: {coupon.discount}
                                        </Typography>
                                        {coupon.url && (
                                          <Button
                                            size="small"
                                            startIcon={<OpenInNew />}
                                            onClick={() => window.open(coupon.url, '_blank')}
                                            sx={{ 
                                              minWidth: 'auto', 
                                              p: 0.5,
                                              color: 'primary.light',
                                              '&:hover': { color: 'primary.main' }
                                            }}
                                          >
                                            {getTranslation('visitSource')}
                                          </Button>
                                        )}
                                      </Box>
                                      {coupon.description && (
                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                          {coupon.description}
                                        </Typography>
                                      )}
                                      {coupon.conditions && (
                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontStyle: 'italic' }}>
                                          {getTranslation('conditions')}: {coupon.conditions}
                                        </Typography>
                                      )}
                                    </Box>
                                  ))
                                ) : (
                                  <Typography variant="body2">
                                    {option.coupons.length} {getTranslation('coupons')} {getTranslation('available')}
                                  </Typography>
                                )}
                              </Box>
                            }
                            arrow
                            placement="top"
                            componentsProps={{
                              tooltip: {
                                sx: {
                                  maxWidth: 300,
                                  bgcolor: 'grey.900',
                                  '& .MuiTooltip-arrow': {
                                    color: 'grey.900',
                                  },
                                },
                              },
                            }}
                          >
                            <Chip 
                              label={
                                option.allCoupons && option.allCoupons.length > 1
                                  ? `${getTranslation('coupons')}: ${option.coupons.length} +${option.allCoupons.length - option.coupons.length}`
                                  : `${getTranslation('coupons')}: ${option.coupons.length} ${getTranslation('available')}`
                              }
                              size="small" 
                              color="info" 
                              variant="outlined"
                              clickable
                              onClick={() => {
                                // Если есть URL у первого купона, открываем его
                                if (option.allCoupons && option.allCoupons.length > 0 && option.allCoupons[0].url) {
                                  handleCouponClick(option.allCoupons[0]);
                                }
                              }}
                            />
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {getTranslation('noCoupons')}
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                      {/* Booking.com Button */}
                      {option.bookingUrl && option.bookingUrl !== '#' && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleVisitBooking(option)}
                          startIcon={<Hotel />}
                          sx={{
                            py: 0.5,
                            px: 2,
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            background: 'linear-gradient(135deg, #003580 0%, #0047ab 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #002a5c 0%, #003d8f 100%)',
                            }
                          }}
                        >
                          Booking.com
                        </Button>
                      )}
                      
                      {/* Provider Website Button */}
                      {option.website && option.website !== '#' && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleVisitWebsite(option)}
                          startIcon={<OpenInNew />}
                          sx={{
                            py: 0.5,
                            px: 2,
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            borderColor: '#667eea',
                            color: '#667eea',
                            '&:hover': {
                              borderColor: '#5a6fd8',
                              backgroundColor: 'rgba(102, 126, 234, 0.04)',
                            }
                          }}
                        >
                          Provider Site
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Box>
  );
};

export default TransferResults;
