import { NextRequest, NextResponse } from 'next/server';
import transferAnalysisService from '@/services/transferAnalysisService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { transferData, userLanguage = 'en' } = await request.json();
    
    if (!transferData) {
      return NextResponse.json(
        { error: 'Transfer data is required' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Transfer analysis request:', transferData);
    console.log('🌍 User language:', userLanguage);
    
    // Analyze transfers using transfer analysis service
    const result = await transferAnalysisService.searchAndAnalyzeTransfers(transferData, userLanguage);
    
    console.log('✅ Transfer analysis completed');
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error analyzing transfers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze transfers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}