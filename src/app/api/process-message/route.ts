import { NextRequest, NextResponse } from 'next/server';
import llmService from '../../../services/llmService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message, userLanguage = 'en' } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Processing message:', message);
    console.log('🌍 User language:', userLanguage);

    // Process message through LLM service
    const result = await llmService.processUserMessage(message, userLanguage);

    console.log('✅ LLM Service result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error processing message:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        response: "Sorry, I didn't quite understand your request. Can you clarify the transfer details?",
        extractedData: {},
        needsClarification: true
      },
      { status: 500 }
    );
  }
}
