import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, Settings, Brain, FileText, X, MessageCircle, Code, Copy, ExternalLink, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth, Seller, QualificationConversation } from '@/contexts/AuthContext';

interface QualificationStage {
  id: string;
  name: string;
  question: string;
  keywords: string[];
  followUpQuestions: string[];
  maxScore: number;
}

export const LeadQualification = () => {
  const isMobile = useIsMobile();
  const { 
    user, 
    currentSchool, 
    getSellersBySchool, 
    getNextAvailableSeller,
    createQualificationConversation,
    updateQualificationConversation,
    getActiveQualificationConversation,
    registerLead,
    createAppointment
  } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estados principais
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
  }>>([
    {
      type: 'system',
      content: 'Sistema de qualificação IA pronto. Sua chave OpenAI já está configurada!',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [leadScore, setLeadScore] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  
  // Estados do fluxo conversacional
  const [currentStage, setCurrentStage] = useState(0);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [stageScores, setStageScores] = useState<Record<string, number>>({});
  const [assignedSeller, setAssignedSeller] = useState<Seller | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Estados para persistência da conversa
  const [currentConversation, setCurrentConversation] = useState<QualificationConversation | null>(null);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');

  // Configurações da IA e RAG
  const [aiPrompt, setAiPrompt] = useState('');
  const [ragFiles, setRagFiles] = useState<any[]>([]);
  
  // Estado para embed
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);

  // Função para carregar conhecimento padrão da Rockfeller
  const loadDefaultRockfellerKnowledge = async (schoolId: string) => {
    try {
      const response = await fetch('/rockfeller-knowledge-base.txt');
      if (response.ok) {
        const content = await response.text();
        
        const defaultFile = {
          id: `default_rockfeller_${Date.now()}`,
          name: 'Rockfeller Knowledge Base (Padrão)',
          type: 'text/plain',
          size: content.length,
          content: content,
          uploadedAt: new Date().toISOString(),
          processed: true,
          chunks: Math.ceil(content.length / 1000),
          isDefault: true
        };

        const defaultFiles = [defaultFile];
        setRagFiles(defaultFiles);
        
        // Salvar no localStorage
        const storageKey = `rag_files_${schoolId}`;
        localStorage.setItem(storageKey, JSON.stringify(defaultFiles));
        console.log(`[LeadQualification] Arquivo padrão da Rockfeller carregado automaticamente para escola ${schoolId}`);
      }
    } catch (error) {
      console.error('[LeadQualification] Erro ao carregar arquivo padrão:', error);
      setRagFiles([]);
    }
  };

  // Função para iniciar uma nova conversa
  const startNewConversation = async () => {
    if (!user) return;

    // Se existe conversa atual, finalizar ela primeiro
    if (currentConversation) {
      await updateQualificationConversation(currentConversation.id, {
        status: 'completed'
      });
    }

    // Resetar todos os estados para iniciar nova conversa
    setCurrentConversation(null);
    setConversationStarted(false);
    setWaitingForResponse(false);
    setCurrentStage(0);
    setLeadScore(0);
    setStageScores({});
    setAssignedSeller(null);
    setLeadName('');
    setLeadPhone('');
    setLeadEmail('');
    setCurrentMessage('');
    setMessages([
      {
        type: 'system',
        content: 'Sistema de qualificação IA pronto. Clique em "Iniciar Nova Conversa" para começar.',
        timestamp: new Date()
      }
    ]);

    toast({
      title: "Nova Conversa",
      description: "Pronto para iniciar uma nova qualificação de lead",
    });
  };

  // Estágios de qualificação com coleta de nome
  const qualificationStages: QualificationStage[] = [
    {
      id: 'name',
      name: 'Identificação',
      question: 'Oi! Qual é o seu nome?',
      keywords: ['nome', 'chamo', 'sou', 'eu', 'me'],
      followUpQuestions: [],
      maxScore: 20
    },
    {
      id: 'interest',
      name: 'Interesse',
      question: 'Legal [NOME]! Me conta, qual é o seu principal objetivo com o inglês?',
      keywords: ['trabalho', 'carreira', 'viagem', 'estudo', 'promoção', 'oportunidade', 'pessoal', 'profissional'],
      followUpQuestions: [],
      maxScore: 25
    },
    {
      id: 'timing',
      name: 'Disponibilidade',
      question: 'Entendi! E quando você gostaria de começar? Está procurando algo para começar logo?',
      keywords: ['agora', 'logo', 'semana', 'mês', 'urgente', 'quando', 'disponível'],
      followUpQuestions: [],
      maxScore: 25
    },
    {
      id: 'schedule',
      name: 'Agendamento',
      question: 'Perfeito [NOME]! Que tal conversarmos melhor sobre isso? Posso agendar uma conversa rápida com você para te mostrar nossas opções?',
      keywords: ['sim', 'claro', 'pode', 'quero', 'gostaria', 'quando', 'horário'],
      followUpQuestions: [],
      maxScore: 30
    }
  ];

  // Garantir que a página carregue mostrando o topo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Carregar configurações e conversa ativa ao inicializar
  useEffect(() => {
    if (user) {
      // Carregar configurações da IA
      const savedPrompt = localStorage.getItem(`ai_prompt_${user.schoolId}`);
      if (savedPrompt) {
        setAiPrompt(savedPrompt);
      }

      // Carregar arquivos RAG
      const savedFiles = localStorage.getItem(`rag_files_${user.schoolId}`);
      if (savedFiles) {
        try {
          const files = JSON.parse(savedFiles);
          console.log(`[LeadQualification] Carregando ${files.length} arquivos RAG para escola ${user.schoolId}`);
          setRagFiles(files);
        } catch (error) {
          console.error('Erro ao carregar arquivos RAG:', error);
          setRagFiles([]);
        }
      } else {
        console.log(`[LeadQualification] Nenhum arquivo RAG encontrado para escola ${user.schoolId}`);
        // Tentar carregar arquivo padrão se não houver arquivos RAG
        loadDefaultRockfellerKnowledge(user.schoolId);
      }

      // Carregar API Key
      const savedApiKey = localStorage.getItem(`gemini_api_key_${user.schoolId}`);
      if (savedApiKey) {
        setApiKey(savedApiKey);
        setIsConfigured(!!savedApiKey.trim());
      } else {
        // Tentar carregar de variáveis de ambiente
        const envOpenAI = import.meta.env.VITE_OPENAI_API_KEY;
        const envGemini = import.meta.env.VITE_GEMINI_API_KEY;
        const defaultApiKey = envGemini || envOpenAI || '';
        
        if (defaultApiKey) {
          setApiKey(defaultApiKey);
          localStorage.setItem(`gemini_api_key_${user.schoolId}`, defaultApiKey);
          setIsConfigured(true);
        } else {
          setIsConfigured(false);
        }
      }

      // Carregar conversa ativa existente
      const activeConversation = getActiveQualificationConversation(user.schoolId);
      if (activeConversation) {
        setCurrentConversation(activeConversation);
        setLeadName(activeConversation.leadName);
        setLeadPhone(activeConversation.leadPhone || '');
        setLeadEmail(activeConversation.leadEmail || '');
        setCurrentStage(activeConversation.stage);
        setLeadScore(activeConversation.score);
        setStageScores(activeConversation.stageScores);
        setMessages(activeConversation.messages);
        setConversationStarted(true);
        setWaitingForResponse(true);
        
        // Buscar vendedor atribuído
        if (activeConversation.assignedSeller) {
          const seller = getSellersBySchool(user.schoolId).find(s => s.id === activeConversation.assignedSeller);
          setAssignedSeller(seller || null);
        }
      }
    }
  }, [user, getActiveQualificationConversation, getSellersBySchool]);

  // Scroll automático para o final das mensagens (apenas depois que a conversa começou)
  useEffect(() => {
    if (conversationStarted && messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, conversationStarted]);

  // Função para simular digitação e enviar mensagem
  const sendMessageWithTyping = (content: string, delay: number = 3000) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const message = {
        type: 'ai' as const,
        content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
    }, delay);
  };

  // Iniciar conversa
  const startConversation = async () => {
    if (!isConfigured) {
      toast({
        title: "Configuração necessária",
        description: "Configure sua API key do Google Gemini primeiro",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    // Verificar se já existe conversa ativa
    const existingConversation = getActiveQualificationConversation(user.schoolId);
    if (existingConversation) {
      toast({
        title: "Conversa já iniciada",
        description: "Continue a conversa já em andamento",
      });
      return;
    }

    setConversationStarted(true);
    setCurrentStage(0);
    setWaitingForResponse(false); // Começa sem esperar resposta para a apresentação

    // Buscar vendedores reais da escola
    const schoolSellers = getSellersBySchool(user.schoolId).filter(s => s.active);
    
    // Buscar próximo vendedor disponível usando distribuição equitativa
    const currentSeller = getNextAvailableSeller(user.schoolId);
    
    // Se não houver vendedores cadastrados, usar um padrão, senão usar o primeiro vendedor ativo
    const sellerToUse = currentSeller || (schoolSellers.length > 0 ? schoolSellers[0] : { name: 'Consultor da Rockfeller' });
    
    // Armazenar o vendedor atribuído para esta conversa
    setAssignedSeller(currentSeller || (schoolSellers.length > 0 ? schoolSellers[0] : null));
    
    // Função para extrair apenas o primeiro nome (removida para evitar duplicação - usando a função global)
    
    // Usar apenas o primeiro nome do vendedor
    const sellerFirstName = getFirstName(sellerToUse.name);
    
    // Mensagem de apresentação inicial com foco em pedir o nome
    const schoolName = currentSchool?.name || 'Rockfeller Brasil';
    const introMessage = {
      type: 'ai' as const,
      content: `Olá! Tudo bem? 😊

Eu sou ${sellerFirstName} da ${schoolName}! 

Antes de começarmos, Qual é o seu nome?`,
      timestamp: new Date()
    };

    const initialMessages = [introMessage];
    setMessages(initialMessages);

    // Criar conversa persistente
    const conversationData = {
      leadName: '',
      leadPhone: '',
      leadEmail: '',
      messages: initialMessages,
      stage: 0, // Começar direto no estágio do nome
      score: 0,
      stageScores: {},
      schoolId: user.schoolId,
      assignedSeller: currentSeller?.id,
      status: 'active' as const
    };

    const newConversation = await createQualificationConversation(conversationData);
    if (newConversation) {
      setCurrentConversation(newConversation);
      setWaitingForResponse(true); // Aguardando resposta com o nome
    }
  };

  // Processar resposta do usuário
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !currentConversation) return;
    
    console.log(`[LeadQualification] DEBUG INÍCIO handleSendMessage - leadName atual: "${leadName}", currentStage: ${currentStage}, currentMessage: "${currentMessage}"`);
    
    // Se ainda não está esperando resposta (durante apresentação), apenas responder cordialmente
    if (!waitingForResponse && conversationStarted) {
      const userMessage = {
        type: 'user' as const,
        content: currentMessage,
        timestamp: new Date()
      };
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setCurrentMessage('');
      
      // Atualizar conversa persistente
      await updateQualificationConversation(currentConversation.id, {
        messages: updatedMessages
      });
      
      // Resposta cordial com indicador de digitação
      sendMessageWithTyping('Que bom! 😊 Vou te fazer algumas perguntinhas rápidas para entender melhor como posso te ajudar.', 2500);
      
      // Primeira pergunta de qualificação após resposta cordial (pergunta do nome)
      setTimeout(() => {
        const firstQuestion = qualificationStages[0].question; // "Oi! Como você gostaria que eu te chamasse? Qual é o seu nome?"
        sendMessageWithTyping(firstQuestion, 3000);
        setWaitingForResponse(true);
      }, 3000);
      
      return;
    }
    
    if (!waitingForResponse) return;

    // Adicionar mensagem do usuário
    const userMessage = {
      type: 'user' as const,
      content: currentMessage,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Tentar capturar nome apenas no primeiro estágio
    let extractedNameForThisMessage = '';
    if (currentStage === 0 && !leadName) {
      console.log(`[LeadQualification] *** TENTATIVA DE CAPTURA DE NOME ***`);
      console.log(`[LeadQualification] - currentStage: ${currentStage}`);
      console.log(`[LeadQualification] - leadName atual: "${leadName}"`);
      console.log(`[LeadQualification] - currentMessage: "${currentMessage}"`);
      
      extractedNameForThisMessage = extractNameFromMessage(currentMessage);
      
      console.log(`[LeadQualification] - Nome extraído: "${extractedNameForThisMessage}"`);
      
      if (extractedNameForThisMessage) {
        console.log(`[LeadQualification] ✅ Nome capturado: "${extractedNameForThisMessage}" - salvando no estado`);
        setLeadName(extractedNameForThisMessage);
        
        // Atualizar conversa com o nome
        await updateQualificationConversation(currentConversation.id, {
          leadName: extractedNameForThisMessage,
          messages: updatedMessages
        });
        console.log(`[LeadQualification] ✅ Nome "${extractedNameForThisMessage}" salvo na conversa`);
      } else {
        console.log(`[LeadQualification] ❌ Nome NÃO capturado da mensagem: "${currentMessage}"`);
      }
    }

    try {
      // Mostrar indicador de digitação enquanto processa
      setIsTyping(true);
      
      // Verificar se estamos no estágio de captura de nome e acabamos de capturar
      let useAI = true;
      let response;
      
      // Se acabamos de capturar o nome no estágio 0, usar resposta estruturada
      if (currentStage === 0 && extractedNameForThisMessage) {
        // Resposta de boas-vindas personalizada seguida da próxima pergunta
        response = {
          message: `Muito prazer, ${extractedNameForThisMessage}! 😊\n\nMe conta, qual é o seu principal objetivo com o inglês?`,
          scoreIncrease: qualificationStages[0].maxScore,
          nextStage: 1,
          completed: false
        };
        useAI = false;
        console.log(`[LeadQualification] Usando resposta estruturada com nome: "${extractedNameForThisMessage}"`);
      }
      
      // Se não usou resposta estruturada, usar IA
      if (useAI) {
        // Passar o nome capturado nesta mensagem ou o leadName já salvo para a IA usar no prompt
        const nameToUse = extractedNameForThisMessage || leadName;
        response = await analyzeResponseAndGenerateNext(currentMessage, currentStage, nameToUse);
      }
      
      // Simular tempo de digitação antes de mostrar resposta
      setTimeout(async () => {
        // Buscar vendedores reais da escola para usar nome correto
        const schoolSellers = getSellersBySchool(user.schoolId).filter(s => s.active);
        const schoolName = currentSchool?.name || 'Rockfeller Brasil';
        
        // Usar vendedor atribuído ou primeiro vendedor ativo da escola
        const actualSeller = assignedSeller || (schoolSellers.length > 0 ? schoolSellers[0] : null);
        const sellerName = actualSeller?.name || 'Consultor da Rockfeller';
        
        // Usar o nome capturado nesta mensagem ou o leadName do estado
        const currentLeadName = extractedNameForThisMessage || leadName;
        console.log(`[LeadQualification] DEBUG - extractedNameForThisMessage: "${extractedNameForThisMessage}"`);
        console.log(`[LeadQualification] DEBUG - leadName do estado: "${leadName}"`);
        console.log(`[LeadQualification] DEBUG - currentLeadName final: "${currentLeadName}"`);
        console.log(`[LeadQualification] DEBUG - response.message ANTES replacePlaceholders: "${response.message}"`);
        
        const cleanMessage = replacePlaceholders(response.message, currentLeadName, sellerName, schoolName);
        console.log(`[LeadQualification] DEBUG - cleanMessage APÓS replacePlaceholders: "${cleanMessage}"`);
        
        const aiMessage = {
          type: 'ai' as const,
          content: cleanMessage,
          timestamp: new Date()
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        setIsTyping(false);
        
        // Atualizar score e estágio
        updateScore(response.scoreIncrease);
        
        if (response.nextStage !== currentStage) {
          setCurrentStage(response.nextStage);
        }
        
        // Atualizar conversa persistente
        await updateQualificationConversation(currentConversation.id, {
          messages: finalMessages,
          stage: response.nextStage,
          score: leadScore + response.scoreIncrease,
          stageScores: { ...stageScores, [qualificationStages[currentStage].id]: response.scoreIncrease }
        });
        
        // Se chegou ao final dos estágios
        if (response.completed) {
          setWaitingForResponse(true); // Aguardar resposta para agendamento
          
          // Criar lead qualificado
          if (leadName && user) {
            await registerLead({
              name: leadName,
              email: leadEmail || '',
              phone: leadPhone || '',
              source: 'Qualificação IA',
              method: 'adults',
              modality: 'presencial',
              score: leadScore,
              status: 'qualificado',
              schoolId: user.schoolId,
              assignedTo: assignedSeller?.id,
              notes: `Lead qualificado via IA. Score: ${leadScore}/100`
            });
          }
        }
      }, 2500);

    } catch (error) {
      setIsTyping(false);
      toast({
        title: "Erro",
        description: "Erro ao processar resposta. Verifique sua API key.",
        variant: "destructive",
      });
    }

    setCurrentMessage('');
  };

  // Processar resposta para agendamento
  const handleSchedulingMessage = async () => {
    if (!currentMessage.trim() || !currentConversation) return;
    
    console.log(`[LeadQualification] Processando agendamento - leadName: "${leadName}", currentMessage: "${currentMessage}"`);
    
    // Adicionar mensagem do usuário
    const userMessage = {
      type: 'user' as const,
      content: currentMessage,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Tentar processar agendamento
    const scheduled = await handleSchedulingResponse(currentMessage);
    
    if (!scheduled) {
      // Se não conseguiu agendar, responder de forma natural
      const followUpMessage = {
        type: 'ai' as const,
        content: `Entendi! Sem problemas. 

Se mudou de ideia e quiser conversar, é só me falar! Estou aqui para te ajudar quando precisar. 😊

Tem mais alguma dúvida sobre nossos cursos?`,
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, followUpMessage]);
        setWaitingForResponse(true);
      }, 2000);
    }
    
    // Atualizar conversa
    await updateQualificationConversation(currentConversation.id, {
      messages: updatedMessages
    });
    
    setCurrentMessage('');
  };

  // Função principal de envio (roteamento)
  const handleMainSendMessage = async () => {
    if (currentStage >= qualificationStages.length - 1 && leadScore >= 80) {
      // Estágio de agendamento
      await handleSchedulingMessage();
    } else {
      // Estágios normais de qualificação
      await handleSendMessage();
    }
  };

  // Função para extrair nome da mensagem
  const extractNameFromMessage = (message: string): string => {
    const text = message.trim();
    console.log(`[DEBUG extractNameFromMessage] Analisando mensagem: "${text}"`);
    
    // Lista de palavras a ignorar
    const stopWords = ['oi', 'olá', 'ola', 'hey', 'bom', 'dia', 'tarde', 'noite', 'tudo', 'bem', 'boa', 'meu', 'nome', 'é'];
    
    // Primeiro, tentar padrões específicos
    const patterns = [
      /(?:me chamo|sou|nome é|é)\s+([A-Za-zÀ-ÿ\s]+)/i,
      /(?:meu nome é|eu sou)\s+([A-Za-zÀ-ÿ\s]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim()
          .replace(/[^\w\sÀ-ÿ]/g, '')
          .replace(/\s+/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        if (name.length > 1 && name.length < 50) {
          console.log(`[LeadQualification] Nome extraído via padrão: "${name}"`);
          return name;
        }
      }
    }
    
    // Se não encontrou com padrões, tentar texto simples (como "WADE")
    // Remover stop words e verificar se sobrou algo que parece nome
    const words = text.toLowerCase().split(/\s+/);
    console.log(`[DEBUG extractNameFromMessage] Palavras encontradas: ${JSON.stringify(words)}`);
    
    const filteredWords = words.filter(word => 
      word.length > 1 && 
      !stopWords.includes(word) &&
      /^[a-záàâãéèêíìîóòôõúùûç]+$/i.test(word) // Apenas letras
    );
    console.log(`[DEBUG extractNameFromMessage] Palavras filtradas: ${JSON.stringify(filteredWords)}`);
    
    if (filteredWords.length > 0 && filteredWords.length <= 3) {
      // Pegar até 2 palavras para nome composto
      const name = filteredWords.slice(0, 2)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      console.log(`[LeadQualification] Nome extraído via texto simples: "${name}" (original: "${text}")`);
      return name;
    }
    
    console.log(`[LeadQualification] Não conseguiu extrair nome de: "${text}"`);
    return '';
  };

  // Função para processar agendamento
  const handleSchedulingResponse = async (response: string) => {
    const lowerResponse = response.toLowerCase();
    
    // Detectar se lead quer agendar
    if (lowerResponse.includes('sim') || lowerResponse.includes('claro') || 
        lowerResponse.includes('pode') || lowerResponse.includes('quero') ||
        lowerResponse.includes('gostaria') || lowerResponse.includes('aceito')) {
      
      // Detectar preferência (online/presencial)
      const isOnline = lowerResponse.includes('online') || lowerResponse.includes('video') || 
                      lowerResponse.includes('chamada') || lowerResponse.includes('virtual');
      const isPresencial = lowerResponse.includes('presencial') || lowerResponse.includes('escola') ||
                          lowerResponse.includes('pessoal') || lowerResponse.includes('ai');
      
      let meetingType: 'online' | 'presencial' = 'online';
      if (isPresencial && !isOnline) {
        meetingType = 'presencial';
      }
      
      // Criar agendamento
      if (user && leadName) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const appointmentData = {
          leadId: currentConversation?.id || '',
          leadName: leadName,
          leadPhone: leadPhone,
          leadEmail: leadEmail,
          date: tomorrow.toISOString().split('T')[0],
          time: '14:00',
          type: meetingType,
          status: 'agendado' as const,
          schoolId: user.schoolId,
          assignedTo: assignedSeller?.id,
          notes: `Agendamento via qualificação IA. Score: ${leadScore}/100`,
          meetingLink: meetingType === 'online' ? 'https://meet.google.com/novo-link' : undefined,
          address: meetingType === 'presencial' ? currentSchool?.address : undefined
        };
        
        const success = await createAppointment(appointmentData);
        
        if (success) {
          // Atualizar status do lead
          if (currentConversation) {
            await updateQualificationConversation(currentConversation.id, {
              status: 'completed'
            });
          }
          
          // Mensagem de confirmação
          const confirmationMessage = `Perfeito ${leadName}! 🎉

Agendei sua conversa para amanhã às 14h00 (${meetingType === 'online' ? 'online' : 'na nossa escola'}).

${meetingType === 'online' ? 
  'Vou te enviar o link da reunião por WhatsApp.' : 
  `Nosso endereço: ${currentSchool?.address || 'Endereço será enviado por WhatsApp'}`
}

Qualquer dúvida, me chame! 😊

Até amanhã!`;

          setTimeout(() => {
            const message = {
              type: 'ai' as const,
              content: confirmationMessage,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, message]);
            
            // Finalizar conversa
            setTimeout(() => {
              setWaitingForResponse(false);
              setConversationStarted(false);
              
              toast({
                title: "Agendamento realizado!",
                description: `Conversa agendada com ${leadName} para amanhã às 14h`,
              });
            }, 3000);
          }, 1500);
          
          return true;
        }
      }
    }
    
    return false;
  };

  // Analisar resposta e gerar próxima pergunta
  const analyzeResponseAndGenerateNext = async (userResponse: string, stageIndex: number, capturedNameInThisMessage?: string) => {
    const currentStageData = qualificationStages[stageIndex];
    
    // Construir contexto RAG
    let ragContext = '';
    if (ragFiles.length > 0) {
      ragContext = ragFiles.map(file => file.content).join('\n\n');
    }

    // Obter informações do vendedor e escola usando vendedores reais
    const schoolSellers = getSellersBySchool(user.schoolId).filter(s => s.active);
    const schoolName = currentSchool?.name || 'Rockfeller Brasil';
    
    // Usar vendedor atribuído ou primeiro vendedor ativo da escola
    const actualSeller = assignedSeller || (schoolSellers.length > 0 ? schoolSellers[0] : null);
    const sellerName = actualSeller?.name || 'Consultor da Rockfeller';
    
    // Usar o nome capturado nesta mensagem se disponível, senão usar o leadName do estado
    const currentLeadNameForPrompt = capturedNameInThisMessage || leadName;

    // Prompt conversacional e focado no agendamento
    const analysisPrompt = `Você é ${sellerName}, um consultor de vendas amigável e conversacional da ${schoolName}.

INFORMAÇÕES DO LEAD:
- Nome: ${currentLeadNameForPrompt || 'Não capturado ainda'}
- Estágio: ${currentStageData.name}

SUA IDENTIDADE:
- Seu nome: ${sellerName}
- Você trabalha na: ${schoolName}
- Você é um consultor experiente e amigável

CONTEXTO DA EMPRESA:
${ragContext}

MODALIDADES DISPONÍVEIS:
- Presencial: Aulas na escola com professores nativos
- Online: Aulas ao vivo por videoconferência
- Híbrido: Combinação de presencial e online
- Horários flexíveis: Manhã, tarde e noite

ESTÁGIO ATUAL: ${currentStageData.name}
PERGUNTA FEITA: ${currentStageData.question}
RESPOSTA DO LEAD: ${userResponse}

SEU OBJETIVO: Aquecer o lead e conseguir um agendamento para conversa com vendedor humano.

INSTRUÇÕES IMPORTANTES:
- Você é ${sellerName} da ${schoolName} - use sempre essa identidade
- ${currentLeadNameForPrompt ? `SEMPRE use o nome "${currentLeadNameForPrompt}" nas suas respostas para personalizar` : 'Se souber o nome do lead, sempre use nas respostas'}
- CRÍTICO: NUNCA use placeholders como [Seu Nome], [NOME], [NOME_LEAD] ou similares - SEMPRE use o nome real "${currentLeadNameForPrompt}" quando se referir ao lead
- SEMPRE responda às perguntas e objeções do lead
- Se o lead questionar algo (como "já não estamos conversando aqui?"), responda de forma inteligente
- NÃO ignore questionamentos ou objeções
- Aceite respostas gerais como válidas
- Use emojis ocasionalmente para ser mais humano
- Foque em criar interesse e conseguir agendamento

COMO LIDAR COM OBJEÇÕES E PERGUNTAS:
- Se o lead perguntar "já não estamos conversando aqui?", responda: "Verdade! 😊 Estamos sim conversando, mas uma conversa por vídeo ou telefone é bem mais rica, né? Posso te mostrar nossa escola, tirar dúvidas específicas e te dar uma orientação mais personalizada. São só 15 minutinhos!"
- Se o lead perguntar "seria online ou presencial?" ele está perguntando sobre a CONVERSA DE AGENDAMENTO, não sobre as aulas. Responda: "A conversa pode ser online ou presencial, como preferir! 😊 Podemos fazer por vídeo chamada ou você pode vir aqui na escola. O que é mais conveniente para você?"
- Se o lead fizer qualquer pergunta específica, SEMPRE responda primeiro à pergunta dele
- Se o lead demonstrar resistência, seja empático e ofereça alternativas
- Sempre explique o VALOR da conversa presencial/por vídeo
- NUNCA ignore uma pergunta direta do lead
- IMPORTANTE: Quando falar de "online ou presencial" sempre esclareça se é sobre a CONVERSA ou sobre as AULAS

COMO RESPONDER:
- SEMPRE responda ao que o lead disse primeiro
- Se a resposta for boa o suficiente, avance para próxima pergunta
- Se precisar de mais info, faça UMA pergunta simples e aberta
- Sempre seja positivo e encorajador

EXEMPLOS DE COMO USAR O NOME CORRETAMENTE:
${currentLeadNameForPrompt ? `
- CORRETO: "Perfeito ${currentLeadNameForPrompt}! Que tal conversarmos melhor sobre isso?"
- CORRETO: "Entendi ${currentLeadNameForPrompt}! Baseado no que você disse..."
- ERRADO: "Perfeito [NOME]! Que tal conversarmos..."
- ERRADO: "Entendi [NOME_LEAD]! Baseado no que você disse..."
` : ''}

Responda com uma mensagem natural e completa (máximo 3 frases).`;

    let response;
    let aiResponse;

    // Detectar se é chave OpenAI ou Gemini
    if (apiKey.startsWith('sk' + '-')) {
      // Usar OpenAI
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: analysisPrompt
            },
            {
              role: 'user',
              content: `Resposta do lead: ${userResponse}`
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API da OpenAI');
      }

      const data = await response.json();
      aiResponse = data.choices[0].message.content;
    } else {
      // Usar Gemini (chave AIzaSy...)
      response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${analysisPrompt}\n\nResposta do lead: ${userResponse}`
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API do Gemini');
      }

      const data = await response.json();
      aiResponse = data.candidates[0].content.parts[0].text;
    }

    // Analisar se deve avançar para próximo estágio (mais flexível)
    const scoreIncrease = analyzeScore(userResponse, currentStageData);
    const needsFollowUp = scoreIncrease < currentStageData.maxScore * 0.5; // Se pontuou menos que 50% (mais flexível)
    
    let nextStage = stageIndex;
    let completed = false;

    if (!needsFollowUp) {
      nextStage = stageIndex + 1;
      if (nextStage >= qualificationStages.length) {
        // Chegou ao final dos estágios - preparar para agendamento
        // Garantir que o nome seja obtido corretamente - incluir verificação mais ampla
        const nameForScheduling = currentLeadNameForPrompt || leadName;
        console.log(`[LeadQualification] DEBUG - Nome para agendamento: "${nameForScheduling}" (currentLeadNameForPrompt: "${currentLeadNameForPrompt}", leadName: "${leadName}")`);
        
        // Usar o nome se disponível, senão usar uma saudação genérica mas natural
        const greeting = nameForScheduling ? `Ótimo ${nameForScheduling}!` : 'Ótimo!';
        const schedulingMessage = `${greeting} 😊

Baseado no que conversamos, vejo que você tem um perfil perfeito para nossos cursos. 

Que tal marcarmos uma conversa mais detalhada? Posso agendar uns 15 minutinhos com você para:
- Te mostrar nossa metodologia
- Fazer um teste de nível personalizado
- Apresentar as opções que mais se encaixam no seu perfil

Prefere uma conversa online ou presencial na nossa escola?`;

        return {
          message: schedulingMessage,
          scoreIncrease,
          nextStage: stageIndex,
          completed: true
        };
      } else {
        // Personalizar pergunta com nome do lead
        let nextQuestion = qualificationStages[nextStage].question;
        const nameForQuestion = currentLeadNameForPrompt || leadName;
        
        // SEMPRE substituir [NOME] - se não tiver nome, usar versão sem nome
        if (nameForQuestion) {
          nextQuestion = nextQuestion.replace(/\[NOME\]/g, nameForQuestion);
        } else {
          // Remover a parte que contém [NOME] se não tiver nome
          nextQuestion = nextQuestion
            .replace(/Legal \[NOME\]! /g, '')
            .replace(/Perfeito \[NOME\]! /g, 'Perfeito! ')
            .replace(/\[NOME\]/g, 'você');
        }
        
        return {
          message: nextQuestion,
          scoreIncrease,
          nextStage,
          completed: false
        };
      }
    }

    return {
      message: aiResponse,
      scoreIncrease,
      nextStage,
      completed
    };
  };

  // Analisar pontuação da resposta (mais generoso)
  const analyzeScore = (response: string, stage: QualificationStage) => {
    const lowerResponse = response.toLowerCase();
    const hasKeywords = stage.keywords.some(keyword => 
      lowerResponse.includes(keyword.toLowerCase())
    );
    
    const responseLength = response.split(' ').length;
    
    // Mais flexível: aceita respostas menores como válidas
    if (hasKeywords || responseLength > 3) {
      return stage.maxScore; // Resposta boa o suficiente
    } else if (responseLength > 1) {
      return Math.floor(stage.maxScore * 0.7); // Resposta simples mas válida
    } else {
      return Math.floor(stage.maxScore * 0.3); // Resposta muito vaga
    }
  };

  // Atualizar pontuação
  const updateScore = (increase: number) => {
    setLeadScore(prev => Math.min(100, prev + increase));
    
    // Atualizar score do estágio atual
    const stageId = qualificationStages[currentStage]?.id;
    if (stageId) {
      setStageScores(prev => ({
        ...prev,
        [stageId]: (prev[stageId] || 0) + increase
      }));
    }
  };

  // Configurar API
  const handleConfigureAPI = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Insira sua API key do Google Gemini",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem(`gemini_api_key_${user?.schoolId}`, apiKey);
    setIsConfigured(true);
    
    const apiType = apiKey.startsWith('sk' + '-') ? 'OpenAI GPT-3.5' : 'Google Gemini 2.0';
    toast({
      title: "Configurado!",
      description: `${apiType} configurado com sucesso`,
    });
  };

  // Função para extrair apenas o primeiro nome
  const getFirstName = (fullName: string): string => {
    if (!fullName) return fullName;
    const nameParts = fullName.trim().split(' ');
    return nameParts[0];
  };

  // Função para substituir placeholders na resposta da IA
  const replacePlaceholders = (message: string, leadName: string, sellerName: string, schoolName: string): string => {
    let cleanMessage = message;
    
    // Usar apenas o primeiro nome do vendedor
    const sellerFirstName = getFirstName(sellerName);
    
    // Substituir placeholders comuns
    cleanMessage = cleanMessage.replace(/\[Seu Nome\]/g, sellerFirstName);
    cleanMessage = cleanMessage.replace(/\[NOME_VENDEDOR\]/g, sellerFirstName);
    cleanMessage = cleanMessage.replace(/\[VENDEDOR\]/g, sellerFirstName);
    cleanMessage = cleanMessage.replace(/\[CONSULTOR\]/g, sellerFirstName);
    
    // Substituir [NOME] - se não tiver nome, usar alternativas inteligentes
    if (leadName) {
      cleanMessage = cleanMessage.replace(/\[NOME\]/g, leadName);
    } else {
      // Remover partes específicas que ficam estranhas sem nome
      cleanMessage = cleanMessage
        .replace(/Legal \[NOME\]! /g, 'Legal! ')
        .replace(/Perfeito \[NOME\]! /g, 'Perfeito! ')
        .replace(/Ótimo \[NOME\]! /g, 'Ótimo! ')
        .replace(/\[NOME\]/g, 'você');
    }
    
    cleanMessage = cleanMessage.replace(/\[ESCOLA\]/g, schoolName);
    cleanMessage = cleanMessage.replace(/\[NOME_ESCOLA\]/g, schoolName);
    cleanMessage = cleanMessage.replace(/Rockfeller Brasil/g, schoolName);
    
    console.log(`[LeadQualification] DEBUG Placeholders - leadName recebido: "${leadName}", sellerName: "${sellerName}"`);
    console.log(`[LeadQualification] Placeholders substituídos: "${message}" -> "${cleanMessage}"`);
    return cleanMessage;
  };

  // Cor do score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-blue-400';
    return 'text-red-400';
  };

  // Gerar código de embed
  const generateEmbedCode = () => {
    // Verificar se está no cliente antes de usar window
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
    const schoolId = user?.schoolId || '1';
    const embedUrl = `${currentUrl}/embed/chat-qualificacao?schoolId=${schoolId}`;
    
    return {
      iframe: `<iframe 
  src="${embedUrl}" 
  width="400" 
  height="600" 
  frameborder="0" 
  style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
</iframe>`,
      
      widget: `<!-- Chat de Qualificação Rockfeller -->
<div id="rockfeller-chat-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${embedUrl}';
    iframe.width = '400';
    iframe.height = '600';
    iframe.frameBorder = '0';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '20px';
    iframe.style.right = '20px';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    iframe.style.zIndex = '9999';
    document.getElementById('rockfeller-chat-widget').appendChild(iframe);
  })();
