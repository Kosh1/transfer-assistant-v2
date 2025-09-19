import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { generateSEOMetadata } from '../../lib/seo';

export const metadata = generateSEOMetadata();

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link href="/" color="inherit">
              {t('breadcrumbs.home')}
            </Link>
            <Typography color="text.primary">
              {t('breadcrumbs.privacy')}
            </Typography>
          </Breadcrumbs>

          {/* Main Content */}
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('privacy.title')}
              </Typography>

              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                {t('privacy.lastUpdated')}
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {t('privacy.section1.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                  {t('privacy.section1.content')}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {t('privacy.section2.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                  {t('privacy.section2.content')}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {t('privacy.section3.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                  {t('privacy.section3.content')}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {t('privacy.section4.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                  {t('privacy.section4.content')}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {t('privacy.section5.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                  {t('privacy.section5.content')}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {t('privacy.section6.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                  {t('privacy.section6.content')}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {t('privacy.section7.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                  {t('privacy.section7.content')}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {t('privacy.section8.title')}
                </Typography>
                <Typography variant="body1" paragraph>
                  {t('privacy.section8.content')}
                </Typography>
              </Box>

              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('privacy.contact')}
                </Typography>
              </Box>
            </motion.div>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PrivacyPage;
