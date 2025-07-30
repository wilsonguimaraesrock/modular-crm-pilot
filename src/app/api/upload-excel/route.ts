import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo - incluir tipos mais flexíveis
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'application/csv'
    ];

    const fileName = file.name.toLowerCase();
    const hasValidExtension = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');
    
    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use Excel (.xlsx, .xls) ou CSV.' },
        { status: 400 }
      );
    }

    // Por enquanto, retornamos sucesso para desenvolvimento
    // Em produção, aqui processaríamos o Excel e salvaríamos os contatos
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Arquivo Excel recebido:', fileInfo);

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Arquivo processado com sucesso',
      file: fileInfo,
      contacts: {
        total: 0,
        valid: 0,
        invalid: 0,
        duplicated: 0
      }
    });

  } catch (error) {
    console.error('Erro no upload de Excel:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 