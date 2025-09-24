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
} from '@mui/icons-material';
import { TransferData, TransferOption } from '../types';

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
  const handleBookNow = (option: TransferOption) => {
    if (option.bookingUrl && option.bookingUrl !== '#') {
      window.open(option.bookingUrl, '_blank');
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

  const getRatingSourceInfo = (source: string) => {
    const sourceMap: { [key: string]: { name: string; description: string; icon: string } } = {
      'Trustpilot': {
        name: 'Trustpilot',
        description: 'Отзывы клиентов на Trustpilot - независимой платформе отзывов',
        icon: '🟢'
      },
      'TripAdvisor': {
        name: 'TripAdvisor',
        description: 'Рейтинг на TripAdvisor - крупнейшей платформе путешествий',
        icon: '🟡'
      },
      'Google': {
        name: 'Google Reviews',
        description: 'Отзывы в Google - рейтинг на основе отзывов в Google Maps',
        icon: '🔵'
      },
      'Booking.com': {
        name: 'Booking.com',
        description: 'Рейтинг на Booking.com - отзывы гостей о трансферах',
        icon: '🟡'
      }
    };
    
    return sourceMap[source] || {
      name: source,
      description: 'Рейтинг из внешнего источника',
      icon: '⭐'
    };
  };

  const handleRatingClick = (rating: any) => {
    if (rating?.url) {
      window.open(rating.url, '_blank');
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
                        <Typography variant="body2" color="text.secondary">
                          {option.carDetails.description}
                        </Typography>
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
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                  {getRatingSourceInfo(option.rating.source).icon} {getRatingSourceInfo(option.rating.source).name}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {getRatingSourceInfo(option.rating.source).description}
                                </Typography>
                                {option.rating.count && (
                                  <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                                    Основано на {option.rating.count} отзывах
                                  </Typography>
                                )}
                                {option.rating.url ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                    <OpenInNew sx={{ fontSize: 12 }} />
                                    <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                      Нажмите для перехода к источнику
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic', mt: 1 }}>
                                    Источник: {option.rating.source}
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
                              label={`${option.rating.score}/5`} 
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
                          Rating not found
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
                          <Chip 
                            label={`Cashback: ${option.cashback.percentage}%`} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                          No cashback available
                        </Typography>
                      )}

                      {/* Coupons */}
                      {option.coupons && option.coupons.length > 0 ? (
                        <Box sx={{ mb: 1 }}>
                          <Chip 
                            label={`Coupons: ${option.coupons.length} available`} 
                            size="small" 
                            color="info" 
                            variant="outlined"
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No coupons available
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Book Button */}
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={() => handleBookNow(option)}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        }
                      }}
                    >
                      Book Now
                    </Button>
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
