'use client';

import React from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useLanguage, useTranslation, availableLanguages } from '../hooks/useTranslation';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics';

const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // Track analytics event
    trackEvent(ANALYTICS_EVENTS.LANGUAGE_SWITCHER_OPEN);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLanguage: string) => {
    // Track analytics event
    trackEvent(ANALYTICS_EVENTS.LANGUAGE_CHANGE, {
      from_language: language,
      to_language: newLanguage
    });
    
    changeLanguage(newLanguage);
    handleClose();
  };

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
        aria-label={t('header.language')}
      >
        <LanguageIcon />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 150,
            mt: 1
          }
        }}
      >
        {availableLanguages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={lang.code === language}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.main'
                }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography variant="h6">{lang.flag}</Typography>
            </ListItemIcon>
            <ListItemText 
              primary={lang.name}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: lang.code === language ? 600 : 400
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSwitcher;
