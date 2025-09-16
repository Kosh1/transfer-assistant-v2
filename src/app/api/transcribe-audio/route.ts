import { NextRequest, NextResponse } from 'next/server';
import llmService from '@/services/llmService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    console.log('🎤 Transcribing audio file:', audioFile.name);

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Transcribe audio using LLM service
    const result = await llmService.transcribeAudio(buffer);

    console.log('✅ Transcription result:', result);

    return NextResponse.json({
      transcription: result.text
    });
  } catch (error) {
    console.error('❌ Error transcribing audio:', error);
    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio',
        transcription: ''
      },
      { status: 500 }
    );
  }
}
