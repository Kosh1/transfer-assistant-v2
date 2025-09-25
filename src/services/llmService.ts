import { LLMResponse, TransferData } from '../types';
import transferDataService from './transferDataService';

class LLMService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private conversationHistory: Array<{ role: string; content: string }>;

  constructor() {
    this.apiKey = process.env.REACT_APP_LLM_API_KEY || '';
    this.apiUrl = process.env.REACT_APP_LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.REACT_APP_LLM_MODEL || 'gpt-4o-mini';
    this.conversationHistory = [];
    
    console.log('🔑 LLM Service - API Key exists:', !!this.apiKey);
    console.log('🔑 LLM Service - API Key length:', this.apiKey?.length);
    console.log('🔑 LLM Service - API Key starts with:', this.apiKey?.substring(0, 10));
    console.log('🤖 LLM Service - Model:', this.model);
    console.log('🌐 LLM Service - API URL:', this.apiUrl);
    
    if (!this.apiKey) {
      console.error('❌ LLM API key not configured');
      // Не выбрасываем ошибку в конструкторе, проверяем при использовании
    } else {
      console.log('🤖 LLM Service initialized as coordinator on server');
    }
  }

  async processUserMessage(message: string, userLanguage: string = 'en'): Promise<LLMResponse> {
    try {
      console.log('🔄 Processing user message through coordinator:', message);
      console.log('🌍 User language:', userLanguage);
      
      // Add user message to history
      this.addToHistory('user', message);
      
      // Use provided language or detect from message
      const language = userLanguage || this.detectLanguage(message);
      console.log('🌍 Using language:', language);
      
      // Process through transfer data service
      const result = await transferDataService.extractTransferDetails(message, this.conversationHistory, language);
      
      console.log('🔍 LLM Service result:', JSON.stringify(result, null, 2));
      
      // Add assistant response to history
      if (result.response) {
        this.addToHistory('assistant', result.response);
      }
      
      return result;
    } catch (error) {
      console.error('LLM processing error:', error);
      return {
        response: "Sorry, I didn't quite understand your request. Can you clarify the transfer details?",
        extractedData: {},
        needsClarification: true
      };
    }
  }

  async extractTransferDetails(message: string, history: Array<{ role: string; content: string }>): Promise<LLMResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('LLM API key not configured');
      }

      const systemPrompt = `You are a helpful transfer assistant for Vienna. Extract transfer details from user messages and respond naturally.

Current conversation context:
${history.map(h => `${h.role}: ${h.content}`).join('\n')}

Extract the following information from the user's message:
- from: departure location
- to: destination location  
- passengers: number of passengers
- luggage: number of luggage pieces
- date: departure date
- time: departure time

If any information is missing, ask for clarification in a friendly way.
If you have all the information, confirm the details and indicate you're ready to search.

Respond in JSON format:
{
  "response": "your natural response to the user",
  "extractedData": {
    "from": "location or null",
    "to": "location or null", 
    "passengers": number or null,
    "luggage": number or null,
    "date": "YYYY-MM-DD or null",
    "time": "HH:MM or null"
  },
  "needsClarification": true/false,
  "userLanguage": "detected language code"
}`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from LLM');
      }

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(content);
        return {
          response: parsed.response,
          extractedData: parsed.extractedData || {},
          needsClarification: parsed.needsClarification || false,
          userLanguage: parsed.userLanguage || this.detectLanguage(message)
        };
      } catch (parseError) {
        // If JSON parsing fails, return the raw response
        return {
          response: content,
          extractedData: {},
          needsClarification: true,
          userLanguage: this.detectLanguage(message)
        };
      }
    } catch (error) {
      console.error('Transfer details extraction error:', error);
      return {
        response: "I'm having trouble processing your request. Please try again.",
        extractedData: {},
        needsClarification: true,
        userLanguage: this.detectLanguage(message)
      };
    }
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<{ text: string }> {
    try {
      if (!this.apiKey) {
        throw new Error('LLM API key not configured');
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      const arrayBuffer = audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength);
      const audioBlob = new Blob([arrayBuffer], { type: 'audio/webm' });
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'auto');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI Whisper API error:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return { text: result.text };
    } catch (error) {
      console.error('Audio transcription error:', error);
      throw error;
    }
  }

  detectLanguage(message: string): string {
    // Simple language detection based on common words
    const russianWords = ['из', 'в', 'аэропорт', 'поеду', 'двое', 'чемодана', 'завтра', 'послезавтра'];
    const germanWords = ['von', 'nach', 'flughafen', 'fahre', 'morgen', 'übermorgen'];
    const frenchWords = ['de', 'à', 'aéroport', 'aller', 'demain', 'après-demain'];
    
    const lowerMessage = message.toLowerCase();
    
    if (russianWords.some(word => lowerMessage.includes(word))) {
      return 'ru';
    } else if (germanWords.some(word => lowerMessage.includes(word))) {
      return 'de';
    } else if (frenchWords.some(word => lowerMessage.includes(word))) {
      return 'fr';
    }
    
    return 'en'; // Default to English
  }

  addToHistory(role: string, content: string): void {
    this.conversationHistory.push({ role, content });
    
    // Keep only last 20 messages to prevent context overflow
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
    
    console.log(`📝 Added to history (${role}):`, content.substring(0, 50) + '...');
  }

  getConversationHistory(): Array<{ role: string; content: string }> {
    return this.conversationHistory;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  async generateCarDescription(carModel: string, userLanguage: string = 'en'): Promise<string> {
    try {
      if (!this.apiKey) {
        return '';
      }

      const systemPrompt = `You are a car expert. Based on the car model provided, give a brief 2-3 word description of the vehicle type in the user's language.

Examples:
- "Skoda Octavia" -> "обычная легковая" (ru) / "regular sedan" (en) / "berline normale" (fr)
- "BMW 5 Series" -> "премиум седан" (ru) / "premium sedan" (en) / "berline premium" (fr)
- "Mercedes V-Class" -> "большой минивен" (ru) / "large minivan" (en) / "grand monospace" (fr)
- "VW Passat" -> "семейный седан" (ru) / "family sedan" (en) / "berline familiale" (fr)

Respond with ONLY the description, no additional text.`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Car model: ${carModel}. Language: ${userLanguage}. Describe this car type briefly.` }
          ],
          temperature: 0.3,
          max_tokens: 50
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const result = await response.json();
      const description = result.choices[0]?.message?.content?.trim();
      
      return description || '';
    } catch (error) {
      console.error('Car description generation error:', error);
      return '';
    }
  }
}

const llmService = new LLMService();
export default llmService;
