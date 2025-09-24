// Transfer data types
export interface TransferData {
  passengers: number;
  luggage: number;
  from: string;
  to: string;
  date: string;
  time: string;
  language: string;
  isComplete: boolean;
}

// Transfer option from booking.com
export interface TransferOption {
  rank: number;
  provider: string;
  carDetails: {
    description: string;
    capacity: number;
    luggage: number;
  };
  price: {
    amount: number;
    currency: string;
    originalAmount?: number;
    discount?: number;
  };
  duration: string;
  rating?: {
    score: number;
    count: number;
    source: string;
    url?: string; // URL источника рейтинга
  };
  allRatings?: {
    score: number;
    count: number;
    source: string;
    url?: string;
  }[]; // Все найденные рейтинги
  cashback?: {
    amount: number;
    currency: string;
    percentage: number;
  };
  allCashback?: {
    amount: number;
    currency: string;
    percentage: number;
    description?: string;
  }[]; // Все найденные кэшбек предложения
  coupons?: string[];
  allCoupons?: {
    code: string;
    discount: string;
    description?: string;
    conditions?: string;
  }[]; // Все найденные купоны с деталями
  website?: string;
  bookingUrl: string;
  analysis?: string;
}

// Chat message types
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// LLM service response
export interface LLMResponse {
  response: string;
  extractedData: Partial<TransferData>;
  needsClarification: boolean;
  userLanguage?: string;
}

// Transfer analysis response
export interface TransferAnalysisResponse {
  success: boolean;
  message: string;
  data: TransferOption[] | null;
}

// Audio transcription response
export interface AudioTranscriptionResponse {
  transcription: string;
}

// Session data
export interface SessionData {
  id: string;
  messages: ChatMessage[];
  transferData?: TransferData;
  createdAt: Date;
  updatedAt: Date;
}
