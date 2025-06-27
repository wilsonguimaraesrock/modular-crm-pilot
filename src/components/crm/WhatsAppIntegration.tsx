import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  MessageSquare, 
  Settings, 
  ExternalLink, 
  Bot, 
  User, 
  Phone, 
  StopCircle,
  PlayCircle,
  UserCheck,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface AIConversation {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  messages: Array<{
    id: string;
    type: 'ai' | 'lead' | 'seller';
    content: string;
    timestamp: Date;
  }>;
  status: 'ai_active' | 'seller_takeover' | 'completed';
  aiEnabled: boolean;
  assignedSeller?: string;
  lastActivity: Date;
}

export const WhatsAppIntegration = () => {
  const isMobile = useIsMobile();
  const { user, getLeadsBySchool, getSellersBySchool } = useAuth();
  const { toast } = useToast();

  // Estados principais
  const [activeTab, setActiveTab] = useState('ai-automation');
  const [wahaConfig, setWahaConfig] = useState({
    url: '',
    apiKey: '',
    session: 'default',
    chatgptKey: ''
  });
  const [isConfigured, setIsConfigured] = useState(false);
  
  // Estados da IA automática
  const [aiConversations, setAiConversations] = useState<AIConversation[]>([]);
  const [aiSettings, setAiSettings] = useState({
    autoStart: true,
    maxMessages: 50, // Aumentado para 50 para permitir conversas longas e naturais
    handoverTriggers: ['quero falar com vendedor', 'preciso de ajuda humana', 'não entendi'],
    workingHours: { start: '09:00', end: '18:00' }
  });

  // Estados do envio manual
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  // Carregar dados
  const schoolLeads = user ? getLeadsBySchool(user.schoolId) : [];
  const sellers = user ? getSellersBySchool(user.schoolId) : [];

  // Mensagens da IA para diferentes estágios
  const aiMessages = {
    welcome: `Olá! 👋 Sou a assistente virtual da Rockfeller Brasil! 

Vi que você demonstrou interesse em nossos cursos de inglês. Que bom ter você aqui! 

Posso te ajudar com algumas informações rápidas:
• Metodologias: Adults, Teens, Kids, Practice & Progress, On Demand
• Modalidades: Presencial e Live
• Horários flexíveis

Qual metodologia mais desperta seu interesse? 🎯`,

    followUp: `Perfeita escolha! 🎉

Nossa metodologia {method} é ideal para {target}. 

Algumas informações importantes:
• Duração: {duration}
• Foco: {focus}
• Modalidade: Presencial ou Live

Você prefere aulas presenciais ou online? E qual sua disponibilidade de horários? 📅`,

    qualification: `Entendi! 👍

Para eu conseguir te ajudar melhor e conectar você com nosso consultor especializado, me conta:

1. Qual seu principal objetivo com o inglês? (trabalho, viagem, estudos)
2. Qual sua urgência para começar?
3. Você já tem alguma experiência com inglês?

Assim posso direcionar você para a melhor opção! 🚀`,

    handover: `Perfeito! 🎯

Baseado no que conversamos, vou conectar você agora com {sellerName}, nosso consultor especializado.

Ele vai poder:
✅ Fazer uma avaliação personalizada
✅ Apresentar valores e condições
✅ Agendar uma aula experimental gratuita

{sellerName} entrará em contato em alguns minutos! 

Alguma pergunta rápida antes dele assumir? 😊`
  };

  // Carregar configurações salvas
  useEffect(() => {
    if (user) {
      const savedConfig = localStorage.getItem(`whatsapp_config_${user.schoolId}`);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setWahaConfig(config);
        setIsConfigured(!!config.url && !!config.session && !!config.chatgptKey);
      }

      const savedConversations = localStorage.getItem(`ai_conversations_${user.schoolId}`);
      if (savedConversations) {
        setAiConversations(JSON.parse(savedConversations));
      }
    }
  }, [user]);

  // Salvar configurações
  const handleSaveConfig = () => {
    if (!wahaConfig.url || !wahaConfig.session || !wahaConfig.chatgptKey) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem(`whatsapp_config_${user?.schoolId}`, JSON.stringify(wahaConfig));
    setIsConfigured(true);
    
    toast({
      title: "Configurado!",
      description: "WhatsApp e IA configurados com sucesso",
    });
  };

  // Iniciar conversa automática com IA
  const startAIConversation = async (lead: any) => {
    if (!isConfigured) {
      toast({
        title: "Configuração necessária",
        description: "Configure o WhatsApp e ChatGPT primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      // Criar nova conversa
      const conversation: AIConversation = {
        id: `conv_${Date.now()}`,
        leadId: lead.id,
        leadName: lead.name,
        leadPhone: lead.phone,
        messages: [],
        status: 'ai_active',
        aiEnabled: true,
        lastActivity: new Date()
      };

      // Enviar mensagem de boas-vindas
      const welcomeMessage = aiMessages.welcome;
      
      await sendWhatsAppMessage(lead.phone, welcomeMessage);
      
      conversation.messages.push({
        id: `msg_${Date.now()}`,
        type: 'ai',
        content: welcomeMessage,
        timestamp: new Date()
      });

      const updatedConversations = [...aiConversations, conversation];
      setAiConversations(updatedConversations);
      localStorage.setItem(`ai_conversations_${user?.schoolId}`, JSON.stringify(updatedConversations));

      toast({
        title: "IA Iniciada!",
        description: `Conversa automática iniciada com ${lead.name}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao iniciar conversa automática",
        variant: "destructive",
      });
    }
  };

  // Passar conversa para vendedor
  const sellerTakeover = (conversationId: string, sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return;

    setAiConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const handoverMessage = aiMessages.handover.replace('{sellerName}', seller.name);
        
        // Enviar mensagem de transição
        sendWhatsAppMessage(conv.leadPhone, handoverMessage);

        return {
          ...conv,
          status: 'seller_takeover',
          aiEnabled: false,
          assignedSeller: seller.name,
          messages: [...conv.messages, {
            id: `msg_${Date.now()}`,
            type: 'ai',
            content: handoverMessage,
            timestamp: new Date()
          }]
        };
      }
      return conv;
    }));

    toast({
      title: "Transferido!",
      description: `Conversa transferida para ${seller.name}`,
    });
  };

  // Parar IA
  const stopAI = (conversationId: string) => {
    setAiConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, aiEnabled: false, status: 'completed' }
        : conv
    ));

    toast({
      title: "IA Pausada",
      description: "Atendimento automático pausado",
    });
  };

  // Função para enviar mensagem via WAHA
  const sendWhatsAppMessage = async (phone: string, content: string) => {
    // Formatar número para o padrão do WhatsApp (sem + e com @c.us)
    const formattedPhone = phone.replace(/\D/g, '') + '@c.us';
    
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    // Adicionar API Key se fornecida
    if (wahaConfig.apiKey) {
      headers['X-Api-Key'] = wahaConfig.apiKey;
    }

    const response = await fetch(`${wahaConfig.url}/api/sendText`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session: wahaConfig.session,
        chatId: formattedPhone,
        text: content
      })
    });

    if (!response.ok) {
      throw new Error('Erro na API do WAHA');
    }
  };

  // Envio manual
  const handleManualSend = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      toast({
        title: "Erro",
        description: "Preencha número e mensagem",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendWhatsAppMessage(phoneNumber, message);
      toast({
        title: "Enviado!",
        description: "Mensagem enviada com sucesso",
      });
      setPhoneNumber('');
      setMessage('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: isMobile ? 0.05 : 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: isMobile ? 10 : 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className={`space-y-${isMobile ? '4' : '6'}`}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Configuração Inicial */}
      {!isConfigured && (
        <motion.div variants={item}>
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 border-blue-500/50">
            <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="text-blue-400" size={20} />
                <h3 className="text-lg font-semibold text-white">
                  Configurar WhatsApp + IA
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">URL do WAHA</Label>
                  <Input
                    value={wahaConfig.url}
                    onChange={(e) => setWahaConfig({...wahaConfig, url: e.target.value})}
                    placeholder="https://app.waha.com"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">API Key (opcional)</Label>
                  <Input
                    type="password"
                    value={wahaConfig.apiKey}
                    onChange={(e) => setWahaConfig({...wahaConfig, apiKey: e.target.value})}
                    placeholder="seu-api-key (se necessário)"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Session</Label>
                  <Input
                    value={wahaConfig.session}
                    onChange={(e) => setWahaConfig({...wahaConfig, session: e.target.value})}
                    placeholder="sua-session"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">ChatGPT API Key</Label>
                  <Input
                    type="password"
                    value={wahaConfig.chatgptKey}
                    onChange={(e) => setWahaConfig({...wahaConfig, chatgptKey: e.target.value})}
                    placeholder="sk-..."
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSaveConfig}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Configurar Integração
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Interface Principal */}
      {isConfigured && (
        <motion.div variants={item}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
              <TabsTrigger value="ai-automation" className="data-[state=active]:bg-slate-700">
                <Bot className="mr-2" size={16} />
                {isMobile ? 'IA' : 'IA Automática'}
              </TabsTrigger>
              <TabsTrigger value="conversations" className="data-[state=active]:bg-slate-700">
                <MessageSquare className="mr-2" size={16} />
                {isMobile ? 'Conversas' : 'Conversas Ativas'}
              </TabsTrigger>
              <TabsTrigger value="manual-send" className="data-[state=active]:bg-slate-700">
                <Send className="mr-2" size={16} />
                {isMobile ? 'Manual' : 'Envio Manual'}
              </TabsTrigger>
            </TabsList>

            {/* IA Automática */}
            <TabsContent value="ai-automation">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center">
                      <Zap className="mr-2 text-yellow-400" />
                      Atendimento Automático
                    </h3>
                    <Badge className="bg-green-500/20 text-green-400">
                      {aiConversations.filter(c => c.aiEnabled).length} Ativas
                    </Badge>
                  </div>

                  {/* Lista de Leads para Iniciar IA */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Leads Disponíveis para IA:</h4>
                    
                    {schoolLeads
                      .filter(lead => lead.phone && !aiConversations.find(c => c.leadId === lead.id))
                      .slice(0, 5)
                      .map(lead => (
                      <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{lead.name}</p>
                          <p className="text-slate-400 text-sm">{lead.phone} • {lead.method}</p>
                          <p className="text-slate-500 text-xs">Score: {lead.score}/100</p>
                        </div>
                        <Button
                          onClick={() => startAIConversation(lead)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                          size="sm"
                        >
                          <PlayCircle className="mr-2" size={16} />
                          Iniciar IA
                        </Button>
                      </div>
                    ))}

                    {schoolLeads.filter(lead => lead.phone && !aiConversations.find(c => c.leadId === lead.id)).length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <MessageSquare className="mx-auto mb-4" size={48} />
                        <p>Nenhum lead novo disponível para IA</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Conversas Ativas */}
            <TabsContent value="conversations">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <h3 className="text-xl font-semibold text-white mb-6">Conversas em Andamento</h3>
                  
                  <div className="space-y-4">
                    {aiConversations.map(conversation => (
                      <div key={conversation.id} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-white font-medium">{conversation.leadName}</p>
                            <p className="text-slate-400 text-sm">{conversation.leadPhone}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${
                              conversation.status === 'ai_active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : conversation.status === 'seller_takeover'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {conversation.status === 'ai_active' && 'IA Ativa'}
                              {conversation.status === 'seller_takeover' && 'Vendedor'}
                              {conversation.status === 'completed' && 'Finalizada'}
                            </Badge>
                          </div>
                        </div>

                        {/* Últimas mensagens */}
                        <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                          {conversation.messages.slice(-2).map(msg => (
                            <div key={msg.id} className={`text-sm p-2 rounded ${
                              msg.type === 'ai' 
                                ? 'bg-blue-500/20 text-blue-100' 
                                : 'bg-slate-600/50 text-slate-200'
                            }`}>
                              <span className="font-medium">
                                {msg.type === 'ai' ? '🤖 IA' : '👤 Lead'}:
                              </span>
                              <span className="ml-2">{msg.content.substring(0, 100)}...</span>
                            </div>
                          ))}
                        </div>

                        {/* Ações */}
                        <div className="flex items-center space-x-2">
                          {conversation.status === 'ai_active' && (
                            <>
                              <select 
                                className="bg-slate-700 border-slate-600 text-white text-sm rounded px-2 py-1"
                                onChange={(e) => sellerTakeover(conversation.id, e.target.value)}
                                defaultValue=""
                              >
                                <option value="">Transferir para vendedor</option>
                                {sellers.map(seller => (
                                  <option key={seller.id} value={seller.id}>
                                    {seller.name}
                                  </option>
                                ))}
                              </select>
                              
                              <Button
                                onClick={() => stopAI(conversation.id)}
                                variant="outline"
                                size="sm"
                                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                              >
                                <StopCircle className="mr-1" size={14} />
                                Parar IA
                              </Button>
                            </>
                          )}

                          {conversation.status === 'seller_takeover' && conversation.assignedSeller && (
                            <div className="flex items-center text-sm text-blue-400">
                              <UserCheck className="mr-1" size={14} />
                              Atendido por: {sellers.find(s => s.id === conversation.assignedSeller)?.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {aiConversations.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <MessageSquare className="mx-auto mb-4" size={48} />
                        <p>Nenhuma conversa ativa</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Envio Manual */}
            <TabsContent value="manual-send">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <h3 className="text-xl font-semibold text-white mb-6">Envio Manual</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Número do WhatsApp</Label>
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+55 11 99999-9999"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-slate-300">Mensagem</Label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Digite sua mensagem..."
                      />
                    </div>
                    
                                         <Button
                       onClick={handleManualSend}
                       className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                     >
                      <Send className="mr-2" size={18} />
                      Enviar Mensagem
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </motion.div>
  );
};
