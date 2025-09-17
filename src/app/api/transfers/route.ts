import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters from query string
    const {
      pickup,
      dropoff,
      pickupEstablishment,
      dropoffEstablishment,
      pickupType,
      dropoffType,
      pickupDateTime,
      passenger,
      currency = 'EUR',
      language = 'en-gb'
    } = Object.fromEntries(searchParams);
    
    // Validate required parameters
    if (!pickup || !dropoff || !pickupDateTime || !passenger) {
      return NextResponse.json({
        error: 'Missing required parameters',
        required: ['pickup', 'dropoff', 'pickupDateTime', 'passenger']
      }, { status: 400 });
    }
    
    // Construct Booking.com API URL
    const queryParams = new URLSearchParams({
      affiliate: 'booking-taxi',
      currency: currency,
      displayLocalSupplierText: 'true',
      dropoff: dropoff,
      dropoffEstablishment: dropoffEstablishment || 'Unknown',
      dropoffType: dropoffType || 'city',
      format: 'envelope',
      isExpandable: 'true',
      language: language,
      passenger: passenger.toString(),
      passengerMismatchExperiment: 'true',
      pickup: pickup,
      pickupDateTime: pickupDateTime,
      pickupEstablishment: pickupEstablishment || 'Unknown',
      pickupType: pickupType || 'city',
      populateSupplierName: 'true',
      returnBannerDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
    });
    
    const apiUrl = `https://taxis.booking.com/search-results-mfe/rates?${queryParams}`;
    console.log('🔗 Calling Booking.com API:', apiUrl);
    
    // Make request to Booking.com
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'Referer': 'https://www.booking.com/',
        'Origin': 'https://www.booking.com',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // @ts-ignore - timeout is not in the standard fetch API but some environments support it
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.ok) {
      console.error('❌ Booking.com API error:', response.status, response.statusText);
      
      // Try to get error details
      let errorDetails = '';
      try {
        const errorText = await response.text();
        errorDetails = errorText;
        console.log('📄 Error response body:', errorText);
      } catch (e) {
        console.log('📄 Could not read error response body');
      }
      
      // Return error but also provide fallback mock data
      return NextResponse.json({
        success: false,
        error: 'Booking.com API error',
        status: response.status,
        statusText: response.statusText,
        details: errorDetails,
        fallback: 'mock',
        message: 'Using mock data due to API error'
      });
    }
    
    const data = await response.json();
    console.log('✅ Successfully received data from Booking.com');
    
    // Return the data
    return NextResponse.json({
      success: true,
      source: 'booking.com',
      data: data,
      requestParams: {
        pickup,
        dropoff,
        pickupEstablishment,
        dropoffEstablishment,
        pickupType,
        dropoffType,
        pickupDateTime,
        passenger,
        currency,
        language
      }
    });
    
  } catch (error) {
    console.error('💥 Server error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
