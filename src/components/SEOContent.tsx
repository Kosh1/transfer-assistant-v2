'use client';

import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  Star,
  Security,
  Speed,
  Support,
  LocalTaxi,
  AirportShuttle,
  BusinessCenter,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';

const SEOContent: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <LocalTaxi />,
      title: t('landing.features.aiPowered'),
      description: t('landing.features.aiPoweredDesc'),
    },
    {
      icon: <Speed />,
      title: t('landing.features.instantComparison'),
      description: t('landing.features.instantComparisonDesc'),
    },
    {
      icon: <Star />,
      title: t('landing.features.providerRatings'),
      description: t('landing.features.providerRatingsDesc'),
    },
    {
      icon: <AirportShuttle />,
      title: t('landing.features.cashbackOptions'),
      description: t('landing.features.cashbackOptionsDesc'),
    },
    {
      icon: <Security />,
      title: t('landing.features.freeService'),
      description: t('landing.features.freeServiceDesc'),
    },
    {
      icon: <Support />,
      title: t('landing.features.directBooking'),
      description: t('landing.features.directBookingDesc'),
    },
  ];

  const benefits = [
    t('landing.benefits.benefit1'),
    t('landing.benefits.benefit2'),
    t('landing.benefits.benefit3'),
    t('landing.benefits.benefit4'),
    t('landing.benefits.benefit5'),
    t('landing.benefits.benefit6'),
  ];

  const transferTypes = [
    {
      title: 'Vienna Airport Transfer Search',
      description: 'We search for the cheapest transfer options between Vienna city and Vienna Airport (both directions)',
      keywords: ['Vienna airport transfer search', 'Vienna airport transfer comparison', 'cheapest Vienna airport transfer'],
    },
    {
      title: 'Transfer Price Comparison',
      description: 'Compare prices from multiple transfer providers to find the best deals and save money',
      keywords: ['Vienna transfer price comparison', 'transfer price search Vienna', 'cheapest transfer Vienna'],
    },
    {
      title: 'Provider Ratings & Reviews',
      description: 'See ratings and reviews for each transfer provider to make informed booking decisions',
      keywords: ['Vienna transfer provider ratings', 'transfer company reviews Vienna', 'best transfer provider Vienna'],
    },
    {
      title: 'Cashback & Coupon Search',
      description: 'Find transfer providers offering cashback, discounts, and special coupons for additional savings',
      keywords: ['Vienna transfer cashback', 'transfer coupons Vienna', 'discount transfer Vienna'],
    },
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 6,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('landing.features.title')}
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                          color: 'primary.main',
                        }}
                      >
                        {feature.icon}
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{ ml: 1, fontWeight: 600 }}
                        >
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.section>

        {/* Benefits Section */}
        <Box sx={{ mt: 12 }}>
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
          <Typography
            variant="h2"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('landing.benefits.title')}
          </Typography>
          <Typography
            variant="h5"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            {t('landing.benefits.subtitle')}
          </Typography>

          <Grid container spacing={3}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <CheckCircle color="success" sx={{ mr: 2 }} />
                    <Typography variant="body1">{benefit}</Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          </motion.section>
        </Box>

        {/* Transfer Types Section */}
        <Box sx={{ mt: 12 }}>
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
          <Typography
            variant="h2"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 6,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Vienna Transfer Search Services
          </Typography>

          <Grid container spacing={4}>
            {transferTypes.map((type, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Typography
                        variant="h5"
                        component="h3"
                        gutterBottom
                        sx={{ fontWeight: 600, mb: 2 }}
                      >
                        {type.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        {type.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {type.keywords.map((keyword, keywordIndex) => (
                          <Chip
                            key={keywordIndex}
                            label={keyword}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          </motion.section>
        </Box>

        {/* SEO Content Section */}
        <Box sx={{ mt: 12 }}>
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
          <Typography
            variant="h2"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 6,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Vienna Transfer Search Service
          </Typography>

          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                How Our Search Service Works
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                We search for the cheapest transfer providers on the Vienna - Vienna Airport route, 
                compare their prices, ratings, and cashback options. Our AI-powered service finds 
                the best deals from multiple providers in just 15 minutes, completely free of charge.
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                We don&apos;t provide transfer services ourselves - we only help you find and compare 
                options from other providers. You then book directly on the provider&apos;s website 
                for the best prices and service.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Vienna Airport Transfer Search
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Our service specializes in finding the best Vienna Airport transfer options. 
                We search both directions: from Vienna city to Vienna International Airport (VIE) 
                and from the airport to Vienna city center. We show you all available options 
                with their prices, ratings, and special offers.
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Currently we only cover transfers between Vienna and Vienna Airport. Our free 
                search service helps you find the cheapest and most reliable transfer options 
                for your Vienna airport journey.
              </Typography>
            </Grid>
          </Grid>
          </motion.section>
        </Box>
      </Container>
    </Box>
  );
};

export default SEOContent;
