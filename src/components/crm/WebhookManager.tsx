import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WebhookLead {
  name: string;
  email: string;
  phone: string;
  interests: string;  // Adults, Teens, Kids, etc.
  modality: string;   // Presencial, Online
  source?: string;    // Para tracking
}

export const WebhookManager = () => {
  const { registerLead } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Expor função global para receber leads da landing page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).receiveLeadFromLandingPage = async (leadData: WebhookLead) => {
      try {
        console.log('📨 Lead recebido da landing page:', leadData);

        // Mapear dados da landing page para formato do CRM
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
          schoolId: '2', // ID da Escola Navegantes
          assignedTo: 'seller_test_2', // Tatiana Venga
          goals: 'Interessado em aula experimental gratuita',
          experience: 'A definir na qualificação',
          availability: 'A definir',
          budget: 'A definir'
        };

        const success = await registerLead(crmLead);

        if (success) {
          console.log('✅ Lead cadastrado com sucesso no CRM');
          toast({
            title: "✅ Lead Recebido!",
            description: `${leadData.name} foi cadastrado com sucesso`,
            duration: 5000,
          });

          // Retornar sucesso para a landing page
          return {
            success: true,
            message: 'Lead cadastrado com sucesso!',
            leadId: `lead_${Date.now()}`
          };
        } else {
          throw new Error('Falha ao cadastrar lead');
        }

      } catch (error) {
        console.error('❌ Erro ao processar lead:', error);
        toast({
          title: "❌ Erro ao Receber Lead",
          description: "Erro interno do sistema",
          variant: "destructive",
        });

        return {
          success: false,
          message: 'Erro ao processar lead'
        };
      }
    };

    // Configurar listener para postMessage (método alternativo)
    const handleMessage = async (event: MessageEvent) => {
      // Validar origem da mensagem (adicione suas URLs permitidas)
      const allowedOrigins = [
        'https://v0-rockfeller-clone.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
      ];

      if (!allowedOrigins.includes(event.origin)) {
        console.warn('❌ Origem não permitida:', event.origin);
        return;
      }

      if (event.data.type === 'ROCKFELLER_LEAD') {
        console.log('📨 Lead recebido via postMessage:', event.data.lead);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (window as any).receiveLeadFromLandingPage(event.data.lead);
        
        // Enviar resposta de volta para a landing page
        if (event.source) {
          event.source.postMessage({
            type: 'ROCKFELLER_LEAD_RESPONSE',
            success: result.success,
            message: result.message
          }, { targetOrigin: event.origin });
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).receiveLeadFromLandingPage;
    };
  }, [registerLead, toast]);

  // Função para mapear interesse para método do CRM
  const mapInterestToMethod = (interest: string): string => {
    const mapping: { [key: string]: string } = {
      'inglês adultos': 'Adults',
      'inglês teens': 'Teens', 
      'inglês kids': 'Kids',
      'preparatório ielts/toefl': 'Practice & Progress',
      'inglês empresarial': 'On Demand'
    };

    return mapping[interest?.toLowerCase()] || 'Adults';
  };

  return null; // Componente invisível
}; 