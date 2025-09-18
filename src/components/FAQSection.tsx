'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import { ExpandMore } from '@mui/icons-material';
import { useTranslation } from '../hooks/useTranslation';

const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | false>(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqItems = [
    {
      id: 'faq1',
      question: t('faq.question1'),
      answer: t('faq.answer1')
    },
    {
      id: 'faq2',
      question: t('faq.question2'),
      answer: t('faq.answer2')
    },
    {
      id: 'faq3',
      question: t('faq.question3'),
      answer: t('faq.answer3')
    }
  ];

  // Prevent hydration mismatch by not rendering on server
  if (!isClient) {
    return (
      <Box sx={{ py: 6 }}>
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            component="h2" 
            textAlign="center" 
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
            {t('faq.title')}
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant="h3" 
            component="h2" 
            textAlign="center" 
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
            {t('faq.title')}
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            {faqItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Accordion
                  expanded={expanded === item.id}
                  onChange={handleChange(item.id)}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:before': {
                      display: 'none',
                    },
                    '&.Mui-expanded': {
                      margin: '0 0 16px 0',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      py: 2,
                      px: 3,
                      '& .MuiAccordionSummary-content': {
                        margin: '12px 0',
                      },
                      '&.Mui-expanded': {
                        minHeight: 'auto',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default FAQSection;
