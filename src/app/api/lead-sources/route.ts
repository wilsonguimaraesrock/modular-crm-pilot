import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const leadSources = await prisma.leadSource.findMany();
    return NextResponse.json({ success: true, data: leadSources });
  } catch (error) {
    console.error('Erro ao buscar fontes de leads:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newLeadSource = await prisma.leadSource.create({
      data: {
        ...data,
        url: data.url || null,
        autoAssign: data.autoAssign || null,
        webhookUrl: data.webhookUrl || null
      }
    });
    
    return NextResponse.json({ success: true, data: newLeadSource });
  } catch (error) {
    console.error('Erro ao criar fonte de lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    const updatedLeadSource = await prisma.leadSource.update({
      where: { id },
      data
    });
    
    return NextResponse.json({ success: true, data: updatedLeadSource });
  } catch (error) {
    console.error('Erro ao atualizar fonte de lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    await prisma.leadSource.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar fonte de lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 