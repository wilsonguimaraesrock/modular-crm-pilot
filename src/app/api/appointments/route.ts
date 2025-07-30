import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany();
    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newAppointment = await prisma.appointment.create({
      data: {
        ...data,
        leadPhone: data.leadPhone || null,
        leadEmail: data.leadEmail || null,
        assignedTo: data.assignedTo || null,
        notes: data.notes || null,
        meetingLink: data.meetingLink || null,
        address: data.address || null
      }
    });
    
    return NextResponse.json({ success: true, data: newAppointment });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data
    });
    
    return NextResponse.json({ success: true, data: updatedAppointment });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    await prisma.appointment.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 