# Интеграция Supabase для Transfer Assistant

## Обзор

Этот документ описывает интеграцию Supabase для сохранения чат-сессий и сообщений в Transfer Assistant.

## Структура базы данных

### Таблица `chat_sessions`
```sql
create table public.chat_sessions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  first_message text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint chat_sessions_pkey primary key (id)
);
```

### Таблица `chat_messages`
```sql
create table public.chat_messages (
  id uuid not null default gen_random_uuid (),
  session_id uuid not null,
  user_id uuid not null,
  sender_type text not null,
  content text not null,
  created_at timestamp with time zone null default now(),
  constraint chat_messages_pkey primary key (id),
  constraint chat_messages_session_id_fkey foreign KEY (session_id) references chat_sessions (id) on delete CASCADE,
  constraint chat_messages_sender_type_check check (
    (
      sender_type = any (array['user'::text, 'assistant'::text])
    )
  )
);
```

## Новые файлы

### 1. `src/lib/supabase.ts`
Supabase клиент для подключения к базе данных.

### 2. `src/types/database.ts`
TypeScript типы для работы с базой данных.

### 3. `src/services/chatSessionService.ts`
Сервис для работы с чат-сессиями и сообщениями.

### 4. `src/app/api/chat-history/route.ts`
API endpoint для получения истории чата.

## Обновленные файлы

### 1. `src/app/api/process-message/route.ts`
- Добавлено сохранение сообщений в базу данных
- Поддержка sessionId и userId
- Автоматическое создание сессий

### 2. `src/components/ChatInterface.tsx`
- Добавлена поддержка сессий
- Сохранение sessionId в localStorage
- Загрузка истории чата при инициализации
- Автоматическое восстановление сессий

## Переменные окружения

Убедитесь, что в вашем `.env.local` файле есть:

```env
REACT_APP_SUPABASE_URL=https://pliljgylouqjckpbnhfb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsaWxqZ3lsb3VxamNrcGJuaGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDA1NzgsImV4cCI6MjA3MzU3NjU3OH0.1i2DJXbBQ9BsNtY9-4hExxOOgruaTKjsCpNOAI4hbXo
```

## Функциональность

### Автоматическое сохранение
- Все сообщения пользователя и ассистента автоматически сохраняются в базу данных
- Создается новая сессия при первом сообщении
- Сессии сохраняются в localStorage для восстановления

### Восстановление сессий
- При перезагрузке страницы чат автоматически восстанавливается
- История сообщений загружается из базы данных
- Поддержка продолжения диалога

### API Endpoints

#### POST `/api/process-message`
Обработка сообщений с сохранением в БД.

**Параметры:**
- `message`: Текст сообщения
- `userLanguage`: Язык пользователя (по умолчанию 'en')
- `sessionId`: ID сессии (опционально)
- `userId`: ID пользователя (по умолчанию 'anonymous')

**Ответ:**
```json
{
  "response": "Ответ ассистента",
  "extractedData": {...},
  "needsClarification": false,
  "sessionId": "uuid-сессии"
}
```

#### GET `/api/chat-history?sessionId=...&userId=...`
Получение истории сообщений сессии.

#### POST `/api/chat-history`
Получение всех сессий пользователя.

## Тестирование

Запустите тестовый файл для проверки функциональности:

```bash
npx ts-node test-chat-session.ts
```

## Дополнительные возможности

### Аутентификация пользователей
Для реального приложения рекомендуется интегрировать Supabase Auth:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
)

// Получение текущего пользователя
const { data: { user } } = await supabase.auth.getUser()
```

### Пагинация сообщений
Для больших чат-сессий можно добавить пагинацию:

```typescript
async getSessionMessages(sessionId: string, page = 0, limit = 50) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .range(page * limit, (page + 1) * limit - 1)
}
```

### Аналитика
Можно добавить аналитику использования:

```typescript
async getSessionStats(userId: string) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*, chat_messages(count)')
    .eq('user_id', userId)
}
```

## Безопасность

- Все операции проверяют права доступа пользователя
- Сессии привязаны к userId
- Поддержка RLS (Row Level Security) в Supabase
- Валидация входных данных

## Мониторинг

- Логирование всех операций с базой данных
- Обработка ошибок с детальными сообщениями
- Метрики производительности
