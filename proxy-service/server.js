const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Cache configuration
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 300, // 5 minutes default
  maxKeys: parseInt(process.env.CACHE_MAX_KEYS) || 1000
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 / 60)
  }
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: {
      keys: cache.keys().length,
      stats: cache.getStats()
    }
  });
});

// Main transfer search endpoint
app.get('/api/transfers', async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`🚀 [${requestId}] Transfer search request started`);
  
  try {
    // Extract and validate parameters
    const {
      pickup,
      dropoff,
      pickupEstablishment,
      dropoffEstablishment,
      pickupType,
      dropoffType,
      pickupDateTime,
      passenger,
      currency = 'EUR',
      language = 'en-gb'
    } = req.query;

    console.log(`📋 [${requestId}] Request parameters:`, {
      pickup,
      dropoff,
      pickupEstablishment,
      dropoffEstablishment,
      pickupType,
      dropoffType,
      pickupDateTime,
      passenger,
      currency,
      language
    });

    // Validate required parameters
    if (!pickup || !dropoff || !pickupDateTime || !passenger) {
      console.log(`❌ [${requestId}] Missing required parameters`);
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        required: ['pickup', 'dropoff', 'pickupDateTime', 'passenger'],
        requestId
      });
    }

    // Create cache key
    const cacheKey = `transfer_${JSON.stringify({
      pickup,
      dropoff,
      pickupEstablishment,
      dropoffEstablishment,
      pickupType,
      dropoffType,
      pickupDateTime,
      passenger,
      currency,
      language
    })}`;

    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log(`💾 [${requestId}] Cache hit - returning cached result`);
      return res.json({
        ...cachedResult,
        cached: true,
        requestId,
        duration: Date.now() - startTime
      });
    }

    console.log(`🔍 [${requestId}] Cache miss - fetching from Booking.com`);

    // Construct Booking.com API URL
    const queryParams = new URLSearchParams({
      affiliate: 'booking-taxi',
      currency: currency,
      displayLocalSupplierText: 'true',
      dropoff: dropoff,
      dropoffEstablishment: dropoffEstablishment || 'Unknown',
      dropoffType: dropoffType || 'city',
      format: 'envelope',
      isExpandable: 'true',
      language: language,
      passenger: passenger.toString(),
      passengerMismatchExperiment: 'true',
      pickup: pickup,
      pickupDateTime: pickupDateTime,
      pickupEstablishment: pickupEstablishment || 'Unknown',
      pickupType: pickupType || 'city',
      populateSupplierName: 'true',
      returnBannerDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
    });

    const bookingApiUrl = `https://taxis.booking.com/search-results-mfe/rates?${queryParams}`;
    console.log(`🔗 [${requestId}] Calling Booking.com API:`, bookingApiUrl);

    // Make request to Booking.com
    const response = await axios.get(bookingApiUrl, {
      headers: {
        'User-Agent': process.env.BOOKING_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'Referer': 'https://www.booking.com/',
        'Origin': 'https://www.booking.com',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: parseInt(process.env.BOOKING_TIMEOUT_MS) || 10000
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏰ [${requestId}] Booking.com API response received in ${duration}ms`);
    console.log(`📊 [${requestId}] Response status: ${response.status}`);
    console.log(`📊 [${requestId}] Response headers:`, response.headers);

    if (response.status !== 200) {
      throw new Error(`Booking.com API returned status ${response.status}`);
    }

    console.log(`📥 [${requestId}] Parsing response data...`);
    const data = response.data;
    console.log(`📊 [${requestId}] Response data keys:`, Object.keys(data));
    console.log(`📊 [${requestId}] Response data size:`, JSON.stringify(data).length, 'characters');

    // Prepare response
    const result = {
      success: true,
      source: 'booking.com',
      data: data,
      requestParams: {
        pickup,
        dropoff,
        pickupEstablishment,
        dropoffEstablishment,
        pickupType,
        dropoffType,
        pickupDateTime,
        passenger,
        currency,
        language
      },
      requestId,
      duration,
      cached: false,
      timestamp: new Date().toISOString()
    };

    // Cache the result
    cache.set(cacheKey, result);
    console.log(`💾 [${requestId}] Result cached with key: ${cacheKey}`);

    console.log(`✅ [${requestId}] Successfully processed request in ${duration}ms`);
    res.json(result);

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`💥 [${requestId}] Error processing request:`, error.message);
    console.error(`💥 [${requestId}] Error stack:`, error.stack);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      requestId,
      duration,
      timestamp: new Date().toISOString()
    });
  }
});

// Cache management endpoints
app.get('/api/cache/stats', (req, res) => {
  res.json({
    keys: cache.keys().length,
    stats: cache.getStats(),
    timestamp: new Date().toISOString()
  });
});

app.delete('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({
    success: true,
    message: 'Cache cleared',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Proxy service running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Cache TTL: ${cache.options.stdTTL} seconds`);
  console.log(`📊 Max cache keys: ${cache.options.maxKeys}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});
