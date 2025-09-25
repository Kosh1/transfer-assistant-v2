// Простой тест для проверки работы LLM
const testMessage = "Ok can you take me from Vienna to vienna airport tomorrow at 20, 2 pax and 2 bags";

console.log('🧪 Testing LLM extraction...');
console.log('📝 Message:', testMessage);

// Симуляция извлечения данных
const extractedData = {
  from: "Vienna",
  to: "Vienna Airport", 
  passengers: 2,
  luggage: 2,
  date: "2024-09-26", // tomorrow
  time: "20:00"
};

console.log('📊 Extracted data:', extractedData);

// Проверка валидации
const hasRoute = extractedData.from && extractedData.to;
const hasTiming = extractedData.date || extractedData.time;
const hasPassengers = extractedData.passengers !== undefined && extractedData.passengers !== null;
const hasLuggage = extractedData.luggage !== undefined && extractedData.luggage !== null;

console.log('🔍 Data validation:', {
  hasRoute,
  hasTiming,
  hasPassengers,
  hasLuggage,
  from: extractedData.from,
  to: extractedData.to,
  date: extractedData.date,
  time: extractedData.time,
  passengers: extractedData.passengers,
  luggage: extractedData.luggage
});

if (hasRoute && hasTiming && hasPassengers && hasLuggage) {
  console.log('✅ All data available, should start transfer search');
} else {
  console.log('⚠️ Missing data:', {
    missingRoute: !hasRoute,
    missingTiming: !hasTiming,
    missingPassengers: !hasPassengers,
    missingLuggage: !hasLuggage
  });
}
