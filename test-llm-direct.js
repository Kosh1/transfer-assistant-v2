// Прямой тест LLM API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLLM() {
    console.log('🧪 Testing LLM API directly...');
    
    const apiKey = process.env.REACT_APP_LLM_API_KEY;
    const apiUrl = process.env.REACT_APP_LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
    
    if (!apiKey) {
        console.error('❌ No API key found');
        return;
    }
    
    console.log('🔑 API Key exists:', !!apiKey);
    console.log('🌐 API URL:', apiUrl);
    
    const requestBody = {
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are a helpful transfer assistant. Extract transfer information from user messages."
            },
            {
                role: "user", 
                content: "Ok can you take me from Vienna to vienna airport tomorrow at 20, 2 pax and 2 bags"
            }
        ],
        functions: [
            {
                name: 'extract_transfer_data',
                description: 'Extract transfer booking information',
                parameters: {
                    type: 'object',
                    properties: {
                        from: { type: 'string', description: 'Pickup location' },
                        to: { type: 'string', description: 'Destination location' },
                        passengers: { type: 'number', description: 'Number of passengers' },
                        luggage: { type: 'number', description: 'Number of luggage pieces' },
                        date: { type: 'string', description: 'Travel date' },
                        time: { type: 'string', description: 'Travel time' },
                        status: { type: 'string', description: 'Data collection status' }
                    },
                    required: ['from', 'to', 'passengers', 'luggage', 'date', 'time', 'status']
                }
            }
        ],
        function_call: 'auto',
        temperature: 0.1
    };
    
    try {
        console.log('📤 Sending request to LLM API...');
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', errorText);
            return;
        }
        
        const result = await response.json();
        console.log('✅ LLM Response:', JSON.stringify(result, null, 2));
        
        const choice = result.choices[0];
        const message = choice.message;
        
        if (message.function_call) {
            console.log('🔍 Function call found:', message.function_call.name);
            console.log('🔍 Function arguments:', message.function_call.arguments);
        } else {
            console.log('❌ No function call found');
            console.log('📝 Message content:', message.content);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testLLM();
