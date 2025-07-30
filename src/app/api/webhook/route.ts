import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

/**
 * WEBHOOK API - Sistema de Integração com Landing Pages
 * 
 * Este endpoint recebe leads vindos de landing pages externas
 * através de URL parameters (método CORS-safe)
 */

interface WebhookLead {
  name: string;
  email: string;
  phone: string;
  interests: string;
  modality: string;
  source?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadDataParam = searchParams.get('leadData');

    if (leadDataParam) {
      // Processar lead vindo via URL parameters
      const leadData: WebhookLead = JSON.parse(decodeURIComponent(leadDataParam));
      console.log('📨 Lead recebido via URL parameters:', leadData);

      // Mapear dados para formato do CRM
      const crmLead = {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        interests: leadData.interests || 'Não especificado',
        method: mapInterestToMethod(leadData.interests),
        modality: leadData.modality || 'Presencial',
        source: leadData.source || 'Landing Page V0',
        score: 80, // Score alto para leads da landing page
        status: 'novo' as const,
        schoolId: 'cmd52y62f00009k9fqdrfkyv4', // ID da escola Navegantes
        assignedTo: 'seller_test_2', // Tatiana Venga
        goals: 'Interessado em aula experimental gratuita',
        experience: 'A definir na qualificação',
        availability: 'A definir',
        budget: 'A definir'
      };

      // Salvar no banco de dados
      const newLead = await prisma.lead.create({
        data: crmLead
      });

      console.log('✅ Lead cadastrado com sucesso:', newLead.id);

      // Retornar página de sucesso
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lead Recebido - CRM Rockfeller</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f0f2f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #28a745; text-align: center; }
            .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; text-decoration: none; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">✅ Lead Recebido com Sucesso!</h1>
            <div class="info">
              <h3>Dados Recebidos:</h3>
              <p><strong>Nome:</strong> ${leadData.name}</p>
              <p><strong>Email:</strong> ${leadData.email}</p>
              <p><strong>Telefone:</strong> ${leadData.phone}</p>
              <p><strong>Interesse:</strong> ${leadData.interests}</p>
              <p><strong>Modalidade:</strong> ${leadData.modality}</p>
            </div>
            <p>O lead foi cadastrado no CRM e nossa equipe entrará em contato em breve!</p>
            <a href="/" class="button">Voltar ao CRM</a>
          </div>
          <script>
            // Fechar aba automaticamente após 3 segundos
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Se não há dados, retornar página de informações
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Webhook - CRM Rockfeller</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f0f2f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .info { background: #e7f3ff; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔗 Webhook Ativo</h1>
          <div class="info">
            <p>Este endpoint está funcionando e pronto para receber leads!</p>
            <p><strong>URL:</strong> ${request.url}</p>
            <p><strong>Status:</strong> ✅ Ativo</p>
          </div>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const leadData: WebhookLead = await request.json();
    console.log('📨 Lead recebido via POST:', leadData);

    // Processar lead igual ao GET
    const crmLead = {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      interests: leadData.interests || 'Não especificado',
      method: mapInterestToMethod(leadData.interests),
      modality: leadData.modality || 'Presencial',
      source: leadData.source || 'Landing Page V0',
      score: 80,
      status: 'novo' as const,
      schoolId: 'cmd52y62f00009k9fqdrfkyv4',
      assignedTo: 'seller_test_2',
      goals: 'Interessado em aula experimental gratuita',
      experience: 'A definir na qualificação',
      availability: 'A definir',
      budget: 'A definir'
    };

    const newLead = await prisma.lead.create({
      data: crmLead
    });

    return NextResponse.json({
      success: true,
      message: 'Lead cadastrado com sucesso!',
      leadId: newLead.id
    });

  } catch (error) {
    console.error('❌ Erro no webhook POST:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar para mapear interesse para método
function mapInterestToMethod(interests: string): string {
  if (!interests) return 'Presencial';
  
  const interestsLower = interests.toLowerCase();
  if (interestsLower.includes('online') || interestsLower.includes('ead')) {
    return 'Online';
  }
  return 'Presencial';
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 