// Мок-версия LLM сервиса для тестирования
class MockLLMService {
  async processUserMessage(message, userLanguage = 'en') {
    console.log('🤖 Mock LLM processing message:', message);
    console.log('🌍 User language:', userLanguage);
    
    // Простое извлечение данных из сообщения
    const extractedData = this.extractDataFromMessage(message);
    
    console.log('📊 Extracted data:', extractedData);
    
    // Проверяем, достаточно ли данных
    const hasRoute = extractedData.from && extractedData.to;
    const hasTiming = extractedData.date || extractedData.time;
    const hasPassengers = extractedData.passengers !== undefined && extractedData.passengers !== null;
    const hasLuggage = extractedData.luggage !== undefined && extractedData.luggage !== null;
    
    if (hasRoute && hasTiming && hasPassengers && hasLuggage) {
      console.log('✅ All data available, proceeding to search');
      return {
        response: "Great! I have all the information I need. Let me search for transfer options for you.",
        extractedData: {
          ...extractedData,
          isComplete: true
        },
        needsClarification: false
      };
    } else {
      console.log('⚠️ Missing data, asking for clarification');
      return {
        response: "I need a bit more information. Could you please provide your pickup location, destination, number of passengers, and luggage?",
        extractedData: extractedData,
        needsClarification: true
      };
    }
  }
  
  extractDataFromMessage(message) {
    const data = {};
    
    // Извлекаем количество пассажиров
    const passengerMatch = message.match(/(\d+)\s*(pax|passengers?|people)/i);
    if (passengerMatch) {
      data.passengers = parseInt(passengerMatch[1]);
    }
    
    // Извлекаем количество багажа
    const luggageMatch = message.match(/(\d+)\s*(bags?|luggage|suitcases?)/i);
    if (luggageMatch) {
      data.luggage = parseInt(luggageMatch[1]);
    }
    
    // Извлекаем время
    const timeMatch = message.match(/(\d{1,2}):?(\d{2})?/);
    if (timeMatch) {
      const hour = timeMatch[1];
      const minute = timeMatch[2] || '00';
      data.time = `${hour}:${minute}`;
    }
    
    // Извлекаем дату (завтра)
    if (message.toLowerCase().includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      data.date = tomorrow.toISOString().split('T')[0];
    }
    
    // Извлекаем маршрут
    if (message.toLowerCase().includes('vienna') && message.toLowerCase().includes('airport')) {
      data.from = 'Vienna';
      data.to = 'Vienna Airport';
    } else if (message.toLowerCase().includes('vienna airport') && message.toLowerCase().includes('vienna')) {
      data.from = 'Vienna Airport';
      data.to = 'Vienna';
    }
    
    return data;
  }
}

module.exports = new MockLLMService();
