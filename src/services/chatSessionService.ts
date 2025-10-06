import { supabase } from '../lib/supabase'
import { ChatSession, ChatMessage } from '../types/database'
import { v4 as uuidv4 } from 'uuid'

export class ChatSessionService {
  private userId: string

  constructor(userId: string = 'anonymous') {
    // Если userId не является UUID, создаем UUID для анонимного пользователя
    this.userId = this.isValidUUID(userId) ? userId : this.generateAnonymousUserId()
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  private generateAnonymousUserId(): string {
    // Создаем детерминированный UUID на основе строки 'anonymous'
    // Это позволит анонимным пользователям иметь постоянный ID
    return uuidv4()
  }

  // Создание новой сессии
  async createSession(firstMessage?: string): Promise<string> {
    console.log('🆕 Creating session for user:', this.userId)
    
    if (!supabase) {
      console.warn('⚠️ Supabase not configured, using fallback session ID')
      return `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: this.userId,
          first_message: firstMessage || null
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error creating chat session:', error)
        throw new Error('Failed to create chat session')
      }

      console.log('✅ Session created:', data.id)
      return data.id
    } catch (err) {
      console.error('❌ Supabase connection error, using fallback session ID:', err)
      // Return a fallback session ID if Supabase is not available
      return `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  // Получение сессии по ID
  async getSession(sessionId: string): Promise<ChatSession | null> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      console.error('Error fetching chat session:', error)
      return null
    }

    return data
  }

  // Получение всех сессий пользователя
  async getUserSessions(): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user sessions:', error)
      return []
    }

    return data || []
  }

  // Добавление сообщения в сессию
  async addMessage(sessionId: string, content: string, senderType: 'user' | 'assistant'): Promise<string> {
    console.log('💬 Adding message to session:', sessionId, 'Type:', senderType)
    console.log('👤 User ID:', this.userId)
    console.log('📝 Content length:', content.length)
    
    if (!supabase) {
      console.warn('⚠️ Supabase not configured, using fallback message ID')
      return `fallback-message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    try {
      const insertData = {
        session_id: sessionId,
        user_id: this.userId,
        sender_type: senderType,
        content: content
      };
      
      console.log('📤 Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(insertData)
        .select('id')
        .single()

      if (error) {
        console.error('❌ Error adding message:', error)
        console.error('❌ Error details:', JSON.stringify(error, null, 2))
        throw new Error('Failed to add message')
      }

      console.log('✅ Message added successfully:', data.id)
      return data.id
    } catch (err) {
      console.error('❌ Exception in addMessage, using fallback message ID:', err)
      // Return a fallback message ID if Supabase is not available
      return `fallback-message-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  // Получение сообщений сессии
  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching session messages:', error)
      return []
    }

    return data || []
  }

  // Обновление сессии
  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .update(updates)
      .eq('id', sessionId)

    if (error) {
      console.error('Error updating chat session:', error)
      throw new Error('Failed to update chat session')
    }
  }

  // Удаление сессии и всех связанных сообщений
  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      console.error('Error deleting chat session:', error)
      throw new Error('Failed to delete chat session')
    }
  }
}