// Taxi Booking Service for taxi.booking.com - TypeScript version
// This service fetches transfer prices and options

import llmService from './llmService';

interface TransferSearchParams {
  from: string;
  to: string;
  passengers: number;
  luggage: number;
  date: string;
  time: string;
}

interface TransferOption {
  supplierID: string;
  supplierName: string;
  supplierCategory: string;
  carDetails: {
    description: string;
    modelDescription: string;
    carExample?: string;
    carDescription?: string;
  };
  maxPassenger: number;
  bags: number;
  price: number;
  originalPrice: number;
  currency: string;
  duration: number;
  meetAndGreet: boolean;
  drivingDistance: number;
  isShared: boolean;
  isPremium: boolean;
  vehicleCategory: string;
  selfLink: string;
}

interface TransferSearchResult {
  success: boolean;
  message: string;
  options: TransferOption[];
  groupedOptions: Record<string, any>;
}

class TaxiBookingService {
  private baseUrl: string;
  private apiUrl: string;
  private userAgent: string;

  constructor() {
    // Use proxy service instead of direct Booking.com API
    this.baseUrl = process.env.PROXY_SERVICE_URL || 
                   process.env.REACT_APP_PROXY_SERVICE_URL || 
                   'http://185.185.143.91';
    this.apiUrl = `${this.baseUrl}/api/transfers`;
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
    
    console.log(`🔗 TaxiBookingService initialized with proxy URL: ${this.apiUrl}`);
  }

