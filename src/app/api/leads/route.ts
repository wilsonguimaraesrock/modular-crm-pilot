import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany();
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newLead = await prisma.lead.create({
      data: {
        ...data,
        company: data.company || null,
        position: data.position || null,
        interests: data.interests || null,
        age: data.age || null,
        experience: data.experience || null,
        availability: data.availability || null,
        budget: data.budget || null,
        goals: data.goals || null,
        assignedTo: data.assignedTo || null,
        sourceId: data.sourceId || null,
        notes: data.notes || null
      }
    });
    
    return NextResponse.json({ success: true, data: newLead });
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    const updatedLead = await prisma.lead.update({
      where: { id },
      data
    });
    
    return NextResponse.json({ success: true, data: updatedLead });
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    await prisma.lead.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 