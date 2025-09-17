'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();
  
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'transparent',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        color: 'text.primary'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCarIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography
                variant="h6"
                component="a"
                href="/"
                sx={{
                  color: 'text.primary',
                  textDecoration: 'none',
                  fontWeight: 700,
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
{t('header.title')}
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                component="a"
                href="/privacy"
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                {t('header.privacy')}
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: 'text.primary',
                  borderColor: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                {t('header.support')}
              </Button>
              <LanguageSwitcher />
            </Box>
          </motion.div>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;

