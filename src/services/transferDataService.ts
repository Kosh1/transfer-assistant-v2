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
      status: 'collecting'
    };
  }

  async extractTransferDetails(message: string, conversationHistory: Array<{ role: string; content: string }> = []): Promise<LLMResponse> {
    try {
      console.log('Processing user message:', message);
      
      // Replace placeholders in prompt
      const prompt = replaceTimePlaceholders(TRANSFER_DATA_PROMPTS.COLLECT_TRANSFER_DATA);
      
      // Prepare messages for LLM
      const messages = [
        { role: 'system', content: prompt },
        ...conversationHistory.slice(-10), // Last 10 messages for context
        { role: 'user', content: message }
      ];

      // Call LLM API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🔍 Full LLM API response:', JSON.stringify(result, null, 2));
      
      const choice = result.choices[0];
      const llmMessage = choice.message;
      console.log('🔍 LLM message:', JSON.stringify(llmMessage, null, 2));

      // Check for function calls
      if (llmMessage.function_call) {
        console.log('🔍 Function call:', llmMessage.function_call.name, JSON.parse(llmMessage.function_call.arguments));
        
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
          // Continue with the original message processing
        }
      } else {
        console.log('❌ No function call found in LLM response');
        
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
          language: 'en',
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
          language: 'en',
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
        language: 'en',
        isComplete: this.currentData.status === 'complete'
      };
      const searchResults = await transferAnalysisService.default.searchAndAnalyzeTransfers(transferData, 'ru');
      
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
          language: 'en',
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
          language: 'en',
          isComplete: this.currentData.status === 'complete'
        },
        searchResults: null,
        needsClarification: false
      };
    }
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
      status: 'collecting'
    };
  }
}

const transferDataService = new TransferDataService();
export default transferDataService;
