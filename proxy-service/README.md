# Transfer Proxy Service

Proxy service for Booking.com transfer API with caching and error handling.

## Features

- **Caching**: Redis-like in-memory caching to reduce API calls
- **Rate Limiting**: Protect against abuse
- **Error Handling**: Robust error handling with detailed logging
- **CORS Support**: Configured for your Next.js app
- **Health Monitoring**: Health check and cache statistics endpoints
- **Request Tracking**: Unique request IDs for debugging

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your settings
   ```

3. **Start the service:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### GET /api/transfers
Search for transfer options.

**Query Parameters:**
- `pickup` (required): Pickup location
- `dropoff` (required): Dropoff location  
- `pickupDateTime` (required): Date and time in ISO format
- `passenger` (required): Number of passengers
- `currency` (optional): Currency code (default: EUR)
- `language` (optional): Language code (default: en-gb)
- `pickupEstablishment` (optional): Pickup establishment name
- `dropoffEstablishment` (optional): Dropoff establishment name
- `pickupType` (optional): Pickup type (default: city)
- `dropoffType` (optional): Dropoff type (default: city)

**Response:**
```json
{
  "success": true,
  "source": "booking.com",
  "data": { /* Booking.com response data */ },
  "requestParams": { /* Request parameters */ },
  "requestId": "abc123",
  "duration": 1250,
  "cached": false,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /health
Health check endpoint.

### GET /api/cache/stats
Cache statistics.

### DELETE /api/cache/clear
Clear cache.

## Configuration

Environment variables:

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window
- `CACHE_TTL_SECONDS`: Cache time-to-live in seconds
- `CACHE_MAX_KEYS`: Maximum cache keys
- `BOOKING_USER_AGENT`: User agent for Booking.com requests
- `BOOKING_TIMEOUT_MS`: Request timeout in milliseconds

## Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server.js --name "transfer-proxy"
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Using systemd
Create `/etc/systemd/system/transfer-proxy.service`:
```ini
[Unit]
Description=Transfer Proxy Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/proxy-service
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Monitoring

- Health check: `GET /health`
- Cache stats: `GET /api/cache/stats`
- Clear cache: `DELETE /api/cache/clear`

## Integration with Next.js App

Update your `taxiBookingService.ts`:

```typescript
constructor() {
  // Point to your proxy service instead of direct Booking.com
  this.apiUrl = process.env.PROXY_SERVICE_URL || 'http://localhost:3001/api/transfers';
  // ... rest of constructor
}
```

Add to your `.env`:
```
PROXY_SERVICE_URL=https://your-proxy-server.com/api/transfers
```
