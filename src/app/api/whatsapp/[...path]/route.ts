import { NextRequest, NextResponse } from 'next/server';

const WAHA_BASE_URL = process.env.WAHA_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.WAHA_API_KEY || 'waha-key-2025';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const url = `${WAHA_BASE_URL}/api/${path}`;
    
    console.log(`[WAHA Proxy] GET ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.text();
    
    // Se for uma imagem QR, retornar como imagem
    if (path.includes('qr') && response.headers.get('content-type')?.includes('image')) {
      return new NextResponse(data, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'image/png',
          'Cache-Control': 'no-cache',
        },
      });
    }
    
    // Se for JSON, parsear e retornar
    try {
      const jsonData = JSON.parse(data);
      return NextResponse.json(jsonData, { status: response.status });
    } catch {
      return new NextResponse(data, { status: response.status });
    }
    
  } catch (error) {
    console.error('[WAHA Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: error },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const url = `${WAHA_BASE_URL}/api/${path}`;
    
    console.log(`[WAHA Proxy] POST ${url}`);
    
    const body = await request.text();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: body || '{}',
    });

    const data = await response.text();
    
    try {
      const jsonData = JSON.parse(data);
      return NextResponse.json(jsonData, { status: response.status });
    } catch {
      return new NextResponse(data, { status: response.status });
    }
    
  } catch (error) {
    console.error('[WAHA Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: error },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const url = `${WAHA_BASE_URL}/api/${path}`;
    
    console.log(`[WAHA Proxy] PUT ${url}`);
    
    const body = await request.text();
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: body || '{}',
    });

    const data = await response.text();
    
    try {
      const jsonData = JSON.parse(data);
      return NextResponse.json(jsonData, { status: response.status });
    } catch {
      return new NextResponse(data, { status: response.status });
    }
    
  } catch (error) {
    console.error('[WAHA Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const url = `${WAHA_BASE_URL}/${path}`;
    
    console.log(`[WAHA Proxy] DELETE ${url}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.text();
    
    try {
      const jsonData = JSON.parse(data);
      return NextResponse.json(jsonData, { status: response.status });
    } catch {
      return new NextResponse(data, { status: response.status });
    }
    
  } catch (error) {
    console.error('[WAHA Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: error },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
    },
  });
} 