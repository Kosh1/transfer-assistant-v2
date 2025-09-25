// Простой тест API без LLM
const testData = {
  from: "Vienna",
  to: "Vienna Airport",
  passengers: 2,
  luggage: 2,
  date: "2024-09-26",
  time: "20:00",
  language: "en",
  isComplete: true
};

console.log('🧪 Testing transfer search API...');
console.log('📊 Test data:', testData);

// Симуляция вызова API
fetch('http://localhost:3000/api/analyze-transfers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    transferData: testData,
    userLanguage: 'en'
  })
})
.then(response => {
  console.log('📡 Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ API response:', data);
})
.catch(error => {
  console.error('❌ API error:', error);
});
