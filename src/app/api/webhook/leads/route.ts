import { NextRequest, NextResponse } from 'next/server';

// Esta rota alternativa redireciona para a rota principal do webhook
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  url.pathname = '/webhook';
  
  return NextResponse.redirect(url.toString(), 302);
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  url.pathname = '/api/webhook';
  
  return NextResponse.redirect(url.toString(), 307); // 307 preserva o método POST
} 