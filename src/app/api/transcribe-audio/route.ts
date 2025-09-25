import { NextRequest, NextResponse } from 'next/server';
import llmService from '../../../services/llmService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const userLanguage = formData.get('language') as string || 'en';
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }
    
    console.log('🎤 Audio transcription request received');
    console.log('🌍 User language:', userLanguage);
    
    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Transcribe audio using LLM service with user language
    const result = await llmService.transcribeAudio(buffer, userLanguage);
    
    console.log('✅ Audio transcription completed');
    
    return NextResponse.json({
      transcription: result.text
    });
    
  } catch (error) {
    console.error('❌ Error transcribing audio:', error);
    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}