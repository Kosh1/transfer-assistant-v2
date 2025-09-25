// Тест проверки данных в Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pliljgylouqjckpbnhfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsaWxqZ3lsb3VxamNrcGJuaGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDA1NzgsImV4cCI6MjA3MzU3NjU3OH0.1i2DJXbBQ9BsNtY9-4hExxOOgruaTKjsCpNOAI4hbXo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseData() {
    console.log('🔍 Checking Supabase data...');
    
    try {
        // Проверяем последние сессии
        console.log('📋 Fetching recent sessions...');
        const { data: sessions, error: sessionsError } = await supabase
            .from('chat_sessions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (sessionsError) {
            console.error('❌ Sessions fetch error:', sessionsError);
            return;
        }

        console.log('✅ Found', sessions.length, 'sessions');
        sessions.forEach((session, index) => {
            console.log(`  ${index + 1}. Session ${session.id} - User: ${session.user_id} - First message: ${session.first_message}`);
        });

        if (sessions.length > 0) {
            const latestSession = sessions[0];
            console.log('\n📝 Fetching messages for latest session:', latestSession.id);
            
            // Проверяем сообщения последней сессии
            const { data: messages, error: messagesError } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', latestSession.id)
                .order('created_at', { ascending: true });

            if (messagesError) {
                console.error('❌ Messages fetch error:', messagesError);
                return;
            }

            console.log('✅ Found', messages.length, 'messages in latest session');
            messages.forEach((message, index) => {
                console.log(`  ${index + 1}. [${message.sender_type}] ${message.content.substring(0, 50)}...`);
            });
        }

        console.log('\n🎉 Supabase data check completed!');

    } catch (error) {
        console.error('❌ Check failed:', error);
    }
}

checkSupabaseData();
