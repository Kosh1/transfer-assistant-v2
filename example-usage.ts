// Пример использования Supabase интеграции в Transfer Assistant

import { ChatSessionService } from './src/services/chatSessionService';

// Пример 1: Создание новой сессии и добавление сообщений
async function createNewChatSession() {
  console.log('🚀 Creating new chat session...');
  
  const chatService = new ChatSessionService('user-123');
  
  // Создание сессии
  const sessionId = await chatService.createSession('I need a transfer from Paris to London');
  console.log('✅ Session created:', sessionId);
  
  // Добавление сообщений
  await chatService.addMessage(sessionId, 'I need a transfer from Paris to London', 'user');
  await chatService.addMessage(sessionId, 'I can help you with that! When do you need to travel?', 'assistant');
  await chatService.addMessage(sessionId, 'Tomorrow at 2 PM', 'user');
  await chatService.addMessage(sessionId, 'Perfect! How many passengers?', 'assistant');
  
  console.log('✅ Messages added to session');
  
  return sessionId;
}

// Пример 2: Загрузка истории чата
async function loadChatHistory(sessionId: string) {
  console.log('📖 Loading chat history...');
  
  const chatService = new ChatSessionService('user-123');
  const messages = await chatService.getSessionMessages(sessionId);
  
  console.log('📝 Chat history:');
  messages.forEach((msg, index) => {
    console.log(`  ${index + 1}. [${msg.sender_type}] ${msg.content}`);
  });
  
  return messages;
}

// Пример 3: Получение всех сессий пользователя
async function getUserSessions() {
  console.log('👤 Getting user sessions...');
  
  const chatService = new ChatSessionService('user-123');
  const sessions = await chatService.getUserSessions();
  
  console.log('📋 User sessions:');
  sessions.forEach((session, index) => {
    console.log(`  ${index + 1}. Session ${session.id} - ${session.first_message}`);
  });
  
  return sessions;
}

// Пример 4: Интеграция с API
async function sendMessageToAPI(message: string, sessionId?: string) {
  console.log('🌐 Sending message to API...');
  
  const response = await fetch('/api/process-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      userLanguage: 'en',
      sessionId: sessionId,
      userId: 'user-123'
    })
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const result = await response.json();
  console.log('✅ API response:', result);
  
  return result;
}

// Пример 5: Полный workflow
async function fullWorkflow() {
  try {
    console.log('🎯 Starting full workflow...');
    
    // 1. Создание сессии
    const sessionId = await createNewChatSession();
    
    // 2. Отправка сообщения через API
    const apiResult = await sendMessageToAPI('I need 2 passengers and 1 suitcase', sessionId);
    console.log('✅ API processed message:', apiResult.response);
    
    // 3. Загрузка истории
    await loadChatHistory(sessionId);
    
    // 4. Получение всех сессий пользователя
    await getUserSessions();
    
    console.log('🎉 Full workflow completed successfully!');
    
  } catch (error) {
    console.error('❌ Workflow failed:', error);
  }
}

// Экспорт функций для использования
export {
  createNewChatSession,
  loadChatHistory,
  getUserSessions,
  sendMessageToAPI,
  fullWorkflow
};

// Запуск примера
if (require.main === module) {
  fullWorkflow();
}
