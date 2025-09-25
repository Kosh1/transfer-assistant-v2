// Тест мок-сервиса
const mockLLMService = require('./src/services/mockLLMService.ts');

async function testMock() {
    console.log('🧪 Testing Mock LLM Service...');
    
    try {
        const result = await mockLLMService.processUserMessage(
            "Ok can you take me from Vienna to vienna airport tomorrow at 20, 2 pax and 2 bags",
            "en"
        );
        
        console.log('✅ Mock LLM result:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('❌ Mock LLM error:', error);
    }
}

testMock();
