import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const sellers = await prisma.seller.findMany();
    return NextResponse.json({ success: true, data: sellers });
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newSeller = await prisma.seller.create({ data });
    
    return NextResponse.json({ success: true, data: newSeller });
  } catch (error) {
    console.error('Erro ao criar vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    const updatedSeller = await prisma.seller.update({
      where: { id },
      data
    });
    
    return NextResponse.json({ success: true, data: updatedSeller });
  } catch (error) {
    console.error('Erro ao atualizar vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    await prisma.seller.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 