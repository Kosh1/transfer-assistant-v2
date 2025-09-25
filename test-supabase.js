// Тест подключения к Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pliljgylouqjckpbnhfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsaWxqZ3lsb3VxamNrcGJuaGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDA1NzgsImV4cCI6MjA3MzU3NjU3OH0.1i2DJXbBQ9BsNtY9-4hExxOOgruaTKjsCpNOAI4hbXo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
    console.log('🧪 Testing Supabase connection...');
    
    try {
        // Тест создания сессии
        console.log('📝 Creating test session...');
        const { data: sessionData, error: sessionError } = await supabase
            .from('chat_sessions')
            .insert({
                user_id: 'test-user',
                first_message: 'Test message'
            })
            .select('id')
            .single();

        if (sessionError) {
            console.error('❌ Session creation error:', sessionError);
            return;
        }

        console.log('✅ Session created:', sessionData.id);

        // Тест добавления сообщения
        console.log('💬 Adding test message...');
        const { data: messageData, error: messageError } = await supabase
            .from('chat_messages')
            .insert({
                session_id: sessionData.id,
                user_id: 'test-user',
                sender_type: 'user',
                content: 'Test message from user'
            })
            .select('id')
            .single();

        if (messageError) {
            console.error('❌ Message creation error:', messageError);
            return;
        }

        console.log('✅ Message created:', messageData.id);

        // Тест получения сообщений
        console.log('📖 Fetching messages...');
        const { data: messages, error: fetchError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionData.id);

        if (fetchError) {
            console.error('❌ Fetch error:', fetchError);
            return;
        }

        console.log('✅ Messages fetched:', messages.length, 'messages');
        console.log('📊 Messages:', messages);

        console.log('🎉 Supabase connection test successful!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testSupabase();
