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
      title: t('landing.features.professionalDrivers'),
      description: t('landing.features.professionalDriversDesc'),
    },
    {
      icon: <AirportShuttle />,
      title: t('landing.features.meetGreet'),
      description: t('landing.features.meetGreetDesc'),
    },
    {
      icon: <Security />,
      title: t('landing.features.freeCancellation'),
      description: t('landing.features.freeCancellationDesc'),
    },
    {
      icon: <Support />,
      title: t('landing.features.realTimeTracking'),
      description: t('landing.features.realTimeTrackingDesc'),
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
      title: 'Vienna Airport Transfers',
      description: 'Professional airport transfers from Vienna Airport to city center and surrounding areas',
      keywords: ['Vienna airport transfer', 'airport taxi Vienna', 'Vienna airport pickup'],
    },
    {
      title: 'City Center Transfers',
      description: 'Convenient transfers within Vienna city center for business meetings, events, and sightseeing',
      keywords: ['Vienna city transfer', 'downtown Vienna taxi', 'Vienna business transfer'],
    },
    {
      title: 'Long Distance Transfers',
      description: 'Comfortable transfers to destinations outside Vienna including Salzburg, Graz, and Innsbruck',
      keywords: ['Vienna to Salzburg transfer', 'long distance Vienna transfer', 'Austria transfers'],
    },
    {
      title: 'Event Transfers',
      description: 'Specialized transfers for conferences, weddings, and special events in Vienna',
      keywords: ['Vienna event transfer', 'wedding transfer Vienna', 'conference transfer Vienna'],
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
            Vienna Transfer Services
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
            Why Choose Vienna Private Transfers?
          </Typography>

          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Professional Vienna Transfer Service
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Our AI-powered Vienna transfer service revolutionizes how you book private transfers. 
                Whether you need airport transfers, city center transportation, or long-distance 
                transfers, our intelligent assistant compares prices from all major Vienna transfer 
                providers to find you the best deal.
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                With professional drivers, meet & greet service, and real-time tracking, we ensure 
                your Vienna transfer experience is seamless and stress-free. Book your Vienna private 
                transfer today and experience the future of transportation.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Vienna Airport Transfer Excellence
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Vienna Airport transfers are our specialty. From Vienna International Airport (VIE) 
                to your hotel in the city center, we provide reliable, comfortable, and affordable 
                transfer services. Our AI assistant analyzes your specific needs and finds the perfect 
                transfer option for your Vienna airport journey.
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Whether you&apos;re arriving for business or leisure, our Vienna airport transfer service 
                ensures you reach your destination safely and on time. Book your Vienna airport transfer 
                with confidence and enjoy a stress-free arrival in Austria&apos;s beautiful capital.
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
