import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const schools = await prisma.school.findMany();
    return NextResponse.json({ success: true, data: schools });
  } catch (error) {
    console.error('Erro ao buscar escolas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newSchool = await prisma.school.create({
      data: {
        ...data,
        phone: data.phone || null,
        address: data.address || null
      }
    });
    
    return NextResponse.json({ success: true, data: newSchool });
  } catch (error) {
    console.error('Erro ao criar escola:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    const updatedSchool = await prisma.school.update({
      where: { id },
      data
    });
    
    return NextResponse.json({ success: true, data: updatedSchool });
  } catch (error) {
    console.error('Erro ao atualizar escola:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    await prisma.school.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar escola:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 