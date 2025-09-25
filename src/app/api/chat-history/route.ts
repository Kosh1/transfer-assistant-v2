import { NextRequest, NextResponse } from 'next/server';
import { ChatSessionService } from '../../../services/chatSessionService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId') || 'anonymous';

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const chatService = new ChatSessionService(userId);
    const messages = await chatService.getSessionMessages(sessionId);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId = 'anonymous' } = await request.json();

    const chatService = new ChatSessionService(userId);
    const sessions = await chatService.getUserSessions();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user sessions' },
      { status: 500 }
    );
  }
}
