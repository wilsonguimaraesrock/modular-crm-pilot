/**
 * 🎯 WebhookManager - Sistema de Integração com Landing Pages
 * 
 * Este componente gerencia a recepção e processamento de leads vindos de
 * landing pages externas através de webhooks e URL parameters.
 * 
 * Funcionalidades:
 * - Recebe leads via URL parameters (método CORS-safe)
 * - Processa dados automaticamente
 * - Atribui leads à escola e vendedor corretos
 * - Mostra notificações de sucesso
 * - Suporte a múltiplas origens
 * 
 * @version 2.0 - Sistema de Integração Completo
 * @date 2025-01-09
 */

import { useEffect } from 'react';
import { useDatabaseAuth } from '@/contexts/DatabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Interface para dados de leads vindos de landing pages
 * 
 * @property name - Nome completo do lead
 * @property email - Email do lead
 * @property phone - Telefone do lead
 * @property interests - Interesse em cursos (Adults, Teens, Kids, etc.)
 * @property modality - Modalidade preferida (Presencial, Online)
 * @property source - Origem do lead (opcional, para tracking)
 */
interface WebhookLead {
  name: string;
  email: string;
  phone: string;
  interests: string;  // Adults, Teens, Kids, etc.
  modality: string;   // Presencial, Online
  source?: string;    // Para tracking
}

export const WebhookManager = () => {
  const { registerLead } = useDatabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    /**
     * Processa dados de lead vindos de landing pages
     * 
     * Esta função:
     * 1. Mapeia dados da landing page para formato do CRM
     * 2. Atribui configurações padrão (escola, vendedor, score)
     * 3. Registra o lead no sistema
     * 4. Mostra notificação de sucesso
     * 
     * @param leadData - Dados do lead vindos da landing page
     * @returns Promise com resultado do processamento
     */
    const processLeadData = async (leadData: WebhookLead) => {
      try {
        console.log('📨 Processando lead:', leadData);

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
          assignedTo: 'seller_test_2', // Tatiana Venga (vendedor padrão)
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
            description: `${leadData.name} foi cadastrado via URL parameters`,
            duration: 5000,
          });

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

    /**
     * Captura leads via URL parameters (método CORS-safe)
     * 
     * Este método contorna problemas de CORS entre diferentes origens
     * (ex: Vercel HTTPS → localhost HTTP) usando URL parameters
     * em vez de PostMessage.
     */
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('leadData')) {
      try {
        const leadDataEncoded = urlParams.get('leadData');
        const leadData = JSON.parse(decodeURIComponent(leadDataEncoded || ''));
        console.log('📨 Lead recebido via URL parameters:', leadData);
        
        // Processar lead automaticamente
        processLeadData(leadData);
        
        // Limpar URL parameters para não reprocessar
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (error) {
        console.error('❌ Erro ao processar lead dos URL parameters:', error);
      }
    }

    /**
     * Expor função global para receber leads da landing page
     * 
     * Esta função pode ser chamada diretamente por JavaScript
     * na landing page para enviar leads via PostMessage.
     * 
     * @deprecated Use URL parameters em vez de PostMessage (problemas de CORS)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).receiveLeadFromLandingPage = processLeadData;

    /**
     * Configurar listener para postMessage (método alternativo)
     * 
     * @deprecated Este método não funciona devido a problemas de CORS
     * entre diferentes origens (HTTPS → HTTP). Use URL parameters.
     */
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