</script>`,

      popup: `<!-- Botão para abrir Chat -->
<button id="rockfeller-chat-btn" style="
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  z-index: 9999;
" onclick="openRockfellerChat()">💬</button>

<script>
  function openRockfellerChat() {
    var popup = window.open('${embedUrl}', 'RockfellerChat', 'width=450,height=650,scrollbars=no,resizable=no');
    popup.focus();
  }
</script>`
    };
  };

  // Copiar código para clipboard
  const copyToClipboard = (text: string, type: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "Copiado!",
          description: `Código ${type} copiado para área de transferência`,
        });
      }).catch(() => {
        toast({
          title: "Erro",
          description: "Não foi possível copiar o código",
          variant: "destructive",
        });
      });
    } else {
      toast({
        title: "Erro",
        description: "Clipboard não disponível",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`space-y-${isMobile ? '3' : '6'} ${isMobile ? 'pb-4' : ''}`}>
      {/* Configuração */}
      {!isConfigured && (
        <Card className={`${
          isMobile ? 'p-4' : 'p-6'
        } bg-slate-800/50 backdrop-blur-sm border-slate-700 border-blue-500/50`}>
          <div className={`space-y-${isMobile ? '3' : '4'}`}>
            <div className={`flex items-center ${
              isMobile ? 'space-x-1' : 'space-x-2'
            }`}>
              <Settings className="text-blue-400" size={isMobile ? 18 : 24} />
              <h3 className={`${
                isMobile ? 'text-base' : 'text-lg'
              } font-semibold text-white`}>
                Configurar IA (OpenAI ou Gemini)
              </h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apikey" className={`text-slate-300 ${
                isMobile ? 'text-sm' : ''
              }`}>
                API Key (OpenAI: sk_... ou Gemini: AIzaSy...)
              </Label>
              <Input
                id="apikey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className={`bg-slate-700/50 border-slate-600 text-white ${
                  isMobile ? 'h-12' : ''
                }`}
              />
            </div>
            <Button
              onClick={handleConfigureAPI}
              className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 ${
                isMobile ? 'h-12 w-full' : ''
              }`}
            >
              Configurar API
            </Button>
          </div>
        </Card>
      )}

      {/* Informações do Vendedor Atribuído */}
      {conversationStarted && assignedSeller && (
        <Card className={`${
          isMobile ? 'p-4' : 'p-6'
        } bg-slate-800/50 backdrop-blur-sm border-slate-700 border-green-500/50`}>
          <div className={`space-y-${isMobile ? '2' : '3'}`}>
            <div className={`flex items-center ${
              isMobile ? 'space-x-1' : 'space-x-2'
            }`}>
              <Bot className="text-green-400" size={isMobile ? 18 : 20} />
              <h3 className={`${
                isMobile ? 'text-sm' : 'text-base'
              } font-semibold text-white`}>
                Vendedor Atribuído
              </h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-green-400 font-medium ${
                  isMobile ? 'text-sm' : ''
                }`}>
                  {assignedSeller.name}
                </p>
                <p className={`text-slate-400 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  {assignedSeller.role}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-slate-300 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  Lead distribuído automaticamente
                </p>
                <p className={`text-green-400 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  Sistema de distribuição equitativa
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Header da Qualificação com Score - COMPACTO */}
      <Card className={`${
        isMobile ? 'p-2' : 'p-3'
      } bg-slate-800/50 backdrop-blur-sm border-slate-700`}>
        <div className={`${
          isMobile 
            ? 'flex flex-col space-y-1' 
            : 'flex items-center justify-between'
        }`}>
          <div className={`flex items-center ${
            isMobile ? 'space-x-1' : 'space-x-2'
          }`}>
            <Bot className="text-blue-400" size={isMobile ? 14 : 16} />
            <h2 className={`${
              isMobile ? 'text-sm' : 'text-lg'
            } font-semibold text-white`}>
              Qualificação Inteligente
            </h2>
          </div>
          <div className={`flex items-center space-x-3 ${
            isMobile ? 'self-end' : ''
          }`}>
            {ragFiles.length > 0 && (
              <div className="flex items-center space-x-1">
                <FileText className="text-purple-400" size={12} />
                <span className="text-purple-400 text-xs">{ragFiles.length} arquivos RAG</span>
              </div>
            )}
            <div className="text-center">
              <p className={`text-slate-300 ${
                isMobile ? 'text-xs' : 'text-xs'
              }`}>
                Score do Lead
              </p>
              <p className={`${
                isMobile ? 'text-lg' : 'text-xl'
              } font-bold ${getScoreColor(leadScore)}`}>
                {leadScore}/100
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Critérios BANT - Movido para cima */}
      <Card className={`${
        isMobile ? 'p-3' : 'p-4'
      } bg-slate-800/50 backdrop-blur-sm border-slate-700`}>
        <h3 className={`${
          isMobile ? 'text-sm mb-3' : 'text-base mb-4'
        } font-semibold text-white flex items-center`}>
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
          Status da Qualificação
        </h3>
        <div className={`grid ${
          isMobile 
            ? 'grid-cols-2 gap-3' 
            : 'grid-cols-1 md:grid-cols-4 gap-4'
        }`}>
          {qualificationStages.map((stage, index) => {
            const stageScore = stageScores[stage.id] || 0;
            const isActive = index === currentStage && conversationStarted;
            return (
              <div key={stage.id} className={`text-center p-3 rounded-lg transition-all duration-300 ${
                isActive ? 'bg-blue-500/20 border border-blue-500/50 scale-105' : 'bg-slate-700/30'
              }`}>
                <p className={`text-slate-300 font-medium mb-2 ${
                  isMobile ? 'text-xs' : 'text-sm'
                } ${isActive ? 'text-blue-300' : ''}`}>
                  {stage.name}
                </p>
                <div className="w-full bg-slate-700 rounded-full h-1 mb-2">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                        : stageScore > 0
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-gradient-to-r from-slate-500 to-slate-600'
                    }`}
                    style={{ width: `${Math.min(100, (stageScore / stage.maxScore) * 100)}%` }}
                  />
                </div>
                <p className={`${
                  isMobile ? 'text-xs' : 'text-sm'
                } ${
                  isActive ? 'text-blue-400 font-medium' : 'text-slate-400'
                }`}>
                  {stageScore}/{stage.maxScore}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Interface de Chat */}
      <Card className={`${
        isMobile ? 'p-3' : 'p-4'
      } bg-slate-800/50 backdrop-blur-sm border-slate-700`}>
        {/* Header do Chat */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MessageCircle className="text-blue-400" size={18} />
            <h3 className="text-lg font-medium text-white">Conversa com Lead</h3>
          </div>
          <div className="flex items-center space-x-3">
            {/* Botão Nova Conversa - visível quando há conversa ativa */}
            {conversationStarted && (
              <Button
                onClick={startNewConversation}
                variant="outline"
                size="sm"
                className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:text-white"
              >
                <RotateCcw size={14} className="mr-1" />
                Nova Conversa
              </Button>
            )}
            
            {/* Botão de Embed */}
            <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                >
                  <Code size={14} className="mr-1" />
                  Embed
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center">
                    <Code className="mr-2" size={20} />
                    Código de Incorporação - Chat de Qualificação
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Iframe Simples */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-white flex items-center">
                        <ExternalLink size={16} className="mr-2 text-blue-400" />
                        Iframe Simples
                      </h4>
                      <p className="text-sm text-slate-400">
                        Incorpore diretamente em qualquer página HTML
                      </p>
                      <div className="relative">
                        <Textarea
                          value={generateEmbedCode().iframe}
                          readOnly
                          className="bg-slate-900 border-slate-600 text-slate-300 text-xs font-mono h-32 resize-none"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => copyToClipboard(generateEmbedCode().iframe, 'Iframe')}
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                    </div>

                    {/* Widget Flutuante */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-white flex items-center">
                        <MessageCircle size={16} className="mr-2 text-green-400" />
                        Widget Flutuante
                      </h4>
                      <p className="text-sm text-slate-400">
                        Chat fixo no canto inferior direito da página
                      </p>
                      <div className="relative">
                        <Textarea
                          value={generateEmbedCode().widget}
                          readOnly
                          className="bg-slate-900 border-slate-600 text-slate-300 text-xs font-mono h-32 resize-none"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => copyToClipboard(generateEmbedCode().widget, 'Widget')}
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                    </div>

                    {/* Popup/Modal */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-white flex items-center">
                        <Bot size={16} className="mr-2 text-purple-400" />
                        Botão + Popup
                      </h4>
                      <p className="text-sm text-slate-400">
                        Botão que abre o chat em nova janela
                      </p>
                      <div className="relative">
                        <Textarea
                          value={generateEmbedCode().popup}
                          readOnly
                          className="bg-slate-900 border-slate-600 text-slate-300 text-xs font-mono h-32 resize-none"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => copyToClipboard(generateEmbedCode().popup, 'Popup')}
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Informações adicionais */}
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <h4 className="font-medium text-white mb-2">📋 Instruções de Uso:</h4>
                    <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                      <li><strong>Iframe:</strong> Cole o código HTML em qualquer página web</li>
                      <li><strong>Widget:</strong> Adiciona um chat fixo que não interfere no layout</li>
                      <li><strong>Popup:</strong> Ideal para sites que precisam economizar espaço</li>
                      <li><strong>Personalização:</strong> Você pode alterar width, height e cores no CSS</li>
                      <li><strong>Responsivo:</strong> Todos os códigos se adaptam a dispositivos móveis</li>
                    </ul>
                  </div>

                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                    <h4 className="font-medium text-blue-300 mb-2">🔗 URL do Chat:</h4>
                    <code className="text-sm text-blue-400 bg-slate-900 px-2 py-1 rounded">
                      {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/embed/chat-qualificacao?schoolId={user?.schoolId || '1'}
                    </code>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {conversationStarted && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Ativo</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Área de Mensagens 
            ALTERNATIVAS DE ALTURA AJUSTADAS (troque 'chat-height-safe' por uma das opções):
            - chat-height-safe: calc(55vh - 4rem) - Padrão, evita sobreposição
            - chat-height-compact: calc(40vh - 4rem) - Mais compacto
            - chat-height-full: calc(65vh - 6rem) - Máximo espaço
            - chat-height-adaptive: calc(100vh - 22rem) - Adaptativo, compensa header
        */}
        <div className={`${
          isMobile ? 'h-[30vh]' : 'h-[35vh]'
        } overflow-y-auto space-y-3 mb-4 p-3 bg-slate-900/30 rounded-lg border border-slate-700 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800`}>
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${
              msg.type === 'user' ? 'justify-end' : 'justify-start'
            }`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                msg.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : msg.type === 'ai'
                  ? 'bg-slate-700 text-white'
                  : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
              } ${isMobile ? 'text-sm' : ''}`}>
                <p>{msg.content}</p>
                <p className={`${
                  isMobile ? 'text-xs' : 'text-sm'
                } opacity-70 mt-1`}>
                  {(msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Indicador de digitação */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-slate-700 text-white">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-slate-400">digitando...</span>
                </div>
              </div>
            </div>
                     )}
           <div ref={messagesEndRef} />
        </div>

        {/* Controles */}
        {!conversationStarted ? (
          <Button
            onClick={startConversation}
            disabled={!isConfigured}
            className={`w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 ${
              isMobile ? 'h-12' : ''
            }`}
          >
            <Brain className="mr-2" size={16} />
            Iniciar Nova Conversa
          </Button>
        ) : (
          <div className="space-y-2">
            <div className={`flex ${
              isMobile ? 'space-x-1' : 'space-x-2'
            }`}>
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleMainSendMessage()}
                placeholder={
                  waitingForResponse 
                    ? "Digite sua resposta..." 
                    : conversationStarted
                    ? "Digite sua mensagem..."
                    : "Digite sua mensagem..."
                }
                className={`bg-slate-700/50 border-slate-600 text-white ${
                  isMobile ? 'h-12 text-sm' : ''
                }`}
                disabled={false}
              />
              <Button
                onClick={handleMainSendMessage}
                disabled={!currentMessage.trim()}
                className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 ${
                  isMobile ? 'h-12 px-3' : ''
                }`}
              >
                <Send size={isMobile ? 16 : 18} />
              </Button>
            </div>
            
            {/* Botões de ação */}
            <div className="flex space-x-2">
              {/* Botão para nova conversa */}
              <Button
                onClick={startNewConversation}
                variant="outline"
                className={`flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 ${
                  isMobile ? 'h-10 text-sm' : ''
                }`}
              >
                <RotateCcw className="mr-2" size={isMobile ? 14 : 16} />
                Nova Conversa
              </Button>
              
              {/* Botão para encerrar conversa atual */}
              <Button
                onClick={() => {
                  setConversationStarted(false);
                  setWaitingForResponse(false);
                  setCurrentMessage('');
                  
                  // Marcar conversa atual como completada
                  if (currentConversation) {
                    updateQualificationConversation(currentConversation.id, {
                      status: 'completed'
                    });
                  }
                  
                  toast({
                    title: "Conversa Encerrada",
                    description: "Conversa finalizada manualmente",
                  });
                }}
                variant="outline"
                className={`flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 ${
                  isMobile ? 'h-10 text-sm' : ''
                }`}
              >
                <X className="mr-2" size={isMobile ? 14 : 16} />
                Encerrar
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
