import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Bot, Settings, Brain, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth, Seller } from '@/contexts/AuthContext';

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
  const { user, currentSchool, getSellersBySchool, getNextAvailableSeller } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estados principais
  const [messages, setMessages] = useState([
    {
      type: 'system',
      content: 'Sistema de qualificação IA pronto. Configure sua API key do ChatGPT para começar.',
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

  // Configurações da IA e RAG
  const [aiPrompt, setAiPrompt] = useState('');
  const [ragFiles, setRagFiles] = useState<any[]>([]);

  // Estágios de qualificação simplificados - foco no agendamento
  const qualificationStages: QualificationStage[] = [
    {
      id: 'interest',
      name: 'Interesse',
      question: 'Legal! Me conta, qual é o seu principal objetivo com o inglês?',
      keywords: ['trabalho', 'carreira', 'viagem', 'estudo', 'promoção', 'oportunidade', 'pessoal', 'profissional'],
      followUpQuestions: [],
      maxScore: 30
    },
    {
      id: 'timing',
      name: 'Disponibilidade',
      question: 'Entendi! E quando você gostaria de começar? Está procurando algo para começar logo?',
      keywords: ['agora', 'logo', 'semana', 'mês', 'urgente', 'quando', 'disponível'],
      followUpQuestions: [],
      maxScore: 30
    },
    {
      id: 'schedule',
      name: 'Agendamento',
      question: 'Perfeito! Que tal conversarmos melhor sobre isso? Posso agendar uma conversa rápida com você para te mostrar nossas opções?',
      keywords: ['sim', 'claro', 'pode', 'quero', 'gostaria', 'quando', 'horário'],
      followUpQuestions: [],
      maxScore: 40
    }
  ];

  // Carregar configurações ao inicializar
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
          setRagFiles(JSON.parse(savedFiles));
        } catch (error) {
          console.error('Erro ao carregar arquivos RAG:', error);
        }
      }

      // Carregar API Key
      const savedApiKey = localStorage.getItem(`gemini_api_key_${user.schoolId}`);
      if (savedApiKey) {
        setApiKey(savedApiKey);
        setIsConfigured(true);
      } else {
        // Configurar API key padrão para teste
        const defaultApiKey = 'AIzaSyB4v7NO0LZ3w1DOw2I4NsmLO4VHnFRC9Is';
        setApiKey(defaultApiKey);
        localStorage.setItem(`gemini_api_key_${user.schoolId}`, defaultApiKey);
        setIsConfigured(true);
      }
    }
  }, [user]);

  // Scroll automático para o final das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Função para simular digitação e enviar mensagem
  const sendMessageWithTyping = (content: string, delay: number = 3000) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const message = {
        type: 'ai',
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

    setConversationStarted(true);
    setCurrentStage(0);
    setWaitingForResponse(false); // Começa sem esperar resposta para a apresentação

    // Buscar próximo vendedor disponível usando distribuição equitativa
    const currentSeller = user ? getNextAvailableSeller(user.schoolId) : null;
    const sellerToUse = currentSeller || { name: 'Consultor' };
    
    // Armazenar o vendedor atribuído para esta conversa
    setAssignedSeller(currentSeller);
    
    // Função para extrair o primeiro nome ou nome composto
    const getFirstName = (fullName: string) => {
      const nameParts = fullName.trim().split(' ');
      
      // Lista de conectores que indicam nomes compostos
      const compositeConnectors = ['de', 'da', 'do', 'dos', 'das', 'e'];
      
      // Se tem apenas um nome, retorna ele
      if (nameParts.length === 1) {
        return nameParts[0];
      }
      
      // Se o segundo elemento é um conector, é nome composto
      if (nameParts.length >= 2 && compositeConnectors.includes(nameParts[1].toLowerCase())) {
        return `${nameParts[0]} ${nameParts[1]} ${nameParts[2] || ''}`.trim();
      }
      
      // Casos especiais de nomes compostos comuns
      const compositeFirstNames = [
        'ana', 'maria', 'josé', 'joão', 'carlos', 'luiz', 'antonio', 'francisco',
        'pedro', 'paulo', 'marcos', 'andre', 'rafael', 'daniel', 'gabriel'
      ];
      
      if (nameParts.length >= 2) {
        const firstName = nameParts[0].toLowerCase();
        const secondName = nameParts[1].toLowerCase();
        
        // Verifica se é um nome composto comum (ex: Ana Paula, José Carlos)
        if (compositeFirstNames.includes(firstName) && 
            (secondName.length <= 6 || compositeFirstNames.includes(secondName))) {
          return `${nameParts[0]} ${nameParts[1]}`;
        }
      }
      
      // Caso padrão: retorna apenas o primeiro nome
      return nameParts[0];
    };
    
    const sellerFirstName = getFirstName(sellerToUse.name);
    
    // Mensagem de apresentação inicial
    const schoolName = currentSchool?.name || 'Rockfeller Brasil';
    const introMessage = {
      type: 'ai',
      content: `Olá, tudo bem? 😊

Eu sou ${sellerFirstName} da ${schoolName}! 

Como posso te ajudar hoje?`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev.slice(1), introMessage]); // Remove mensagem do sistema
  };

  // Processar resposta do usuário
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    // Se ainda não está esperando resposta (durante apresentação), apenas responder cordialmente
    if (!waitingForResponse && conversationStarted) {
      const userMessage = {
        type: 'user',
        content: currentMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setCurrentMessage('');
      
      // Resposta cordial com indicador de digitação
      sendMessageWithTyping('Que bom! 😊 Vou te fazer algumas perguntinhas rápidas para entender melhor como posso te ajudar.', 2500);
      
      // Primeira pergunta de qualificação após resposta cordial
      setTimeout(() => {
        const firstQuestion = qualificationStages[0].question;
        sendMessageWithTyping(firstQuestion, 3000);
        setWaitingForResponse(true);
      }, 3000);
      
      return;
    }
    
    if (!waitingForResponse) return;

    // Adicionar mensagem do usuário
    const userMessage = {
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Mostrar indicador de digitação enquanto processa
      setIsTyping(true);
      
      // Analisar resposta e gerar próxima pergunta
      const response = await analyzeResponseAndGenerateNext(currentMessage, currentStage);
      
      // Simular tempo de digitação antes de mostrar resposta
      setTimeout(() => {
        const aiMessage = {
          type: 'ai',
          content: response.message,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        
        // Atualizar score e estágio
        updateScore(response.scoreIncrease);
        
        if (response.nextStage !== currentStage) {
          setCurrentStage(response.nextStage);
        }
        
        // Se chegou ao final dos estágios, NÃO finalizar automaticamente
        // Manter a conversa ativa para permitir mais interação e lidar com objeções
        if (response.completed) {
          // Não encerrar a conversa automaticamente
          // setWaitingForResponse(false);
          // setConversationStarted(false);
          
          // Manter conversa ativa para permitir que o lead responda
          setWaitingForResponse(false);
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

  // Analisar resposta e gerar próxima pergunta
  const analyzeResponseAndGenerateNext = async (userResponse: string, stageIndex: number) => {
    const currentStageData = qualificationStages[stageIndex];
    
    // Construir contexto RAG
    let ragContext = '';
    if (ragFiles.length > 0) {
      ragContext = ragFiles.map(file => file.content).join('\n\n');
    }

    // Prompt conversacional e focado no agendamento
    const analysisPrompt = `Você é um consultor de vendas amigável e conversacional de uma escola de inglês.

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
- Seja natural, amigável e conversacional
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

Responda com uma mensagem natural e completa (máximo 3 frases).`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + apiKey, {
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
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Analisar se deve avançar para próximo estágio (mais flexível)
    const scoreIncrease = analyzeScore(userResponse, currentStageData);
    const needsFollowUp = scoreIncrease < currentStageData.maxScore * 0.5; // Se pontuou menos que 50% (mais flexível)
    
    let nextStage = stageIndex;
    let completed = false;

    if (!needsFollowUp) {
      nextStage = stageIndex + 1;
      if (nextStage >= qualificationStages.length) {
        // Chegou ao final dos estágios - usar resposta natural da IA
        // NÃO forçar mensagem padrão, deixar IA responder naturalmente
        return {
          message: aiResponse, // Usar resposta natural da IA
          scoreIncrease,
          nextStage: stageIndex,
          completed: false // Manter conversa ativa
        };
      } else {
        return {
          message: qualificationStages[nextStage].question,
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
    toast({
      title: "Configurado!",
      description: "Gemini 2.0 Flash configurado com sucesso",
    });
  };

  // Cor do score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-blue-400';
    return 'text-red-400';
  };

  return (
    <div className={`space-y-${isMobile ? '4' : '6'}`}>
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
                Configurar Gemini 2.0 Flash
              </h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apikey" className={`text-slate-300 ${
                isMobile ? 'text-sm' : ''
              }`}>
                API Key do Google Gemini
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

      {/* Lead Score e Status */}
      <Card className={`${
        isMobile ? 'p-4' : 'p-6'
      } bg-slate-800/50 backdrop-blur-sm border-slate-700`}>
        <div className={`${
          isMobile 
            ? 'flex flex-col space-y-3' 
            : 'flex items-center justify-between'
        }`}>
          <div className={`flex items-center ${
            isMobile ? 'space-x-1' : 'space-x-2'
          }`}>
            <Bot className="text-blue-400" size={isMobile ? 18 : 24} />
            <h2 className={`${
              isMobile ? 'text-lg' : 'text-2xl'
            } font-semibold text-white`}>
              Qualificação Inteligente
            </h2>
          </div>
          <div className={`flex items-center space-x-4 ${
            isMobile ? 'self-end' : ''
          }`}>
            {ragFiles.length > 0 && (
              <div className="flex items-center space-x-1">
                <FileText className="text-purple-400" size={16} />
                <span className="text-purple-400 text-sm">{ragFiles.length} arquivos RAG</span>
              </div>
            )}
            <div className="text-center">
              <p className={`text-slate-300 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                Score do Lead
              </p>
              <p className={`${
                isMobile ? 'text-2xl' : 'text-3xl'
              } font-bold ${getScoreColor(leadScore)}`}>
                {leadScore}/100
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Interface de Chat */}
      <Card className={`${
        isMobile ? 'p-4' : 'p-6'
      } bg-slate-800/50 backdrop-blur-sm border-slate-700`}>
        <div className={`${
          isMobile ? 'h-64' : 'h-96'
        } overflow-y-auto space-y-3 mb-4 p-3 bg-slate-900/30 rounded-lg border border-slate-700`}>
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
                  {msg.timestamp.toLocaleTimeString('pt-BR', { 
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
            Iniciar Qualificação Inteligente
          </Button>
        ) : (
          <div className="space-y-2">
            <div className={`flex ${
              isMobile ? 'space-x-1' : 'space-x-2'
            }`}>
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 ${
                  isMobile ? 'h-12 px-3' : ''
                }`}
              >
                <Send size={isMobile ? 16 : 18} />
              </Button>
            </div>
            
            {/* Botão para encerrar conversa manualmente */}
            <Button
              onClick={() => {
                setConversationStarted(false);
                setWaitingForResponse(false);
                setCurrentMessage('');
                toast({
                  title: "Conversa Encerrada",
                  description: "Conversa finalizada manualmente",
                });
              }}
              variant="outline"
              className={`w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 ${
                isMobile ? 'h-10 text-sm' : ''
              }`}
            >
              <X className="mr-2" size={isMobile ? 14 : 16} />
              Encerrar Conversa
            </Button>
          </div>
        )}
      </Card>

      {/* Critérios BANT */}
      <Card className={`${
        isMobile ? 'p-4' : 'p-6'
      } bg-slate-800/50 backdrop-blur-sm border-slate-700`}>
        <h3 className={`${
          isMobile ? 'text-base' : 'text-lg'
        } font-semibold text-white mb-${isMobile ? '3' : '4'}`}>
          Critérios BANT
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
              <div key={stage.id} className={`text-center p-3 rounded-lg ${
                isActive ? 'bg-blue-500/20 border border-blue-500/50' : ''
              }`}>
                <p className={`text-slate-300 font-medium mb-2 ${
                  isMobile ? 'text-xs' : ''
                }`}>
                  {stage.name}
                </p>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-r from-slate-500 to-slate-600'
                    }`}
                    style={{ width: `${Math.min(100, (stageScore / stage.maxScore) * 100)}%` }}
                  />
                </div>
                <p className={`text-white font-semibold ${
                  isMobile ? 'text-sm' : ''
                }`}>
                  {Math.min(stage.maxScore, stageScore)}/{stage.maxScore}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
