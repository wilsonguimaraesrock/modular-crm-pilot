import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, MessageCircle, RotateCcw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

export const EmbedChatQualificacao = ({ schoolId }: { schoolId: string }) => {
  const { toast } = useToast();
  const { getSellersBySchool, schools } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'system',
      content: 'Chat de qualificação carregado! Clique em "Iniciar Conversa" para começar.',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [leadScore, setLeadScore] = useState(0);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (conversationStarted && messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, conversationStarted]);

  // Função para iniciar uma nova conversa
  const startNewConversation = () => {
    // Resetar todos os estados
    setConversationStarted(false);
    setCurrentMessage('');
    setLeadScore(0);
    setIsTyping(false);
    setLeadName('');
    setCurrentStage(0);
    setMessages([
      {
        type: 'system',
        content: 'Chat de qualificação carregado! Clique em "Iniciar Conversa" para começar.',
        timestamp: new Date()
      }
    ]);

    toast({
      title: "Nova Conversa",
      description: "Pronto para iniciar uma nova qualificação",
    });
  };

  const startConversation = () => {
    setConversationStarted(true);
    setCurrentStage(0);

    const welcomeMessage = `Olá! 😊

Sou a assistente virtual da Rockfeller Brasil! 

Antes de começarmos, Qual é o seu nome?`;

    const initialMessage: Message = {
      type: 'ai',
      content: welcomeMessage,
      timestamp: new Date()
    };

    setMessages([initialMessage]);
  };

  // Função para extrair nome da mensagem
  const extractNameFromMessage = (message: string): string => {
    const text = message.trim();
    
    // Lista de palavras a ignorar
    const stopWords = ['oi', 'olá', 'ola', 'hey', 'bom', 'dia', 'tarde', 'noite', 'tudo', 'bem', 'boa', 'e', 'é', 'sou', 'me', 'chamo', 'meu', 'nome', 'minha', 'eu', 'a', 'o', 'da', 'do', 'de'];
    
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
          console.log(`[EmbedChat] Nome extraído via padrão: "${name}"`);
          return name;
        }
      }
    }
    
    // Se não encontrou com padrões, tentar texto simples (como "WADE")
    const words = text.toLowerCase().split(/\s+/);
    const filteredWords = words.filter(word => 
      word.length > 1 && 
      !stopWords.includes(word) &&
      /^[a-záàâãéèêíìîóòôõúùûç]+$/i.test(word) // Apenas letras
    );
    
    if (filteredWords.length > 0 && filteredWords.length <= 3) {
      // Pegar até 2 palavras para nome composto
      const name = filteredWords.slice(0, 2)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      console.log(`[EmbedChat] Nome extraído via texto simples: "${name}" (original: "${text}")`);
      return name;
    }
    
    console.log(`[EmbedChat] Não conseguiu extrair nome de: "${text}"`);
    return '';
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Capturar nome se estivermos no primeiro estágio
    let extractedNameForThisMessage = '';
    if (currentStage === 0 && !leadName) {
      extractedNameForThisMessage = extractNameFromMessage(currentMessage);
      if (extractedNameForThisMessage) {
        console.log(`[EmbedChat] Nome capturado: "${extractedNameForThisMessage}"`);
        setLeadName(extractedNameForThisMessage);
      } else {
        console.log(`[EmbedChat] Nome NÃO capturado da mensagem: "${currentMessage}"`);
      }
    }

    setCurrentMessage('');
    setIsTyping(true);
    
    setTimeout(() => {
      let response = "";
      
      if (currentStage === 0) {
        // Usar o nome capturado nesta mensagem
        if (extractedNameForThisMessage) {
          // Buscar vendedores reais da escola
          const schoolSellers = getSellersBySchool(schoolId).filter(s => s.active);
          const currentSchool = schools.find(s => s.id === schoolId);
          const fullSellerName = schoolSellers.length > 0 ? schoolSellers[0].name : 'Consultor';
          const sellerFirstName = getFirstName(fullSellerName);
          const schoolName = currentSchool?.name || 'Rockfeller Brasil';
          
          response = `Muito prazer, ${extractedNameForThisMessage}! 😊\n\nMe conta, qual é o seu principal objetivo com o inglês?`;
          setCurrentStage(1);
        } else {
          response = "Não consegui identificar seu nome. Pode me dizer de novo como gostaria que eu te chamasse?";
        }
      } else if (currentStage === 1) {
        response = `Entendi! E quando você gostaria de começar? Está procurando algo para começar logo?`;
        setCurrentStage(2);
      } else if (currentStage === 2) {
        // Usar o nome capturado nesta mensagem ou o leadName já salvo
        const currentLeadName = extractedNameForThisMessage || leadName;
        console.log(`[EmbedChat] DEBUG - Nome para mensagem final: "${currentLeadName}" (extractedNameForThisMessage: "${extractedNameForThisMessage}", leadName: "${leadName}")`);
        
        const greeting = currentLeadName ? `Perfeito ${currentLeadName}!` : 'Perfeito!';
        response = `${greeting} Que tal conversarmos melhor sobre isso? Nossa equipe entrará em contato em breve para te mostrar nossas opções. Obrigada! 😊`;
        setCurrentStage(3);
      } else {
        response = "Obrigada pelas informações! Nossa equipe entrará em contato em breve.";
      }
      
      // Aplicar substituição de placeholders usando nome capturado ou do estado
      const finalLeadName = extractedNameForThisMessage || leadName;
      console.log(`[EmbedChat] DEBUG - extractedNameForThisMessage: "${extractedNameForThisMessage}"`);
      console.log(`[EmbedChat] DEBUG - leadName do estado: "${leadName}"`);
      console.log(`[EmbedChat] DEBUG - finalLeadName: "${finalLeadName}"`);
      console.log(`[EmbedChat] DEBUG - response ANTES replacePlaceholders: "${response}"`);
      
      const cleanResponse = replacePlaceholders(response, finalLeadName);
      console.log(`[EmbedChat] DEBUG - cleanResponse APÓS replacePlaceholders: "${cleanResponse}"`);
      
      const aiMessage: Message = {
        type: 'ai',
        content: cleanResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      setLeadScore(prev => Math.min(100, prev + 25));
    }, 2000);
  };

  // Função para extrair apenas o primeiro nome
  const getFirstName = (fullName: string): string => {
    if (!fullName) return fullName;
    const nameParts = fullName.trim().split(' ');
    return nameParts[0];
  };

  // Função para substituir placeholders na resposta da IA
  const replacePlaceholders = (message: string, leadName: string): string => {
    let cleanMessage = message;
    
    // Buscar vendedores reais da escola
    const schoolSellers = getSellersBySchool(schoolId).filter(s => s.active);
    const currentSchool = schools.find(s => s.id === schoolId);
    
    // Usar primeiro vendedor ativo ou nome padrão, e extrair apenas o primeiro nome
    const fullSellerName = schoolSellers.length > 0 ? schoolSellers[0].name : 'Consultor da Rockfeller';
    const sellerFirstName = getFirstName(fullSellerName);
    const schoolName = currentSchool?.name || 'Rockfeller Brasil';
    
    // Substituir placeholders comuns usando apenas o primeiro nome
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
    
    console.log(`[EmbedChat] Placeholders substituídos: "${message}" -> "${cleanMessage}"`);
    return cleanMessage;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-blue-400';
    return 'text-red-400';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="text-blue-400" size={20} />
            <h1 className="text-lg font-semibold text-white">
              Qualificação Rockfeller
            </h1>
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
                <RotateCcw size={12} className="mr-1" />
                Nova
              </Button>
            )}
            <div className="text-center">
              <p className="text-xs text-slate-400">Score</p>
              <p className={`text-lg font-bold ${getScoreColor(leadScore)}`}>
                {leadScore}/100
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4">
        <Card className="flex-1 flex flex-col bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className="flex-1 overflow-y-auto space-y-3 p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.type === 'ai'
                      ? 'bg-slate-700 text-slate-100'
                      : 'bg-slate-600 text-slate-300 text-center'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {(msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-700 p-4">
            {!conversationStarted ? (
              <Button
                onClick={startConversation}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <MessageCircle className="mr-2" size={18} />
                Iniciar Conversa
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send size={18} />
                  </Button>
                </div>
                
                {/* Botões de ação */}
                <div className="flex space-x-2">
                  <Button
                    onClick={startNewConversation}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50"
                  >
                    <RotateCcw className="mr-1" size={14} />
                    Nova Conversa
                  </Button>
                  <Button
                    onClick={() => {
                      setConversationStarted(false);
                      setCurrentMessage('');
                      setLeadScore(0);
                      setIsTyping(false);
                      setLeadName('');
                      setCurrentStage(0);
                      setMessages([
                        {
                          type: 'system',
                          content: 'Chat de qualificação carregado! Clique em "Iniciar Conversa" para começar.',
                          timestamp: new Date()
                        }
                      ]);
                      
                      toast({
                        title: "Conversa Encerrada",
                        description: "Conversa finalizada",
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                  >
                    <X className="mr-1" size={14} />
                    Encerrar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
