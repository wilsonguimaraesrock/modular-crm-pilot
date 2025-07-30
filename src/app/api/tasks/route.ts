import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany();
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Erro ao buscar tasks:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newTask = await prisma.task.create({
      data: {
        ...data,
        completedDate: data.completedDate || null,
        assignedTo: data.assignedTo || null,
        leadId: data.leadId || null,
        leadName: data.leadName || null,
        category: data.category || null,
        estimatedTime: data.estimatedTime || null,
        actualTime: data.actualTime || null,
        notes: data.notes || null
      }
    });
    
    return NextResponse.json({ success: true, data: newTask });
  } catch (error) {
    console.error('Erro ao criar task:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    const updatedTask = await prisma.task.update({
      where: { id },
      data
    });
    
    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('Erro ao atualizar task:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    await prisma.task.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar task:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 