  // Get transfer prices from taxi.booking.com
  async getTransferPrices(transferData: TransferSearchParams, userLanguage: string = 'en'): Promise<TransferSearchResult> {
    try {
      console.log('🚕 Starting transfer search with data:', transferData);
      
      const {
        from,
        to,
        passengers = 1,
        luggage = 1,
        date,
        time
      } = transferData;

      // Validate required data
      if (!from || !to) {
        throw new Error('Departure and destination locations are required');
      }

      // Prepare search parameters
      const searchParams = {
        from: this.normalizeLocation(from),
        to: this.normalizeLocation(to),
        passengers: passengers,
        luggage: luggage,
        date: this.formatDate(date),
        time: this.formatTime(time)
      };

      // Get search results
      const searchResults = await this.searchTransfers(searchParams, userLanguage);
      console.log('🔍 Raw search results:', searchResults);
      
      // Get detailed prices for each option
      const detailedResults = await this.getDetailedPrices(searchResults);
      console.log('💰 Detailed results:', detailedResults);
      
      const formattedResults = this.formatResults(detailedResults, userLanguage);
      console.log('\n' + '='.repeat(60));
      console.log('📋 FINAL RESULTS');
      console.log('='.repeat(60));
      console.log('✅ Success:', formattedResults.success);
      console.log('💬 Message:', formattedResults.message);
      console.log('🎯 Options found:', formattedResults.options?.length || 0);
      console.log('='.repeat(60));
      console.log('🚕 TRANSFER SEARCH COMPLETED\n');
      
      return formattedResults;
      
    } catch (error) {
      console.error('Error fetching transfer prices:', error);
      throw new Error(`Failed to get transfer prices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search for available transfers with retry logic
  async searchTransfers(params: TransferSearchParams, userLanguage: string | null = null): Promise<TransferOption[]> {
    const maxRetries = 2;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Transfer search attempt ${attempt}/${maxRetries}`);
        return await this.performTransferSearch(params, userLanguage);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`❌ Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed, throw error
    console.log('🔄 All retries failed');
    throw new Error(`Transfer search failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  // Perform the actual transfer search
  private async performTransferSearch(params: TransferSearchParams, userLanguage: string | null = null): Promise<TransferOption[]> {
    try {
      // Use provided userLanguage or detect from input
      const detectedLanguage = userLanguage || this.detectLanguageFromInput(params.from, params.to);
      const apiLanguage = this.mapLanguageToAPI(detectedLanguage);
      
      console.log('🌍 Language detection:', { userLanguage, detectedLanguage, apiLanguage });
      
      // Prepare optimized query parameters (removed unnecessary ones for speed)
      const queryParams = new URLSearchParams({
        affiliate: 'booking-taxi',
        currency: 'EUR',
        dropoff: this.getLocationId(params.to),
        dropoffEstablishment: params.to,
        dropoffType: this.getLocationType(params.to),
        format: 'envelope',
        language: apiLanguage,
        passenger: params.passengers.toString(),
        pickup: this.getLocationId(params.from),
        pickupDateTime: this.formatDateTime(params.date, params.time),
        pickupEstablishment: params.from,
        pickupType: this.getLocationType(params.from)
      });

      console.log('🔗 Backend API URL:', `${this.apiUrl}?${queryParams}`);
      console.log('📋 Query params:', Object.fromEntries(queryParams));

      const startTime = Date.now();
      console.log(`⏰ Starting backend API request at ${new Date().toISOString()}`);

      // Make request to our backend server with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${this.apiUrl}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`⏰ Backend API response received in ${duration}ms`);
      console.log(`📊 Response status: ${response.status} ${response.statusText}`);
      console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error(`❌ Backend API error: ${response.status} ${response.statusText}`);
        
        // Try to get error details
        let errorDetails = '';
        try {
          const errorText = await response.text();
          errorDetails = errorText;
          console.log('📄 Error response body:', errorText);
        } catch (e) {
          console.log('📄 Could not read error response body:', e);
        }
        
        throw new Error(`Backend API error: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
      }

      console.log(`📥 Attempting to parse JSON response...`);
      const result = await response.json();
      console.log('✅ Backend response:', result);
      console.log(`📊 Response data keys:`, Object.keys(result));
      console.log(`📊 Response data size:`, JSON.stringify(result).length, 'characters');

      if (result.success && result.data) {
        // Parse real Booking.com data and return all options
        const transferOptions = await this.parseBookingData(result.data, params, userLanguage || 'en');
        console.log(`🚕 Found ${transferOptions.length} transfer options from Booking.com`);
        return transferOptions;
      } else {
        console.log('⚠️ Backend returned no data');
        console.log('⚠️ Backend response structure:', JSON.stringify(result, null, 2));
        throw new Error(`Backend API error: ${result.error || 'No data received'}`);
      }
      
    } catch (error) {
      console.error('Search API error:', error);
      console.error('Search API error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Re-throw error to be handled by retry logic
      throw error;
    }
  }

  // Get location ID for API (Google Places format from CSV data)
  private getLocationId(location: string): string {
    if (!location) return '';
    
    const locationLower = location.toLowerCase().trim();
    
    const locationMap: Record<string, string> = {
      // Major Airports - MUST come before city matches to avoid conflicts
      'vienna airport': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'vienna international airport': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'schwechat airport': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'венский аэропорт': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'аэропорт вены': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'аэропорт': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ', // Generic airport reference
      
      // Handle Google Search results format
      'vienna airport, austria': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'vienna, austria': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      
      'geneva airport': 'ChIJN5MjroBkjEcRMKa4TvKpEeU',
      'gva': 'ChIJN5MjroBkjEcRMKa4TvKpEeU',
      
      'innsbruck airport': 'ChIJRdBNVHVrnUcRGT-I40h8Q1k',
      'inn': 'ChIJRdBNVHVrnUcRGT-I40h8Q1k',
      
      'salzburg airport': 'ChIJMUEWmiSQdkcRb5nIVkNvPB4',
      'szg': 'ChIJMUEWmiSQdkcRb5nIVkNvPB4',
      
      'basel airport': 'ChIJQ3OaSAO8kUcRVCoHgGyXib8',
      'bsl': 'ChIJQ3OaSAO8kUcRVCoHgGyXib8',
      
      'grenoble airport': 'ChIJf1xyMojaikcRwz1R6tX-knU',
      'gnb': 'ChIJf1xyMojaikcRwz1R6tX-knU',
      
      // Major Cities - Vienna city center (MUST come after airport matches)
      'vienna city center': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      'vienna city': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      'vienna': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0', // Vienna city center
      'вена': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      'венна': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      'wien': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      
      'geneva city': 'ChIJ6-LQkwZljEcRObwLezWVtqA',
      'innsbruck city': 'ChIJc8r44c9unUcRDZsdKH0cIJ0',
      'salzburg city': 'ChIJsdQIqd2adkcRPfcqQaGD4cE',
      'basel city': 'ChIJRTH3kUMfl0cRwcXzMxkpD2M',
      
      // Popular Ski Resorts
      'chamonix': 'ChIJ5y7-LQZMiUcRgKO65CqrCAQ',
      'courchevel': 'ChIJc_VjrDB_iUcREMArgy2rCAo',
      'val d\'isere': 'ChIJk_tf_QkJiUcRMKi65CqrCAQ',
      'val thorens': 'ChIJh_ePD2CGiUcREFEogy2rCAo',
      'verbier': 'ChIJc6mm987PjkcRkYgnDZw-3v8',
      'les arcs': 'ChIJgwxVkQ9viUcRwq995YhoKn8',
      'meribel': 'ChIJG7K6NjmAiUcRUIyElH2rvUA',
      'tignes': 'ChIJl2dWMqp0iUcROL6f4ArKhDg',
      
      'kitzbuhel': 'ChIJFV1O4HVNdkcRWkupS_2Xtv8',
      'mayrhofen': 'ChIJbzLYLzjdd0cRDtGuTzM_vt4',
      'saalbach': 'ChIJzwGjsdD_dkcR1xyM-f0twZU',
      'zell am see': 'ChIJywwtjG0dd0cRwt1xr6M1MUU',
      'ischgl': 'ChIJ8R4D9WKznEcR18sUKu-fxmc',
      'kaprun': 'ChIJk-wkXEgbd0cRN9sz8KeEmec',
      'st anton': 'ChIJBZ5afmCwnEcRj60i3GNGyZE',
      'obergurgl': 'ChIJU3-n6XrMgkcRNhaxPz-daQs',
      'soelden': 'ChIJxxooVFsynUcRP9_DLq7bKE0',
      'sölden': 'ChIJxxooVFsynUcRP9_DLq7bKE0',
      
      // Other Major Cities
      'salzburg': 'ChIJsdQIqd2adkcRPfcqQaGD4cE',
      'graz': 'ChIJu2UwF4c1bkcRm93f0tGKjv4',
      'linz': 'ChIJTYWZ-pWVc0cRxHV5VywpU3w',
      'klagenfurt': 'ChIJZX6PMEVzcEcRK41hjN-2fmg',
      'bratislava': 'ChIJl2HKCjaJbEcRaEOI_YKbH2M',
      'brno': 'ChIJEVE_wDqUEkcRsLEUZg-vAAQ',
      'budapest': 'ChIJyc_U0TTDQUcRYBEeDCnEAAQ',
      'annecy': 'ChIJyVEFHPqPi0cRujQFYoEWeEI',
      'lausanne': 'ChIJ5aeJzT4pjEcRXu7iysk_F-s',
      'montreux': 'ChIJzVC2zSCbjkcRRxhtxH96wMw',
      'interlaken': 'ChIJBRqSMWqZUxQRAL4CTPEaEZw'
    };
    
    // Try exact match first
    if (locationMap[locationLower]) {
      return locationMap[locationLower];
    }
    
    // Try partial matches for Google Search results, but be more specific
    for (const [key, value] of Object.entries(locationMap)) {
      // Only match if the location contains the key
      if (locationLower.includes(key)) {
        return value;
      }
    }
    
    // If no match found, return original location
    return location;
  }

  // Get location type for API
  private getLocationType(location: string): string {
    const locationLower = location.toLowerCase();
    
    // Check for airport indicators (including Russian and IATA codes)
    if (locationLower.includes('аэропорт') || locationLower.includes('airport') || 
        locationLower.includes('schwechat') || locationLower.includes('gva') || 
        locationLower.includes('inn') || locationLower.includes('szg') || 
        locationLower.includes('bsl') || locationLower.includes('gnb')) {
      return 'airport';
    }
    
    // Check for station indicators
    if (locationLower.includes('станция') || locationLower.includes('station') || 
        locationLower.includes('hauptbahnhof') || locationLower.includes('westbahnhof')) {
      return 'establishment';
    }
    
    // Default to establishment for cities and other locations
    return 'establishment';
  }

  // Determine vehicle category based on passenger capacity and description
  private getVehicleCategory(maxPassenger: number, description: string): string {
    const desc = (description || '').toLowerCase();
    
    // Check for specific vehicle types in description
    if (desc.includes('bus') || desc.includes('автобус') || desc.includes('coach')) {
      return 'bus';
    }
    
    if (desc.includes('minivan') || desc.includes('минивэн') || desc.includes('van') || 
        desc.includes('minibus') || desc.includes('миниавтобус')) {
      return 'minivan';
    }
    
    // Check by passenger capacity
    if (maxPassenger >= 9) {
      return 'bus';
    } else if (maxPassenger >= 6 && maxPassenger <= 8) {
      return 'minivan';
    } else {
      return 'car';
    }
  }

  // Get category display name
  private getCategoryDisplayName(category: string, language: string = 'en'): string {
    const names: Record<string, Record<string, string>> = {
      'en': {
        'car': 'Cars',
        'minivan': 'Minivans', 
        'bus': 'Buses'
      },
      'ru': {
        'car': 'Легковые автомобили',
        'minivan': 'Минивэны',
        'bus': 'Автобусы'
      }
    };
    
    return names[language]?.[category] || names['en'][category] || category;
  }

  // Parse real Booking.com API data
  private async parseBookingData(bookingData: any, params: TransferSearchParams, userLanguage: string): Promise<TransferOption[]> {
    try {
      console.log('🔍 Parsing real Booking.com data:', bookingData);
      
      // Extract transfer options from Booking.com response
      // Based on the actual API response structure
      let transferOptions: any[] = [];
      
      if (bookingData.journeys && Array.isArray(bookingData.journeys)) {
        // New API structure: journeys[0].legs[0].results
        const journey = bookingData.journeys[0];
        if (journey && journey.legs && Array.isArray(journey.legs)) {
          const leg = journey.legs[0];
          if (leg && leg.results && Array.isArray(leg.results)) {
            transferOptions = leg.results;
          }
        }
      } else if (bookingData.transfers && Array.isArray(bookingData.transfers)) {
        transferOptions = bookingData.transfers;
      } else if (bookingData.options && Array.isArray(bookingData.options)) {
        transferOptions = bookingData.options;
      } else if (bookingData.results && Array.isArray(bookingData.results)) {
        transferOptions = bookingData.results;
      } else if (Array.isArray(bookingData)) {
        transferOptions = bookingData;
      }
      
      if (transferOptions.length === 0) {
        console.log('⚠️ No transfer options found in Booking.com data');
        throw new Error('No transfer options available from Booking.com');
      }
      
      console.log(`📊 Found ${transferOptions.length} transfer options from Booking.com`);
      
      // Transform Booking.com data to our format with LLM descriptions
      const transformedOptions: TransferOption[] = await Promise.all(transferOptions.map(async (option, index) => {
        // Extract car details - try multiple possible fields
        const carDetails = option.carDetails || {};
        let description = carDetails.description || option.description || option.vehicleType || option.carType || '';
        let modelDescription = carDetails.modelDescription || carDetails.model || option.model || option.vehicleModel || '';
        
        // Extract car example (actual model name with "or similar")
        const baseModel = carDetails.model || option.model || option.vehicleModel || modelDescription.split(' or similar')[0] || '';
        const carExample = baseModel ? `${baseModel} or similar` : '';
        
        // Generate car description using LLM (but with timeout)
        let carDescription = '';
        if (carExample) {
          try {
            // Use a quick LLM call with timeout
            carDescription = await this.generateCarDescriptionWithTimeout(carExample, userLanguage);
          } catch (error) {
            console.error(`❌ Failed to generate car description for ${carExample}:`, error);
            carDescription = '';
          }
        }
        
        // If we have a vehicle type, use it as description
        if (option.vehicleType && !description.includes(option.vehicleType)) {
          description = `${option.vehicleType} - ${description}`;
        }
        
        // Extract pricing - try multiple possible fields
        const price = option.price || option.totalPrice || option.amount || option.fare || 0;
        const originalPrice = option.originalPrice || option.originalAmount || price;
        
        // Extract passenger and luggage info
        const maxPassenger = parseInt(option.maxPassenger) || parseInt(option.passengers) || parseInt(option.capacity) || params.passengers;
        const bags = parseInt(option.bags) || parseInt(option.luggage) || parseInt(option.baggage) || params.luggage;
        
        // Extract timing and distance
        const duration = parseInt(option.duration) || parseInt(option.travelTime) || 25;
        const drivingDistance = parseFloat(option.drivingDistance) || parseFloat(option.distance) || 18;
        
        // Extract supplier information
        const supplierName = option.supplierName || option.name || option.provider || option.company || 'Unknown Supplier';
        const supplierCategory = option.supplierCategory || option.category || option.serviceLevel || '';
        
        // Extract additional features
        const meetAndGreet = option.meetAndGreet || option.meetAndGreetService || false;
        const isShared = option.isShared || option.shared || false;
        const isPremium = option.isPremium || option.premium || supplierCategory.toLowerCase().includes('premium');
        
        // Determine vehicle category
        const vehicleCategory = this.getVehicleCategory(maxPassenger, description);
        
        return {
          supplierID: option.supplierID?.toString() || option.supplierId?.toString() || option.id?.toString() || `real-${index}`,
          supplierName: supplierName,
          supplierCategory: supplierCategory,
          carDetails: {
            description: description,
            modelDescription: modelDescription,
            carExample: carExample,
            carDescription: carDescription
          },
          maxPassenger: maxPassenger,
          bags: bags,
          price: price,
          originalPrice: originalPrice,
          currency: option.currency || 'EUR',
          duration: duration,
          meetAndGreet: meetAndGreet,
          drivingDistance: drivingDistance,
          isShared: isShared,
          isPremium: isPremium,
          vehicleCategory: vehicleCategory,
          selfLink: option.link || option.bookingLink || option.bookingUrl || `https://example.com/book/${option.supplierID || index}`
        };
      }));
      
      console.log('✅ Transformed Booking.com data:', transformedOptions.length, 'options');
      console.log('💰 Price range:', Math.min(...transformedOptions.map(o => o.price)), '-', Math.max(...transformedOptions.map(o => o.price)), 'EUR');
      
      return transformedOptions;
      
    } catch (error) {
      console.error('Error parsing Booking.com data:', error);
      throw new Error(`Failed to parse Booking.com data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get detailed prices for each transfer option
  private async getDetailedPrices(searchResults: TransferOption[]): Promise<TransferOption[]> {
    // For now, return the search results as-is
    // In the future, this could make additional API calls for detailed pricing
    return searchResults;
  }

  // Format results for the frontend with vehicle category grouping
  private formatResults(detailedResults: TransferOption[], userLanguage: string = 'en'): TransferSearchResult {
    if (!detailedResults || detailedResults.length === 0) {
      return {
        success: false,
        message: 'No transfer options found for your request.',
        options: [],
        groupedOptions: {}
      };
    }

    // Sort by price (lowest first)
    const sortedResults = detailedResults.sort((a, b) => a.price - b.price);

    // Group by vehicle category
    const groupedOptions: Record<string, any> = {
      car: [],
      minivan: [],
      bus: []
    };

    sortedResults.forEach(option => {
      const category = option.vehicleCategory || 'car';
      if (groupedOptions[category]) {
        groupedOptions[category].push(option);
      }
    });

    // Add category display names
    const groupedWithNames = {
      car: {
        name: this.getCategoryDisplayName('car', userLanguage),
        options: groupedOptions.car,
        count: groupedOptions.car.length
      },
      minivan: {
        name: this.getCategoryDisplayName('minivan', userLanguage),
        options: groupedOptions.minivan,
        count: groupedOptions.minivan.length
      },
      bus: {
        name: this.getCategoryDisplayName('bus', userLanguage),
        options: groupedOptions.bus,
        count: groupedOptions.bus.length
      }
    };

    console.log('🚗 Grouped options:', {
      cars: groupedOptions.car.length,
      minivans: groupedOptions.minivan.length,
      buses: groupedOptions.bus.length
    });

    return {
      success: true,
      message: `Found ${sortedResults.length} transfer options. Here are the best deals:`,
      options: sortedResults, // Keep original flat structure for backward compatibility
      groupedOptions: groupedWithNames // Add new grouped structure
    };
  }

  // Normalize location names
  private normalizeLocation(location: string): string {
    if (!location) return '';
    
    // Remove extra spaces and normalize
    return location.trim().replace(/\s+/g, ' ');
  }

  // Format date for API
  private formatDate(date: string | Date): string {
    if (!date) return '';
    
    // If date is a Date object, format it
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    
    // If date is already in YYYY-MM-DD format, return as-is
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    // If date is a string like "tomorrow", convert it
    if (typeof date === 'string') {
      if (date.toLowerCase() === 'tomorrow' || date.toLowerCase() === 'завтра') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      }
      if (date.toLowerCase() === 'today' || date.toLowerCase() === 'сегодня') {
        return new Date().toISOString().split('T')[0];
      }
    }
    
    return date.toString();
  }

  // Format time for API
  private formatTime(time: string): string {
    if (!time) return '12:00';
    
    // If time is already in HH:MM format, return as-is
    if (typeof time === 'string' && /^\d{1,2}:\d{2}$/.test(time)) {
      return time;
    }
    
    // If time is a number, convert to HH:MM format
    if (typeof time === 'number') {
      const hours = Math.floor(time);
      const minutes = Math.round((time - hours) * 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return time.toString();
  }

  // Detect language from user input
  private detectLanguageFromInput(from: string, to: string): string {
    const text = `${from} ${to}`.toLowerCase();
    
    // Check for Russian
    if (text.includes('вена') || text.includes('аэропорт') || text.includes('из') || text.includes('в')) {
      return 'ru';
    }
    
    // Check for German
    if (text.includes('wien') || text.includes('flughafen') || text.includes('von') || text.includes('nach')) {
      return 'de';
    }
    
    // Check for French
    if (text.includes('vienne') || text.includes('aéroport') || text.includes('de') || text.includes('à')) {
      return 'fr';
    }
    
    // Check for Chinese
    if (text.includes('维也纳') || text.includes('机场') || text.includes('从') || text.includes('到')) {
      return 'zh';
    }
    
    // Default to English
    return 'en';
  }

  // Map user language to API language code
  private mapLanguageToAPI(userLanguage: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-gb',
      'ru': 'ru-ru',
      'de': 'de-de',
      'fr': 'fr-fr',
      'zh': 'zh-cn'
    };
    
    return languageMap[userLanguage] || 'en-gb';
  }


  // Generate car description using LLM with timeout
  private async generateCarDescriptionWithTimeout(carModel: string, userLanguage: string): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(process.env.REACT_APP_LLM_API_URL || 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_LLM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: process.env.REACT_APP_LLM_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a car expert. Based on the car model provided, give a brief 2-3 word description of the vehicle type in the user's language.

Examples:
- "Skoda Octavia" -> "обычная легковая" (ru) / "regular sedan" (en) / "berline normale" (fr)
- "BMW 5 Series" -> "премиум седан" (ru) / "premium sedan" (en) / "berline premium" (fr)
- "Mercedes V-Class" -> "большой минивен" (ru) / "large minivan" (en) / "grand monospace" (fr)
- "Ford Tourneo" -> "большой минивен" (ru) / "large minivan" (en) / "grand monospace" (fr)
- "VW Passat" -> "семейный седан" (ru) / "family sedan" (en) / "berline familiale" (fr)

Respond with ONLY the description, no additional text.`
            },
            {
              role: 'user',
              content: `Car model: ${carModel}. Language: ${userLanguage}. Describe this car type briefly.`
            }
          ],
          temperature: 0.3,
          max_tokens: 20
        })
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`LLM API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      const description = result.choices[0]?.message?.content?.trim();
      
      return description || '';
    } catch (error) {
      console.error('LLM car description generation error:', error);
      return '';
    }
  }

  // Format date and time for API in ISO format
  private formatDateTime(date: string, time: string): string {
    const formattedDate = this.formatDate(date);
    const formattedTime = this.formatTime(time);
    
    if (!formattedDate) {
      throw new Error('Valid date is required');
    }
    
    if (!formattedTime) {
      throw new Error('Valid time is required');
    }
    
    // Create ISO datetime string
    const isoString = `${formattedDate}T${formattedTime}:00`;
    
    // Validate ISO format
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(isoString)) {
      throw new Error('Invalid datetime format. Expected YYYY-MM-DDTHH:MM:SS');
    }
    
    return isoString;
  }
}

const taxiBookingService = new TaxiBookingService();
export default taxiBookingService;
