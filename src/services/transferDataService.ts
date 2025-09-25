// Transfer Data Service - TypeScript version
// This service handles the collection and validation of transfer booking data

import { TransferData } from '../types';
import googleSearchService from './googleSearchService';
import { TRANSFER_DATA_PROMPTS, replaceTimePlaceholders } from '../prompts/transferPrompts';

interface CurrentData {
  from: string | null;
  to: string | null;
  passengers: number | null;
  luggage: number | null;
  date: string | null;
  time: string | null;
  status: 'collecting' | 'complete';
  language: string;
}

interface LLMResponse {
  response: string;
  extractedData: Partial<TransferData>;
  searchResults: any;
  needsClarification: boolean;
}


class TransferDataService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private currentData: CurrentData;

  constructor() {
    this.apiKey = process.env.REACT_APP_LLM_API_KEY || '';
    this.apiUrl = process.env.REACT_APP_LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.REACT_APP_LLM_MODEL || 'gpt-4o-mini';
    this.currentData = {
      from: null,
      to: null,
      passengers: null,
      luggage: null,
      date: null,
      time: null,
      status: 'collecting',
      language: 'en'
    };
  }

  async extractTransferDetails(message: string, conversationHistory: Array<{ role: string; content: string }> = [], userLanguage: string = 'en'): Promise<LLMResponse> {
    try {
      console.log('Processing user message:', message);
      console.log('🌍 User language:', userLanguage);
      
      // Use provided language or detect from message
      const detectedLanguage = userLanguage || this.detectLanguage(message);
      this.currentData.language = detectedLanguage;
      console.log('🌍 Using language:', detectedLanguage);
      
      // Replace placeholders in prompt with language information
      const prompt = replaceTimePlaceholders(TRANSFER_DATA_PROMPTS.COLLECT_TRANSFER_DATA, detectedLanguage);
      
      // Prepare messages for LLM
      const messages = [
        { role: 'system', content: prompt },
        ...conversationHistory.slice(-10), // Last 10 messages for context
        { role: 'user', content: message }
      ];

      // Call LLM API
      console.log('🔑 TransferDataService - API Key exists:', !!this.apiKey);
      console.log('🔑 TransferDataService - API Key length:', this.apiKey?.length);
      console.log('🔑 TransferDataService - API Key starts with:', this.apiKey?.substring(0, 10));
      console.log('🤖 TransferDataService - Model:', this.model);
      console.log('🌐 TransferDataService - API URL:', this.apiUrl);

      const requestBody = {
        model: this.model,
        messages: messages,
        functions: [
          {
            name: 'extract_transfer_data',
            description: 'Extract and save transfer booking information',
            parameters: {
              type: 'object',
              properties: {
                from: { type: 'string', description: 'Pickup location' },
                to: { type: 'string', description: 'Destination location' },
                passengers: { type: 'number', description: 'Number of passengers' },
                luggage: { type: 'number', description: 'Number of luggage pieces' },
                date: { type: 'string', description: 'Travel date in YYYY-MM-DD format' },
                time: { type: 'string', description: 'Travel time in HH:MM format' },
                status: { type: 'string', enum: ['collecting', 'complete'], description: 'Data collection status' }
              },
              required: ['from', 'to', 'passengers', 'luggage', 'date', 'time', 'status']
            }
          },
          {
            name: 'search_address_in_google',
            description: 'Search and validate addresses using Google Search',
            parameters: {
              type: 'object',
              properties: {
                address: { type: 'string', description: 'Address to search and validate' }
              },
              required: ['address']
            }
          }
        ],
        function_call: 'auto',
        temperature: 0.1
      };

      console.log('📤 TransferDataService - Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 TransferDataService - Response status:', response.status);
      console.log('📥 TransferDataService - Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ TransferDataService - API Error Response:', errorText);
        throw new Error(`LLM API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🔍 Full LLM API response:', JSON.stringify(result, null, 2));
      
      const choice = result.choices[0];
      const llmMessage = choice.message;
      console.log('🔍 LLM message:', JSON.stringify(llmMessage, null, 2));

      // Check for function calls
      if (llmMessage.function_call) {
        console.log('🔍 Function call found:', llmMessage.function_call.name);
        console.log('🔍 Function call arguments:', llmMessage.function_call.arguments);
        
        if (llmMessage.function_call.name === 'extract_transfer_data') {
          const args = JSON.parse(llmMessage.function_call.arguments);
          this.currentData = { ...this.currentData, ...args };
          console.log('🔍 Function call extracted data:', this.currentData);
          
          // If data collection is complete, proceed to search
          if (args.status === 'complete') {
            return await this.proceedToSearch();
          }
        } else if (llmMessage.function_call.name === 'search_address_in_google') {
          const args = JSON.parse(llmMessage.function_call.arguments);
          const searchResult = await googleSearchService.searchAddress(args.address);
          
          // Return validation result to user
          if (!searchResult.isInVienna) {
            return {
              response: `I found that "${args.address}" is not in Vienna. We only provide transfers within Vienna and Vienna Airport. ${searchResult.clarification || 'Please provide a Vienna address or landmark.'}`,
              extractedData: {
                from: this.currentData.from || undefined,
                to: this.currentData.to || undefined,
                passengers: this.currentData.passengers || undefined,
                luggage: this.currentData.luggage || undefined,
                date: this.currentData.date || undefined,
                time: this.currentData.time || undefined,
                language: this.currentData.language,
                isComplete: this.currentData.status === 'complete'
              },
              searchResults: null,
              needsClarification: true
            };
          } else {
            return {
              response: `Great! I confirmed that "${args.address}" is in Vienna. Please provide the rest of your transfer details.`,
              extractedData: {
                from: this.currentData.from || undefined,
                to: this.currentData.to || undefined,
                passengers: this.currentData.passengers || undefined,
                luggage: this.currentData.luggage || undefined,
                date: this.currentData.date || undefined,
                time: this.currentData.time || undefined,
                language: this.currentData.language,
                isComplete: this.currentData.status === 'complete'
              },
              searchResults: null,
              needsClarification: true
            };
          }
        }
      } else {
        console.log('❌ No function call found in LLM response');
        console.log('📝 LLM response content:', llmMessage.content);
        
        // Try to parse function call from text content
        const functionCallMatch = llmMessage.content.match(/\[Call extract_transfer_data with: ([^\]]+)\]/);
        if (functionCallMatch) {
          console.log('🔍 Found function call in text:', functionCallMatch[1]);
          
          try {
            // Parse the function call arguments from text
            const argsText = functionCallMatch[1];
            const args: any = {};
            
            // Extract each parameter
            const fromMatch = argsText.match(/from="([^"]+)"/);
            const toMatch = argsText.match(/to="([^"]+)"/);
            const passengersMatch = argsText.match(/passengers=(\d+)/);
            const luggageMatch = argsText.match(/luggage=(\d+)/);
            const dateMatch = argsText.match(/date="([^"]+)"/);
            const timeMatch = argsText.match(/time="([^"]+)"/);
            const statusMatch = argsText.match(/status="([^"]+)"/);
            
            if (fromMatch) args.from = fromMatch[1];
            if (toMatch) args.to = toMatch[1];
            if (passengersMatch) args.passengers = parseInt(passengersMatch[1]);
            if (luggageMatch) args.luggage = parseInt(luggageMatch[1]);
            if (dateMatch) args.date = dateMatch[1];
            if (timeMatch) args.time = timeMatch[1];
            if (statusMatch) args.status = statusMatch[1];
            
            console.log('🔍 Parsed function arguments:', args);
            
            this.currentData = { ...this.currentData, ...args };
            console.log('🔍 Function call extracted data:', this.currentData);
            
            // If data collection is complete, proceed to search
            if (args.status === 'complete') {
              const searchResult = await this.proceedToSearch();
              return searchResult;
            }
          } catch (error) {
            console.error('❌ Error parsing function call from text:', error);
          }
        }
      }

      // Clean response content (remove function call from text)
      let cleanResponse = llmMessage.content || "I'm collecting your transfer details. Please provide the missing information.";
      cleanResponse = cleanResponse.replace(/\[Call extract_transfer_data with: [^\]]+\]/g, '').trim();

      // Return current status
      return {
        response: cleanResponse,
        extractedData: {
          from: this.currentData.from || undefined,
          to: this.currentData.to || undefined,
          passengers: this.currentData.passengers || undefined,
          luggage: this.currentData.luggage || undefined,
          date: this.currentData.date || undefined,
          time: this.currentData.time || undefined,
          language: this.currentData.language,
          isComplete: this.currentData.status === 'complete'
        },
        searchResults: null,
        needsClarification: this.currentData.status === 'collecting'
      };

    } catch (error) {
      console.error('Error in extractTransferDetails:', error);
      return {
        response: "Sorry, I encountered an error processing your request. Please try again.",
        extractedData: {
          from: this.currentData.from || undefined,
          to: this.currentData.to || undefined,
          passengers: this.currentData.passengers || undefined,
          luggage: this.currentData.luggage || undefined,
          date: this.currentData.date || undefined,
          time: this.currentData.time || undefined,
          language: this.currentData.language,
          isComplete: this.currentData.status === 'complete'
        },
        searchResults: null,
        needsClarification: true
      };
    }
  }

  private async proceedToSearch(): Promise<LLMResponse> {
    try {
      console.log('🚀 All data collected, proceeding to search...');
      
      // Validate addresses before searching
      console.log('🔍 Validating addresses before search...');
      const fromValidation = await googleSearchService.searchAddress(this.currentData.from || '');
      const toValidation = await googleSearchService.searchAddress(this.currentData.to || '');
      
      console.log('🔍 From address validation:', fromValidation);
      console.log('🔍 To address validation:', toValidation);
      
      // Check if both addresses are in Vienna
      if (!fromValidation.isInVienna || !toValidation.isInVienna) {
        const invalidAddresses = [];
        if (!fromValidation.isInVienna) {
          invalidAddresses.push(`"${this.currentData.from}" (${fromValidation.clarification || 'not in Vienna'})`);
        }
        if (!toValidation.isInVienna) {
          invalidAddresses.push(`"${this.currentData.to}" (${toValidation.clarification || 'not in Vienna'})`);
        }
        
        return {
          response: `I found that the following addresses are not in Vienna: ${invalidAddresses.join(', ')}. We only provide transfers within Vienna and Vienna Airport. Please provide Vienna addresses or landmarks for your transfer.`,
          extractedData: {
            from: this.currentData.from || undefined,
            to: this.currentData.to || undefined,
            passengers: this.currentData.passengers || undefined,
            luggage: this.currentData.luggage || undefined,
            date: this.currentData.date || undefined,
            time: this.currentData.time || undefined,
            language: this.currentData.language,
            isComplete: false
          },
          searchResults: null,
          needsClarification: true
        };
      }
      
      console.log('✅ Both addresses are in Vienna, proceeding to search...');
      
      // Import transfer analysis service
      const transferAnalysisService = await import('./transferAnalysisService');
      
      // Search for transfers
      const transferData: TransferData = {
        from: this.currentData.from || '',
        to: this.currentData.to || '',
        passengers: this.currentData.passengers || 1,
        luggage: this.currentData.luggage || 1,
        date: this.currentData.date || '',
        time: this.currentData.time || '',
        language: this.currentData.language,
        isComplete: this.currentData.status === 'complete'
      };
      const searchResults = await transferAnalysisService.default.searchAndAnalyzeTransfers(transferData, this.currentData.language);
      
      console.log('🔍 TransferDataService searchResults:', JSON.stringify(searchResults, null, 2));
      
      const finalResult: LLMResponse = {
        response: "Great! I found some transfer options for you. Let me analyze them and provide recommendations.",
        extractedData: {
          from: this.currentData.from || undefined,
          to: this.currentData.to || undefined,
          passengers: this.currentData.passengers || undefined,
          luggage: this.currentData.luggage || undefined,
          date: this.currentData.date || undefined,
          time: this.currentData.time || undefined,
          language: this.currentData.language,
          isComplete: this.currentData.status === 'complete'
        },
        searchResults: searchResults,
        needsClarification: false
      };
      
      console.log('🔍 TransferDataService final result:', JSON.stringify(finalResult, null, 2));
      
      return finalResult;
    } catch (error) {
      console.error('Error in proceedToSearch:', error);
      return {
        response: "I found your transfer details, but encountered an error searching for options. Please try again.",
        extractedData: {
          from: this.currentData.from || undefined,
          to: this.currentData.to || undefined,
          passengers: this.currentData.passengers || undefined,
          luggage: this.currentData.luggage || undefined,
          date: this.currentData.date || undefined,
          time: this.currentData.time || undefined,
          language: this.currentData.language,
          isComplete: this.currentData.status === 'complete'
        },
        searchResults: null,
        needsClarification: false
      };
    }
  }


  private detectLanguage(message: string): string {
    // Simple language detection based on common words
    const russianWords = ['привет', 'здравствуйте', 'спасибо', 'пожалуйста', 'да', 'нет', 'хорошо', 'плохо'];
    const frenchWords = ['bonjour', 'merci', 'oui', 'non', 'bien', 'mal', 'excusez', 'pardon'];
    const spanishWords = ['hola', 'gracias', 'sí', 'no', 'bien', 'mal', 'perdón', 'disculpe'];
    const germanWords = ['hallo', 'danke', 'ja', 'nein', 'gut', 'schlecht', 'entschuldigung'];
    const italianWords = ['ciao', 'grazie', 'sì', 'no', 'bene', 'male', 'scusi', 'mi dispiace'];
    const chineseWords = ['你好', '谢谢', '是', '不', '好', '坏', '对不起', '抱歉'];
    
    const lowerMessage = message.toLowerCase();
    
    if (russianWords.some(word => lowerMessage.includes(word))) return 'ru';
    if (frenchWords.some(word => lowerMessage.includes(word))) return 'fr';
    if (spanishWords.some(word => lowerMessage.includes(word))) return 'es';
    if (germanWords.some(word => lowerMessage.includes(word))) return 'de';
    if (italianWords.some(word => lowerMessage.includes(word))) return 'it';
    if (chineseWords.some(word => lowerMessage.includes(word))) return 'zh';
    
    return 'en'; // Default to English
  }

  getCurrentData(): CurrentData {
    return this.currentData;
  }

  resetData(): void {
    this.currentData = {
      from: null,
      to: null,
      passengers: null,
      luggage: null,
      date: null,
      time: null,
      status: 'collecting',
      language: 'en'
    };
  }
}

const transferDataService = new TransferDataService();
export default transferDataService;
