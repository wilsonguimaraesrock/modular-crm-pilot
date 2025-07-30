import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const followUps = await prisma.followUp.findMany();
    return NextResponse.json({ success: true, data: followUps });
  } catch (error) {
    console.error('Erro ao buscar follow-ups:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newFollowUp = await prisma.followUp.create({
      data: {
        ...data,
        notes: data.notes || null,
        assignedTo: data.assignedTo || null
      }
    });
    
    return NextResponse.json({ success: true, data: newFollowUp });
  } catch (error) {
    console.error('Erro ao criar follow-up:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    const updatedFollowUp = await prisma.followUp.update({
      where: { id },
      data
    });
    
    return NextResponse.json({ success: true, data: updatedFollowUp });
  } catch (error) {
    console.error('Erro ao atualizar follow-up:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    await prisma.followUp.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar follow-up:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 