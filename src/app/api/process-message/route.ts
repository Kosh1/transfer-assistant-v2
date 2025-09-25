import { NextRequest, NextResponse } from 'next/server';
import llmService from '../../../services/llmService';
import { ChatSessionService } from '../../../services/chatSessionService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message, userLanguage = 'en', sessionId, userId = 'anonymous' } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Processing message:', message);
    console.log('🌍 User language:', userLanguage);
    console.log('👤 User ID:', userId);
    console.log('💬 Session ID:', sessionId);

    // Инициализация сервиса чат-сессий
    const chatService = new ChatSessionService(userId);
    
    // Создание или получение сессии
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await chatService.createSession(message);
      console.log('🆕 Created new chat session:', currentSessionId);
    }

    // Сохранение сообщения пользователя
    await chatService.addMessage(currentSessionId, message, 'user');
    console.log('💾 Saved user message to database');

    // Process message through LLM service
    const result = await llmService.processUserMessage(message, userLanguage);

    console.log('✅ LLM Service result:', result);

    // Сохранение ответа ассистента
    await chatService.addMessage(currentSessionId, result.response, 'assistant');
    console.log('💾 Saved assistant response to database');

    return NextResponse.json({
      ...result,
      sessionId: currentSessionId
    });
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