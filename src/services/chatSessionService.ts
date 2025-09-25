import { supabase } from '../lib/supabase'
import { ChatSession, ChatMessage } from '../types/database'

export class ChatSessionService {
  private userId: string

  constructor(userId: string = 'anonymous') {
    this.userId = userId
  }

  // Создание новой сессии
  async createSession(firstMessage?: string): Promise<string> {
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

    return data.id
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
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: this.userId,
        sender_type: senderType,
        content
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error adding message:', error)
      throw new Error('Failed to add message')
    }

    return data.id
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
