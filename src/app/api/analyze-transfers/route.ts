import { NextRequest, NextResponse } from 'next/server';
import transferAnalysisService from '@/services/transferAnalysisService';

export async function POST(request: NextRequest) {
  try {
    const { transferData, userLanguage } = await request.json();

    if (!transferData) {
      return NextResponse.json(
        { error: 'Transfer data is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Analyzing transfers for:', transferData);
    console.log('🌍 User language:', userLanguage);

    // Search and analyze transfers
    const result = await transferAnalysisService.searchAndAnalyzeTransfers(
      transferData,
      userLanguage || 'en'
    );

    console.log('✅ Transfer analysis result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error analyzing transfers:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to analyze transfers',
        data: null
      },
      { status: 500 }
    );
  }
}
