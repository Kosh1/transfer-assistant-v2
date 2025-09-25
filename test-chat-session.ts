// Тестовый файл для проверки функциональности чат-сессий
import { ChatSessionService } from './src/services/chatSessionService';

async function testChatSession() {
  console.log('🧪 Testing Chat Session Service...');
  
  try {
    const chatService = new ChatSessionService('test-user');
    
    // Создание сессии
    console.log('📝 Creating new session...');
    const sessionId = await chatService.createSession('Hello, I need a transfer');
    console.log('✅ Created session:', sessionId);
    
    // Добавление сообщений
    console.log('💬 Adding messages...');
    await chatService.addMessage(sessionId, 'Hello, I need a transfer', 'user');
    await chatService.addMessage(sessionId, 'I can help you with that! Where are you going?', 'assistant');
    await chatService.addMessage(sessionId, 'From Paris to London', 'user');
    await chatService.addMessage(sessionId, 'Great! When do you need to travel?', 'assistant');
    console.log('✅ Messages added successfully');
    
    // Получение сообщений
    console.log('📖 Fetching session messages...');
    const messages = await chatService.getSessionMessages(sessionId);
    console.log('✅ Messages retrieved:', messages.length, 'messages');
    messages.forEach((msg, index) => {
      console.log(`  ${index + 1}. [${msg.sender_type}] ${msg.content}`);
    });
    
    // Получение информации о сессии
    console.log('📋 Fetching session info...');
    const session = await chatService.getSession(sessionId);
    console.log('✅ Session info:', session);
    
    // Получение всех сессий пользователя
    console.log('👤 Fetching user sessions...');
    const userSessions = await chatService.getUserSessions();
    console.log('✅ User sessions:', userSessions.length, 'sessions');
    
    console.log('🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Запуск тестов
if (require.main === module) {
  testChatSession();
}

export { testChatSession };
