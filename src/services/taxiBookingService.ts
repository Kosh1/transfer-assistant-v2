// Taxi Booking Service for taxi.booking.com - TypeScript version
// This service fetches transfer prices and options

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
    // Use relative URLs for Vercel deployment
    this.baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '';
    this.apiUrl = '/api/transfers';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
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

  // Search for available transfers
  async searchTransfers(params: TransferSearchParams, userLanguage: string | null = null): Promise<TransferOption[]> {
    try {
      // Use provided userLanguage or detect from input
      const detectedLanguage = userLanguage || this.detectLanguageFromInput(params.from, params.to);
      const apiLanguage = this.mapLanguageToAPI(detectedLanguage);
      
      console.log('🌍 Language detection:', { userLanguage, detectedLanguage, apiLanguage });
      
      // Prepare query parameters for our backend (matching Booking.com API format)
      const queryParams = new URLSearchParams({
        affiliate: 'booking-taxi',
        currency: 'EUR',
        displayLocalSupplierText: 'true',
        dropoff: this.getLocationId(params.to),
        dropoffEstablishment: params.to,
        dropoffType: this.getLocationType(params.to),
        format: 'envelope',
        isExpandable: 'true',
        language: apiLanguage,
        passenger: params.passengers.toString(),
        passengerMismatchExperiment: 'true',
        pickup: this.getLocationId(params.from),
        pickupDateTime: this.formatDateTime(params.date, params.time),
        pickupEstablishment: params.from,
        pickupType: this.getLocationType(params.from),
        populateSupplierName: 'true',
        xBookingExperimentState: 'EZIXi40Xr7szUj5fgFMEPcL9uF1fdEVWNUwBgLAQSaOKvLk9huWY0ha4xYnimGX7m'
      });

      console.log('🔗 Backend API URL:', `${this.apiUrl}?${queryParams}`);
      console.log('📋 Query params:', Object.fromEntries(queryParams));

      // Make request to our backend server
      const response = await fetch(`${this.apiUrl}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Backend response:', result);

      if (result.success && result.data) {
        // Parse real Booking.com data and return all options
        const transferOptions = this.parseBookingData(result.data, params);
        console.log(`🚕 Found ${transferOptions.length} transfer options from Booking.com`);
        return transferOptions;
      } else {
        console.log('⚠️ Backend returned no data');
        throw new Error(`Backend API error: ${result.error || 'No data received'}`);
      }
      
    } catch (error) {
      console.error('Search API error:', error);
      throw new Error(`Failed to search transfers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get location ID for API (Google Places format from CSV data)
  private getLocationId(location: string): string {
    if (!location) return '';
    
    const locationLower = location.toLowerCase().trim();
    
    const locationMap: Record<string, string> = {
      // Major Airports
      'vienna airport': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'vienna international airport': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'schwechat airport': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'венский аэропорт': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      'аэропорт вены': 'ChIJm74aR6tVbEcRS5vSjRBSeiQ',
      
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
      
      // Major Cities
      'vienna city center': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
      'vienna city': 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
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
    
    // Try partial matches for Google Search results
    for (const [key, value] of Object.entries(locationMap)) {
      if (locationLower.includes(key) || key.includes(locationLower)) {
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
  private parseBookingData(bookingData: any, params: TransferSearchParams): TransferOption[] {
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
      
      // Transform Booking.com data to our format
      const transformedOptions: TransferOption[] = transferOptions.map((option, index) => {
        // Extract car details - try multiple possible fields
        const carDetails = option.carDetails || {};
        let description = carDetails.description || option.description || option.vehicleType || option.carType || 'Standard Vehicle';
        let modelDescription = carDetails.modelDescription || carDetails.model || option.model || option.vehicleModel || 'Standard Model';
        
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
        const supplierCategory = option.supplierCategory || option.category || option.serviceLevel || 'Standard';
        
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
            modelDescription: modelDescription
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
      });
      
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
