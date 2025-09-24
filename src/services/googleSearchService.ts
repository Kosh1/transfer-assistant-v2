interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface SearchResponse {
  organic: SearchResult[];
}

interface AddressSearchResult {
  address: string;
  isInVienna: boolean;
  location: string | null;
  confidence: 'high' | 'medium' | 'low';
  details: SearchResponse | null;
  clarification: string | null;
}

interface WebsiteSearchResult {
  supplierName: string;
  websiteUrl: string | null;
  confidence: 'high' | 'medium' | 'low';
  found: boolean;
}

class GoogleSearchService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    // Детальное логирование переменных окружения
    console.log('🔍 === GOOGLE SEARCH SERVICE INITIALIZATION ===');
    console.log('🔑 All env vars with GOOGLE:', Object.keys(process.env).filter(key => key.includes('GOOGLE')));
    console.log('🔑 REACT_APP_GOOGLE_SEARCH_API_KEY value:', process.env.REACT_APP_GOOGLE_SEARCH_API_KEY);
    console.log('🔑 NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY value:', process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY);
    console.log('🔑 All env vars with REACT_APP:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
    console.log('🔑 All env vars with NEXT_PUBLIC:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
    
    this.apiKey = process.env.REACT_APP_GOOGLE_SEARCH_API_KEY || '';
    this.apiUrl = 'https://google.serper.dev/search';
    
    console.log('🔑 Google Search API Key exists:', !!this.apiKey);
    console.log('🔑 Google Search API Key length:', this.apiKey?.length);
    console.log('🔑 Google Search API Key starts with:', this.apiKey?.substring(0, 10));
    console.log('🔑 Google Search API Key ends with:', this.apiKey?.substring(this.apiKey.length - 10));
    console.log('🌐 Google Search API URL:', this.apiUrl);
    console.log('🔍 === END GOOGLE SEARCH SERVICE INITIALIZATION ===');
    
    if (!this.apiKey) {
      console.error('❌ Google Search API key not configured');
    } else {
      console.log('🔍 Google Search Service initialized');
    }
  }

  async searchAddress(address: string): Promise<AddressSearchResult> {
    try {
      console.log('🔍 Searching address:', address);
      
      const query = `${address} Vienna Austria location`;
      const searchResults = await this.performSearch(query);
      
      const isInVienna = this.parseSearchResults(searchResults, address);
      
      return {
        address: address,
        isInVienna: isInVienna.isValid,
        location: isInVienna.location,
        confidence: isInVienna.confidence,
        details: searchResults,
        clarification: isInVienna.clarification
      };
    } catch (error) {
      console.error('Error searching address:', error);
      return {
        address: address,
        isInVienna: false,
        location: null,
        confidence: 'low',
        details: null,
        clarification: 'Error occurred while searching for this address.'
      };
    }
  }

  async searchCompanyWebsite(supplierName: string): Promise<WebsiteSearchResult> {
    try {
      console.log('🔍 Searching for website:', supplierName);
      
      const query = `${supplierName} official website Vienna Austria`;
      const searchResults = await this.performSearch(query);
      
      // Look for official website in results
      const websiteResult = searchResults.organic.find(result => 
        result.link && (
          result.link.includes(supplierName.toLowerCase().replace(/\s+/g, '')) ||
          result.title.toLowerCase().includes('official') ||
          result.title.toLowerCase().includes('website')
        )
      );
      
      if (websiteResult) {
        return {
          supplierName: supplierName,
          websiteUrl: websiteResult.link,
          confidence: 'high',
          found: true
        };
      }
      
      // Fallback to first result
      if (searchResults.organic.length > 0) {
        return {
          supplierName: supplierName,
          websiteUrl: searchResults.organic[0].link,
          confidence: 'medium',
          found: true
        };
      }
      
      return {
        supplierName: supplierName,
        websiteUrl: null,
        confidence: 'low',
        found: false
      };
    } catch (error) {
      console.error('Error searching website:', error);
      return {
        supplierName: supplierName,
        websiteUrl: null,
        confidence: 'low',
        found: false
      };
    }
  }

  async searchTrustpilotRating(supplierName: string): Promise<SearchResponse> {
    try {
      console.log('🔍 Searching Trustpilot rating for:', supplierName);
      
      const query = `${supplierName} trustpilot Vienna Austria`;
      const searchResults = await this.performSearch(query);
      
      return searchResults;
    } catch (error) {
      console.error('Error searching Trustpilot rating:', error);
      throw error;
    }
  }

  async searchTripAdvisorRating(supplierName: string): Promise<SearchResponse> {
    try {
      console.log('🔍 Searching TripAdvisor rating for:', supplierName);
      
      const query = `${supplierName} tripadvisor Vienna Austria`;
      const searchResults = await this.performSearch(query);
      
      return searchResults;
    } catch (error) {
      console.error('Error searching TripAdvisor rating:', error);
      throw error;
    }
  }

  async searchGeneralRating(supplierName: string): Promise<SearchResponse> {
    try {
      console.log('🔍 Searching general rating for:', supplierName);
      
      const query = `${supplierName} reviews rating Vienna Austria`;
      const searchResults = await this.performSearch(query);
      
      return searchResults;
    } catch (error) {
      console.error('Error searching general rating:', error);
      throw error;
    }
  }

  async searchCashbackOffers(supplierName: string): Promise<SearchResponse> {
    try {
      console.log('🔍 Searching cashback offers for:', supplierName);
      
      // Use a general search query - let LLM find the relevant sources
      const query = `${supplierName} cashback`;
      const searchResults = await this.performSearch(query);
      
      return searchResults;
    } catch (error) {
      console.error('Error searching cashback offers:', error);
      throw error;
    }
  }

  async searchCouponOffers(supplierName: string): Promise<SearchResponse> {
    try {
      console.log('🔍 Searching coupon offers for:', supplierName);
      
      // Use a general search query - let LLM find the relevant sources
      const query = `${supplierName} coupon discount`;
      const searchResults = await this.performSearch(query);
      
      return searchResults;
    } catch (error) {
      console.error('Error searching coupon offers:', error);
      throw error;
    }
  }

  private async performSearch(query: string): Promise<SearchResponse> {
    if (!this.apiKey) {
      throw new Error('Google Search API key not configured');
    }

    console.log('🔍 Google Search query:', query);
    console.log('🔑 Google Search API Key exists:', !!this.apiKey);
    console.log('🔑 Google Search API Key length:', this.apiKey?.length);
    console.log('🌐 Google Search API URL:', this.apiUrl);

    const requestBody = {
      q: query,
      type: 'search',
      engine: 'google'
    };

    console.log('📤 Google Search request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Google Search response status:', response.status);
    console.log('📥 Google Search response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Search API Error Response:', errorText);
      
      // Handle specific error cases
      if (response.status === 400 && errorText.includes('Not enough credits')) {
        console.error('💳 Google Search API: Not enough credits. Please top up your account.');
        return { organic: [] }; // Return empty results instead of throwing
      }
      
      throw new Error(`Google Search API error: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('📥 Google Search response data:', JSON.stringify(responseData, null, 2));
    console.log('📊 Google Search organic results count:', responseData.organic?.length || 0);
    
    return responseData;
  }

  private parseSearchResults(searchResults: SearchResponse, address: string): {
    isValid: boolean;
    location: string | null;
    confidence: 'high' | 'medium' | 'low';
    clarification: string | null;
  } {
    if (!searchResults.organic || searchResults.organic.length === 0) {
      return {
        isValid: false,
        location: null,
        confidence: 'low',
        clarification: 'No search results found for this address.'
      };
    }

    const results = searchResults.organic;
    const addressLower = address.toLowerCase();
    
    // Check for Vienna indicators
    const viennaIndicators = ['vienna', 'wien', 'austria', 'österreich'];
    const airportIndicators = ['airport', 'flughafen', 'schwechat'];
    
    // Special case for Vienna Airport
    if (airportIndicators.some(indicator => addressLower.includes(indicator))) {
      return {
        isValid: true,
        location: 'Vienna Airport, Austria',
        confidence: 'high',
        clarification: null
      };
    }
    
    // Check for explicit Vienna location indicators in results
    // Look for results that clearly indicate the address is in Vienna
    const hasViennaLocation = results.some(result => {
      const titleLower = result.title.toLowerCase();
      const snippetLower = result.snippet.toLowerCase();
      
      // Check if the result explicitly mentions Vienna as the location
      const hasViennaInTitle = viennaIndicators.some(indicator => 
        titleLower.includes(indicator)
      );
      
      const hasViennaInSnippet = viennaIndicators.some(indicator => 
        snippetLower.includes(indicator)
      );
      
      // Additional validation: check if the result is about Vienna locations
      const isViennaLocation = snippetLower.includes('vienna') || 
                              snippetLower.includes('wien') ||
                              titleLower.includes('vienna') ||
                              titleLower.includes('wien');
      
      // Only consider it valid if Vienna is mentioned in the right context
      return (hasViennaInTitle || hasViennaInSnippet) && isViennaLocation;
    });
    
    // Additional check: look for non-Vienna indicators
    const hasNonViennaIndicators = results.some(result => {
      const titleLower = result.title.toLowerCase();
      const snippetLower = result.snippet.toLowerCase();
      
      // Check for Munich, Berlin, Paris, etc.
      const nonViennaCities = ['munich', 'münchen', 'berlin', 'paris', 'london', 'rome', 'madrid'];
      return nonViennaCities.some(city => 
        titleLower.includes(city) || snippetLower.includes(city)
      );
    });
    
    // If we find non-Vienna indicators, it's definitely not in Vienna
    if (hasNonViennaIndicators) {
      return {
        isValid: false,
        location: null,
        confidence: 'high',
        clarification: 'This location is not in Vienna. Please provide a Vienna address or landmark.'
      };
    }
    
    if (hasViennaLocation) {
      return {
        isValid: true,
        location: 'Vienna, Austria',
        confidence: 'high',
        clarification: null
      };
    }
    
    return {
      isValid: false,
      location: null,
      confidence: 'medium',
      clarification: 'This location is not in Vienna. Please provide a Vienna address or landmark.'
    };
  }
}

const googleSearchService = new GoogleSearchService();
export default googleSearchService;