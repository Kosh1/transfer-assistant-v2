'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import ChatInterface from '../components/ChatInterface';
import TransferResults from '../components/TransferResults';
import FAQSection from '../components/FAQSection';
import SEOContent from '../components/SEOContent';
import StructuredData from '../components/StructuredData';
import { useTranslation } from '../hooks/useTranslation';
import { TransferData, TransferOption } from '../types';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [transferData, setTransferData] = useState<TransferData | null>(null);
  const [transferOptions, setTransferOptions] = useState<TransferOption[] | null>(null);
  const [transferAnalysis, setTransferAnalysis] = useState<string | null>(null);
  const [userLanguage, setUserLanguage] = useState('en');
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to results when they appear
  useEffect(() => {
    if (transferData && transferOptions && transferAnalysis && resultsRef.current) {
      // Small delay to ensure the animation has started
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [transferData, transferOptions, transferAnalysis]);

  const handleChatData = (data: {
    from: string;
    to: string;
    passengers: number;
    luggage: number;
    date: string;
    time: string;
    transferOptions?: TransferOption[];
    transferAnalysis?: string;
    userLanguage?: string;
  }) => {
    // Update transfer data
    setTransferData({
      from: data.from,
      to: data.to,
      passengers: data.passengers,
      luggage: data.luggage,
      date: data.date,
      time: data.time,
      language: data.userLanguage || 'en',
      isComplete: true
    });

    // Update transfer options and analysis if available
    if (data.transferOptions) {
      setTransferOptions(data.transferOptions);
      setTransferAnalysis(data.transferAnalysis || '');
    }
    
    // Update user language if available
    if (data.userLanguage) {
      setUserLanguage(data.userLanguage);
    }
  };

  return (
    <>
      <StructuredData type="FAQPage" data={{}} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          aria-labelledby="hero-title"
        >
        <Box
          component="header"
          sx={{
            textAlign: 'center',
            py: 6,
            mb: 6,
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            id="hero-title"
            gutterBottom 
            sx={{ fontWeight: 700 }}
          >
            {t('landing.title')}
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ mb: 4 }}
            component="p"
          >
            {t('landing.subtitle')}
          </Typography>
          
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ChatInterface onDataReceived={handleChatData} />
          </motion.div>
        </Box>
      </motion.section>

      {/* Transfer Results Section */}
      {transferData && transferOptions && transferAnalysis && (
        <motion.section
          ref={resultsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          aria-labelledby="results-title"
        >
          <Typography 
            id="results-title" 
            variant="h2" 
            component="h2"
            sx={{ 
              textAlign: 'center', 
              mb: 4,
              position: 'absolute',
              left: '-10000px',
              top: 'auto',
              width: '1px',
              height: '1px',
              overflow: 'hidden'
            }}
          >
            Transfer Results
          </Typography>
          <TransferResults
            transferData={transferData}
            transferOptions={transferOptions}
            transferAnalysis={transferAnalysis}
            userLanguage={userLanguage}
          />
        </motion.section>
      )}

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        aria-labelledby="faq-title"
      >
        <Typography 
          id="faq-title" 
          variant="h2" 
          component="h2"
          sx={{ 
            textAlign: 'center', 
            mb: 4,
            position: 'absolute',
            left: '-10000px',
            top: 'auto',
            width: '1px',
            height: '1px',
            overflow: 'hidden'
          }}
        >
          Frequently Asked Questions
        </Typography>
        <FAQSection />
      </motion.section>

      {/* SEO Content Section */}
      <SEOContent />
      </Container>
    </>
  );
};

export default HomePage;
