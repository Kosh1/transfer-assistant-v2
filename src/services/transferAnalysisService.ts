import { TransferData, TransferOption, TransferAnalysisResponse } from '@/types';
import googleSearchService from './googleSearchService';
import taxiBookingService from './taxiBookingService';

// Transfer prompts - simplified version
const TRANSFER_PROMPTS = {
  ANALYZE_INDIVIDUAL_OPTION: `You are a transfer analysis expert. Analyze each transfer option and provide detailed insights.

Current time: {{CURRENT_DATE}} {{CURRENT_TIME}}

For each transfer option, provide analysis in this format:

**Vehicle**
- Type and capacity
- Comfort level assessment
- Key features

**Rating**
- Trustpilot rating if available
- TripAdvisor rating if available
- Overall reputation assessment

**Cashback & Coupons**
- Available cashback offers
- Discount coupons and promo codes
- Special deals and conditions

Be concise but informative. Focus on practical benefits for the customer.`
};

class TransferAnalysisService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_LLM_API_KEY || '';
    this.apiUrl = process.env.NEXT_PUBLIC_LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.NEXT_PUBLIC_LLM_MODEL || 'gpt-3.5-turbo';
  }

  // Search for transfer options and analyze results
  async searchAndAnalyzeTransfers(transferData: TransferData, userLanguage: string = 'en'): Promise<TransferAnalysisResponse> {
    try {
      console.log('🔍 Starting transfer search and analysis...');
      console.log('🌍 User language received:', userLanguage);
      
      // Get transfer prices from taxi.booking.com
      const searchResults = await taxiBookingService.searchTransfers(transferData, userLanguage);
      
      if (!searchResults || searchResults.length === 0) {
        return {
          success: false,
          message: 'К сожалению, я ничего не нашла для вашего маршрута. Попробуйте изменить параметры поиска.',
          data: null
        };
      }

      console.log(`📊 Found ${searchResults.length} transfer options`);

      // Process each option individually
      console.log('🔄 Processing each transfer option individually...');
      
      // First, collect unique suppliers to avoid duplicate searches
      const uniqueSuppliers = Array.from(new Set(searchResults.map(option => option.supplierName).filter(Boolean)));
      console.log(`📊 Found ${uniqueSuppliers.length} unique suppliers:`, uniqueSuppliers);
      
      // Cache provider data to avoid duplicate searches
      const providerDataCache: Record<string, any> = {};
      const llmAnalysisCache: Record<string, string> = {};
      
      // Fetch and analyze data for each unique supplier
      console.log('🔍 Fetching and analyzing data for unique suppliers...');
      await Promise.all(uniqueSuppliers.map(async (supplierName) => {
        console.log(`  📋 Processing: ${supplierName}`);
        
        // Get raw search data for this supplier
        const [ratingsSearchResults, cashbackSearchResults, websiteData] = await Promise.all([
          this.getRawSupplierRatings(supplierName),
          this.getRawSupplierCashbackAndCoupons(supplierName),
          this.getSupplierWebsite(supplierName)
        ]);
        
        // Analyze ratings with LLM (combining all rating searches for this supplier)
        const ratingsAnalysis = await this.analyzeSupplierRatingsWithLLM(supplierName, ratingsSearchResults);
        
        // Analyze cashback/coupons with LLM (combining all cashback searches for this supplier)
        const cashbackAnalysis = await this.analyzeSupplierCashbackWithLLM(supplierName, cashbackSearchResults);
        
        // Generate consistent text descriptions for this supplier
        const ratingText = this.generateRatingText(ratingsAnalysis);
        const cashbackText = this.generateCashbackText(cashbackAnalysis);
        
        providerDataCache[supplierName] = {
          ratings: ratingsAnalysis,
          cashback: cashbackAnalysis,
          website: websiteData,
          ratingText: ratingText,
          cashbackText: cashbackText
        };
        
        console.log(`  ✅ Analysis completed for: ${supplierName}`);
      }));
      
      const processedOptions = await Promise.all(searchResults.map(async (option, index) => {
        console.log(`\n📋 Processing option ${index + 1}: ${option.supplierName} - ${option.carDetails?.description || 'Standard'}`);
        
        // Use cached data instead of making new requests
        const cachedData = providerDataCache[option.supplierName] || {};
        const ratingsData = cachedData.ratings;
        const cashbackCouponData = cachedData.cashback;
        const websiteData = cachedData.website;
        const ratingText = cachedData.ratingText;
        const cashbackText = cachedData.cashbackText;
        
        const processedOption: TransferOption = {
          rank: index + 1,
          provider: option.supplierName || 'Unknown Provider',
          carDetails: {
            description: option.carDetails?.description || option.carDetails?.modelDescription || 'Standard Vehicle',
            capacity: this.extractCapacity(option),
            luggage: (option as any).carDetails?.luggage || 2
          },
          price: {
            amount: option.price || 0,
            currency: option.currency || 'EUR',
            originalAmount: (option as any).originalPrice,
            discount: (option as any).discount
          },
          duration: (option.duration || 'Not specified').toString(),
          rating: ratingsData?.bestRating?.rating || null,
          cashback: cashbackCouponData?.cashback || null,
          coupons: cashbackCouponData?.coupons || null,
          website: websiteData?.websiteUrl || null,
          bookingUrl: (option as any).bookingUrl || '#',
          analysis: `${ratingText}${cashbackText}`
        };
        
        console.log(`  ✅ Processed: ${processedOption.provider} - €${processedOption.price.amount} - Rating: ${processedOption.rating || 'Not found'}`);
        return processedOption;
      }));

      // Sort by price (cheapest first)
      const sortedOptions = processedOptions.sort((a, b) => a.price.amount - b.price.amount);
      
      // Update ranks after sorting
      sortedOptions.forEach((option, index) => {
        option.rank = index + 1;
      });

      console.log(`\n📈 Sorted options by price:`);
      sortedOptions.forEach(option => {
        console.log(`  ${option.rank}. ${option.provider} - €${option.price.amount}`);
      });

      // Generate LLM analysis for each unique supplier
      console.log('🤖 Generating LLM analysis for each unique supplier...');
      const analysisPrompt = this.replaceTimePlaceholders(TRANSFER_PROMPTS.ANALYZE_INDIVIDUAL_OPTION);
      
      // Create language-specific prompts for supplier analysis
      const languagePrompts = {
        'ru': {
          request: 'Проанализируйте этого поставщика трансферов:',
          recommend: 'Используйте структурированный формат с 3 секциями: Машина, Рейтинг, Кэшбек и Купоны.'
        },
        'de': {
          request: 'Analysieren Sie diesen Transfer-Anbieter:',
          recommend: 'Verwenden Sie das strukturierte Format mit 3 Abschnitten: Fahrzeug, Bewertung, Cashback & Gutscheine.'
        },
        'fr': {
          request: 'Analysez ce fournisseur de transfert:',
          recommend: 'Utilisez le format structuré avec 3 sections: Véhicule, Note, Cashback & Coupons.'
        },
        'zh': {
          request: '分析这个接送服务提供商：',
          recommend: '使用3个部分的结构化格式：车辆、评分、返现和优惠券。'
        },
        'en': {
          request: 'Analyze this transfer provider:',
          recommend: 'Use the structured format with 3 sections: Vehicle, Rating, Cashback & Coupons.'
        }
      };

      const currentPrompt = languagePrompts[userLanguage as keyof typeof languagePrompts] || languagePrompts['en'];
      
      // Generate LLM analysis for each unique supplier
      await Promise.all(uniqueSuppliers.map(async (supplierName) => {
        console.log(`  🤖 Generating LLM analysis for supplier: ${supplierName}`);
        
        const cachedData = providerDataCache[supplierName] || {};
        const ratingText = cachedData.ratingText;
        const cashbackText = cachedData.cashbackText;
        
        // Create a representative option for this supplier
        const representativeOption = sortedOptions.find(option => option.provider === supplierName);
        if (!representativeOption) return;
        
        const ratingInfo = ratingText || `Rating: ${representativeOption.rating || 'Not found'}`;
        const cashbackInfo = cashbackText || ' - Cashback: Not found';
        
        const optionDetails = `${representativeOption.rank}. ${representativeOption.provider} - €${representativeOption.price.amount}
   Vehicle: ${representativeOption.carDetails.description}
   Capacity: ${representativeOption.carDetails.capacity}
   ${ratingInfo}${cashbackInfo}
   Duration: ${representativeOption.duration}`;

        const userMessage = `USER LANGUAGE: ${userLanguage.toUpperCase()}

${currentPrompt.request}

From: ${transferData.from}
To: ${transferData.to}
Passengers: ${transferData.passengers || 1}
Luggage: ${transferData.luggage || 1}
Date: ${transferData.date || 'today'}
Time: ${transferData.time || 'flexible'}

${optionDetails}

${currentPrompt.recommend}`;

        // Add language instruction to system prompt
        const systemPromptWithLanguage = `${analysisPrompt}

CRITICAL LANGUAGE REQUIREMENT:
You MUST respond in ${userLanguage.toUpperCase()} language. The user's original request was in ${userLanguage.toUpperCase()}, so your entire response must be in ${userLanguage.toUpperCase()}.

Language-specific headers:
- Russian: **Машина**, **Рейтинг**, **Кэшбек и Купоны**
- English: **Vehicle**, **Rating**, **Cashback & Coupons**
- German: **Fahrzeug**, **Bewertung**, **Cashback & Gutscheine**
- French: **Véhicule**, **Note**, **Cashback & Coupons**
- Chinese: **车辆**, **评分**, **返现和优惠券**`;

        const messages = [
          { role: 'system', content: systemPromptWithLanguage },
          { role: 'user', content: userMessage }
        ];

        try {
          const llmResponse = await this.makeLLMRequest(messages);
          const analysis = llmResponse.content;
          llmAnalysisCache[supplierName] = analysis;
          console.log(`  ✅ LLM analysis cached for supplier: ${supplierName}`);
        } catch (llmError) {
          console.error(`  ❌ LLM analysis failed for supplier ${supplierName}:`, llmError);
          llmAnalysisCache[supplierName] = `Ошибка анализа для ${supplierName}: ${llmError}`;
        }
      }));

      // Create comprehensive summary data
      const summary = {
        totalOptions: sortedOptions.length,
        cheapest: sortedOptions[0],
        mostExpensive: sortedOptions[sortedOptions.length - 1],
        averagePrice: Math.round(sortedOptions.reduce((sum, opt) => sum + opt.price.amount, 0) / sortedOptions.length),
        priceRange: {
          min: sortedOptions[0].price.amount,
          max: sortedOptions[sortedOptions.length - 1].price.amount
        }
      };

      // Add cached analysis to each option
      const analyzedOptions = sortedOptions.map(option => {
        const cachedAnalysis = llmAnalysisCache[option.provider] || `Анализ недоступен для ${option.provider}`;
        return {
          ...option,
          analysis: cachedAnalysis
        };
      });

      // Group options by supplier for better presentation
      const groupedBySupplier: Record<string, any> = {};
      analyzedOptions.forEach(option => {
        if (!groupedBySupplier[option.provider]) {
          groupedBySupplier[option.provider] = {
            supplier: option.provider,
            analysis: option.analysis,
            options: []
          };
        }
        groupedBySupplier[option.provider].options.push(option);
      });

      // Create response with grouped options
      const llmAnalysis = Object.values(groupedBySupplier).map((group: any) => {
        const optionsList = group.options.map((opt: TransferOption) => `  • €${opt.price.amount} - ${opt.carDetails.description}`).join('\n');
        return `**${group.supplier}**\n${group.analysis}\n\n**Доступные варианты:**\n${optionsList}`;
      }).join('\n\n');
      
      console.log('✅ All individual LLM analyses completed');

      return {
        success: true,
        message: llmAnalysis,
        data: analyzedOptions
      };

    } catch (error) {
      console.error('Error searching and analyzing transfers:', error);
      return {
        success: false,
        message: `Failed to search for transfers: ${error}`,
        data: null
      };
    }
  }

  // Mock transfer options for development
  private async getMockTransferOptions(transferData: TransferData): Promise<any[]> {
    return [
      {
        supplierName: 'Vienna Transfer Pro',
        carDetails: {
          description: 'Executive Sedan',
          modelDescription: 'BMW 5 Series',
          luggage: 3
        },
        price: 45,
        currency: 'EUR',
        duration: '25 minutes',
        bookingUrl: 'https://example.com/book1'
      },
      {
        supplierName: 'Airport Express',
        carDetails: {
          description: 'Standard Vehicle',
          modelDescription: 'VW Passat',
          luggage: 2
        },
        price: 35,
        currency: 'EUR',
        duration: '30 minutes',
        bookingUrl: 'https://example.com/book2'
      },
      {
        supplierName: 'Luxury Transfers Vienna',
        carDetails: {
          description: 'Premium Minivan',
          modelDescription: 'Mercedes V-Class',
          luggage: 4
        },
        price: 65,
        currency: 'EUR',
        duration: '35 minutes',
        bookingUrl: 'https://example.com/book3'
      }
    ];
  }

  // Helper methods for vehicle analysis
  private extractCapacity(option: any): number {
    const desc = (option.carDetails?.description || option.carDetails?.modelDescription || '').toLowerCase();
    const match = desc.match(/(\d+)\s*(passenger|seat|person)/);
    if (match) return parseInt(match[1]);
    
    // Default based on vehicle type
    if (desc.includes('minivan') || desc.includes('people carrier')) return 6;
    if (desc.includes('executive') || desc.includes('premium')) return 4;
    return 4;
  }

  // Get supplier official website
  private async getSupplierWebsite(supplierName: string): Promise<any> {
    if (!supplierName) return null;
    
    try {
      console.log(`🔍 Searching website for supplier: ${supplierName}`);
      
      const websiteResult = await googleSearchService.searchCompanyWebsite(supplierName);
      
      if (websiteResult.found && websiteResult.websiteUrl) {
        console.log(`✅ Found website for ${supplierName}: ${websiteResult.websiteUrl}`);
        return {
          websiteUrl: websiteResult.websiteUrl,
          confidence: websiteResult.confidence,
          found: true
        };
      } else {
        console.log(`❌ No website found for ${supplierName}`);
        return {
          websiteUrl: null,
          confidence: 'low',
          found: false
        };
      }
    } catch (error) {
      console.error('❌ Error getting supplier website:', error);
      return {
        websiteUrl: null,
        confidence: 'low',
        found: false
      };
    }
  }

  // Get raw search results for ratings
  private async getRawSupplierRatings(supplierName: string): Promise<any> {
    if (!supplierName) return null;
    
    try {
      console.log(`🔍 Getting raw ratings data for: ${supplierName}`);
      
      const [trustpilotResult, tripadvisorResult, generalRatingResult] = await Promise.all([
        googleSearchService.searchTrustpilotRating(supplierName),
        googleSearchService.searchTripAdvisorRating(supplierName),
        googleSearchService.searchGeneralRating(supplierName)
      ]);
      
      return {
        trustpilot: trustpilotResult,
        tripadvisor: tripadvisorResult,
        general: generalRatingResult
      };
    } catch (error) {
      console.error('❌ Error getting raw supplier ratings:', error);
      return null;
    }
  }

  // Get raw search results for cashback/coupons
  private async getRawSupplierCashbackAndCoupons(supplierName: string): Promise<any> {
    if (!supplierName) return null;
    
    try {
      console.log(`🔍 Getting raw cashback data for: ${supplierName}`);
      
      const [cashbackResult, couponResult] = await Promise.all([
        googleSearchService.searchCashbackOffers(supplierName),
        googleSearchService.searchCouponOffers(supplierName)
      ]);
      
      return {
        cashback: cashbackResult,
        coupon: couponResult
      };
    } catch (error) {
      console.error('❌ Error getting raw supplier cashback:', error);
      return null;
    }
  }

  // Analyze ratings for one supplier with LLM
  private async analyzeSupplierRatingsWithLLM(supplierName: string, searchResults: any): Promise<any> {
    try {
      console.log(`🤖 Starting LLM analysis for ratings of: ${supplierName}`);
      
      // For now, return mock data
      return {
        found: true,
        ratings: [],
        bestRating: {
          source: 'Trustpilot',
          rating: '4.2',
          ratingCount: 150,
          url: 'https://trustpilot.com'
        },
        summary: 'Хорошие отзывы клиентов'
      };
    } catch (error) {
      console.error(`❌ Error analyzing ratings with LLM for ${supplierName}:`, error);
      return {
        found: false,
        ratings: [],
        bestRating: null,
        summary: 'Рейтинг не найден'
      };
    }
  }

  // Analyze cashback/coupons for one supplier with LLM
  private async analyzeSupplierCashbackWithLLM(supplierName: string, searchResults: any): Promise<any> {
    try {
      console.log(`🤖 Starting LLM analysis for cashback/coupons of: ${supplierName}`);
      
      // For now, return mock data
      return {
        found: true,
        cashback: { available: false, description: "Кэшбек не найден" },
        coupons: { available: true, discount: "10% Off", description: "Доступны купоны" },
        summary: "Найдены купоны со скидкой"
      };
    } catch (error) {
      console.error(`❌ Error analyzing cashback with LLM for ${supplierName}:`, error);
      return {
        found: false,
        cashback: { available: false, description: "Кэшбек не найден" },
        coupons: { available: false, description: "Купоны не найдены" },
        summary: "Кэшбек и купоны не найдены"
      };
    }
  }

  // Generate consistent rating text for a supplier
  private generateRatingText(ratingsAnalysis: any): string {
    if (!ratingsAnalysis || !ratingsAnalysis.found) {
      return 'Rating: Not found';
    }
    
    if (ratingsAnalysis.bestRating) {
      const rating = ratingsAnalysis.bestRating.rating;
      const source = ratingsAnalysis.bestRating.source;
      const count = ratingsAnalysis.bestRating.ratingCount;
      
      if (count && count > 1) {
        return `Rating: ${rating} out of 5 (based on ${count} reviews)`;
      } else {
        return `Rating: ${rating} out of 5 (${source})`;
      }
    }
    
    return 'Rating: Not found';
  }

  // Generate consistent cashback text for a supplier
  private generateCashbackText(cashbackAnalysis: any): string {
    if (!cashbackAnalysis || !cashbackAnalysis.found) {
      return ' - Cashback: None available';
    }
    
    const cashback = cashbackAnalysis.cashback;
    const coupons = cashbackAnalysis.coupons;
    
    let result = ' - Cashback: ';
    
    if (cashback && cashback.available) {
      result += `${cashback.percentage || 'Available'}`;
      if (cashback.conditions) {
        result += ` (${cashback.conditions})`;
      }
    } else if (coupons && coupons.available) {
      result += `Coupons: ${coupons.discount || 'Available'}`;
      if (coupons.conditions) {
        result += ` (${coupons.conditions})`;
      }
    } else {
      result += 'None available';
    }
    
    return result;
  }

  // Replace time placeholders in prompts with current time
  private replaceTimePlaceholders(prompt: string): string {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const currentYear = now.getFullYear().toString();
    
    return prompt
      .replace(/\{\{CURRENT_DATE\}\}/g, currentDate)
      .replace(/\{\{CURRENT_TIME\}\}/g, currentTime)
      .replace(/\{\{CURRENT_YEAR\}\}/g, currentYear);
  }

  // Real LLM API call
  private async makeLLMRequest(messages: Array<{ role: string; content: string }>): Promise<any> {
    if (!this.apiKey) {
      throw new Error('LLM API key not configured');
    }

    const requestBody = {
      model: this.model,
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message;
  }
}

const transferAnalysisService = new TransferAnalysisService();
export default transferAnalysisService;
