import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Zap,
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  Eye,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Smartphone,
  Users,
  Loader2,
  ImageIcon,
  FileText,
  Volume2,
  Play,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

// Interfaces
interface WAHASession {
  name: string;
  status: 'STOPPED' | 'STARTING' | 'SCAN_QR_CODE' | 'WORKING' | 'FAILED';
  config?: any;
}

interface WAHAMessage {
  id: string;
  body: string;
  from: string;
  to: string;
  timestamp: number;
  fromMe: boolean;
  type: string;
}

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
  const qrIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Estados principais
  const [activeTab, setActiveTab] = useState('connection');
  const [wahaConfig, setWahaConfig] = useState({
    url: 'http://localhost:3000',
    apiKey: '',
    session: 'default',
    chatgptKey: ''
  });
  
  // Estados da conexão WhatsApp
  const [sessionStatus, setSessionStatus] = useState<WAHASession | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Estados das conversas
  const [messages, setMessages] = useState<WAHAMessage[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Estado para cache das fotos de perfil
  const [profilePictures, setProfilePictures] = useState<{[key: string]: string}>({});
  
  // Ref para scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estados da IA automática
  const [aiConversations, setAiConversations] = useState<AIConversation[]>([]);
  const [aiSettings, setAiSettings] = useState({
    autoStart: true,
    maxMessages: 50,
    handoverTriggers: ['quero falar com vendedor', 'preciso de ajuda humana', 'não entendi'],
    workingHours: { start: '09:00', end: '18:00' }
  });

  // Estados do envio manual
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  
  // Estado para filtro de grupos
  const [hideGroups, setHideGroups] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar dados
  const schoolLeads = user ? getLeadsBySchool(user.schoolId) : [];
  const sellers = user ? getSellersBySchool(user.schoolId) : [];

  // Verificar se há lead direcionado do dashboard
  useEffect(() => {
    const savedTargetLead = localStorage.getItem('whatsapp_target_lead');
    if (savedTargetLead) {
      try {
        const leadData = JSON.parse(savedTargetLead);
        // Verificar se não é muito antigo (5 minutos)
        const isRecent = (Date.now() - leadData.timestamp) < 5 * 60 * 1000;
        
        if (isRecent) {
          // Limpar o número de telefone (remover caracteres especiais)
          const cleanPhone = leadData.phone.replace(/[^\d]/g, '');
          setPhoneNumber(cleanPhone);
          
          // Mensagem personalizada
          const personalizedMessage = `Olá ${leadData.name}! Sou da ${user?.school?.name || 'Rockfeller Brasil'}. 

Vi que você tem interesse em nossos cursos de inglês. Gostaria de conversarmos sobre as opções que temos para você?

Posso te ajudar a escolher o curso ideal para seu perfil! 😊`;
          
          setMessage(personalizedMessage);
          
          // Ir para a aba de envio manual automaticamente
          setActiveTab('manual-send');
          
          // Mostrar notificação
          toast({
            title: "Lead direcionado",
            description: `Pronto para conversar com ${leadData.name} via WhatsApp`,
          });
        }
        
        // Limpar o localStorage
        localStorage.removeItem('whatsapp_target_lead');
      } catch (error) {
        console.error('Erro ao processar lead direcionado:', error);
        localStorage.removeItem('whatsapp_target_lead');
      }
    }
  }, [user, toast]);

  // Carregar configurações salvas
  useEffect(() => {
    if (user) {
      const savedConfig = localStorage.getItem(`whatsapp_config_${user.schoolId}`);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setWahaConfig(config);
        // Verificar status da sessão automaticamente
        checkSessionStatus(config);
        // Iniciar monitoramento se a configuração existir
        setTimeout(() => startStatusMonitoring(), 1000);
      } else {
        // Mesmo sem configuração salva, verificar se existe sessão default
        checkSessionStatus();
        // Iniciar monitoramento mesmo sem configuração salva
        setTimeout(() => startStatusMonitoring(), 1000);
      }

      const savedConversations = localStorage.getItem(`ai_conversations_${user.schoolId}`);
      if (savedConversations) {
        setAiConversations(JSON.parse(savedConversations));
      }
    }
  }, [user]);

  // Carregar conversas quando a sessão estiver ativa
  useEffect(() => {
    console.log('[useEffect] Verificando condições para carregar conversas:', {
      sessionStatus: sessionStatus?.status,
      shouldLoadChats: sessionStatus?.status === 'WORKING'
    });
    
    // Carregar conversas sempre que estiver conectado, independente da aba
    if (sessionStatus?.status === 'WORKING') {
      console.log('[useEffect] Carregando conversas automaticamente...');
      loadChats();
    }
  }, [sessionStatus?.status]);

  // Auto-refresh das mensagens quando uma conversa está selecionada
  useEffect(() => {
    if (selectedChat && sessionStatus?.status === 'WORKING') {
      // Iniciar auto-refresh a cada 5 segundos
      const startMessagesRefresh = () => {
        if (messagesRefreshRef.current) clearInterval(messagesRefreshRef.current);
        messagesRefreshRef.current = setInterval(() => {
          console.log('[Auto-refresh] Atualizando mensagens...');
          loadChatMessages(selectedChat);
        }, 5000);
      };
      
      startMessagesRefresh();
      
      return () => {
        if (messagesRefreshRef.current) {
          clearInterval(messagesRefreshRef.current);
          messagesRefreshRef.current = null;
        }
      };
    }
  }, [selectedChat, sessionStatus?.status]);

  // Limpar intervalos ao desmontar
  useEffect(() => {
    return () => {
      if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      if (messagesRefreshRef.current) clearInterval(messagesRefreshRef.current);
    };
  }, []);

  // Funções da API WAHA
  const makeWAHARequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${wahaConfig.url}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(wahaConfig.apiKey && { 'Authorization': `Bearer ${wahaConfig.apiKey}` }),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WAHA Request Error:', error);
      throw error;
    }
  };

  // Verificar status da sessão
  const checkSessionStatus = async (config = wahaConfig) => {
    try {
      const response = await makeWAHARequest(`/api/sessions/${config.session}`);
      const previousStatus = sessionStatus?.status;
      setSessionStatus(response);
      setConnectionError(null);
      
      // Se mudou de SCAN_QR_CODE para WORKING, mostrar notificação
      if (previousStatus === 'SCAN_QR_CODE' && response.status === 'WORKING') {
        toast({
          title: "✅ Conectado!",
          description: `WhatsApp conectado como ${response.me?.pushName || 'usuário'}`,
        });
      }
      
      // Se estiver esperando QR Code, começar a buscar
      if (response.status === 'SCAN_QR_CODE') {
        startQRCodePolling();
      } else {
        stopQRCodePolling();
      }
      
      // Se estiver conectado, buscar mensagens e contatos
      if (response.status === 'WORKING') {
        loadChats();
        loadContacts();
      }
      
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Erro ao verificar status');
      setSessionStatus(null);
    }
  };

  // Iniciar monitoramento do QR Code
  const startQRCodePolling = () => {
    if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
    
    const fetchQRCode = async () => {
      try {
        // Endpoint correto do WAHA: /api/{session}/auth/qr
        const response = await fetch(`${wahaConfig.url}/api/${wahaConfig.session}/auth/qr`, {
          headers: {
            'Accept': 'image/png',
            ...(wahaConfig.apiKey && { 'Authorization': `Bearer ${wahaConfig.apiKey}` }),
          },
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const qrUrl = URL.createObjectURL(blob);
          setQrCode(qrUrl);
        } else if (response.status === 400) {
          // Sessão já está conectada, não precisa de QR Code
          try {
            const errorData = await response.json();
            if (errorData.status === 'WORKING') {
              setQrCode(null);
              stopQRCodePolling();
              // Forçar verificação imediata do status
              setTimeout(() => checkSessionStatus(), 500);
            }
          } catch {
            // Se não conseguir ler o JSON, verificar status diretamente
            setTimeout(() => checkSessionStatus(), 500);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar QR Code:', error);
        // Em caso de erro, verificar se a sessão foi conectada
        setTimeout(() => checkSessionStatus(), 1000);
      }
    };

    fetchQRCode();
    qrIntervalRef.current = setInterval(fetchQRCode, 10000); // A cada 10 segundos
  };

  // Parar monitoramento do QR Code
  const stopQRCodePolling = () => {
    if (qrIntervalRef.current) {
      clearInterval(qrIntervalRef.current);
      qrIntervalRef.current = null;
    }
    setQrCode(null);
  };

  // Iniciar sessão WhatsApp
  const startWhatsAppSession = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Primeiro verificar se a sessão já existe e seu status
      let currentSession = null;
      try {
        currentSession = await makeWAHARequest(`/api/sessions/${wahaConfig.session}`);
      } catch (error) {
        // Sessão não existe, vamos criar
        currentSession = null;
      }

      // Se a sessão já estiver funcionando, não precisa fazer nada
      if (currentSession && currentSession.status === 'WORKING') {
        setSessionStatus(currentSession);
        startStatusMonitoring();
        toast({
          title: "Já conectado!",
          description: "WhatsApp já está conectado e funcionando",
        });
        return;
      }

      // Se não existir, criar a sessão
      if (!currentSession) {
        await makeWAHARequest(`/api/sessions`, {
          method: 'POST',
          body: JSON.stringify({
            name: wahaConfig.session,
            config: {
              webhooks: []
            }
          }),
        });
      }

      // Iniciar a sessão apenas se não estiver funcionando
      if (!currentSession || currentSession.status !== 'WORKING') {
        await makeWAHARequest(`/api/sessions/${wahaConfig.session}/start`, {
          method: 'POST',
        });
      }

      // Começar monitoramento
      startStatusMonitoring();
      
      toast({
        title: "Iniciando...",
        description: "Sessão WhatsApp iniciada. Aguarde o QR Code...",
      });
      
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Erro ao iniciar sessão');
      toast({
        title: "Erro",
        description: "Erro ao iniciar sessão WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Parar sessão WhatsApp
  const stopWhatsAppSession = async () => {
    try {
      await makeWAHARequest(`/api/sessions/${wahaConfig.session}/stop`, {
        method: 'POST',
      });
      
      setSessionStatus(null);
      stopQRCodePolling();
      stopStatusMonitoring();
      
      toast({
        title: "Desconectado",
        description: "Sessão WhatsApp finalizada",
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao parar sessão",
        variant: "destructive",
      });
    }
  };

  // Monitoramento contínuo do status
  const startStatusMonitoring = () => {
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    
    // Intervalo mais rápido se estiver esperando QR Code
    const interval = sessionStatus?.status === 'SCAN_QR_CODE' ? 2000 : 5000;
    
    statusIntervalRef.current = setInterval(() => {
      checkSessionStatus();
    }, interval); // 2s durante QR Code, 5s normalmente
  };

  const stopStatusMonitoring = () => {
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  };

  // Carregar conversas/chats
  const loadChats = async () => {
    try {
      console.log('[loadChats] Carregando conversas...');
      
      // Usar endpoint /chats/overview que é mais otimizado
      const response = await makeWAHARequest(`/api/${wahaConfig.session}/chats/overview?limit=100`);
      
      console.log('[loadChats] Conversas recebidas:', response?.length || 0);
      
      // Transformar para o formato esperado e ordenar
      const chatsData = (response || []).map(chat => ({
        id: {
          _serialized: chat.id
        },
        name: chat.name || chat.id.split('@')[0],
        isGroup: chat.id.includes('@g.us'),
        unreadCount: chat._chat?.unreadCount || 0,
        timestamp: chat.lastMessage?.timestamp || 0,
        lastMessage: chat.lastMessage
      }));
      
      // Ordenar chats: não lidos primeiro, depois por timestamp
      const sortedChats = chatsData.sort((a, b) => {
        // Primeiro, ordenar por mensagens não lidas
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
        // Se ambos têm ou não têm mensagens não lidas, ordenar por timestamp
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
      
      setChats(sortedChats);
      console.log('[loadChats] Conversas processadas:', sortedChats.length);
      
      // Log das conversas com mensagens não lidas
      const unreadChats = sortedChats.filter(chat => chat.unreadCount > 0);
      if (unreadChats.length > 0) {
        console.log('[loadChats] Conversas com mensagens não lidas:', unreadChats.map(c => ({
          name: c.name,
          unreadCount: c.unreadCount
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      setChats([]);
    }
  };

  // Carregar contatos
  const loadContacts = async () => {
    try {
      const response = await makeWAHARequest(`/api/${wahaConfig.session}/contacts`);
      setContacts(response || []);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      setContacts([]);
    }
  };

  // Obter foto de perfil de um contato
  const getContactProfilePicture = async (contactId: string): Promise<string | null> => {
    try {
      // Verificar se já temos em cache
      if (profilePictures[contactId]) {
        return profilePictures[contactId];
      }

      console.log(`[getContactProfilePicture] Buscando foto para: ${contactId}`);
      
      const response = await makeWAHARequest(
        `/api/contacts/profile-picture?session=${wahaConfig.session}&contactId=${contactId}`
      );
      
      if (response?.profilePictureURL) {
        // Armazenar no cache
        setProfilePictures(prev => ({
          ...prev,
          [contactId]: response.profilePictureURL
        }));
        
        console.log(`[getContactProfilePicture] Foto encontrada para ${contactId}: ${response.profilePictureURL}`);
        return response.profilePictureURL;
      }
      
      return null;
    } catch (error) {
      console.error(`Erro ao obter foto de perfil para ${contactId}:`, error);
      return null;
    }
  };

  // Carregar mensagens de um chat específico
  const loadChatMessages = async (chatId: string) => {
    try {
      console.log(`[loadChatMessages] Carregando mensagens para chat: ${chatId}`);
      
      // Calcular timestamp das últimas 24 horas para buscar mensagens recentes
      const now = Math.floor(Date.now() / 1000);
      const twentyFourHoursAgo = now - (24 * 60 * 60);
      
      // Usar filtros de timestamp para buscar mensagens recentes primeiro
      // downloadMedia=true para obter URLs de mídia (áudio, imagem, etc.)
      const recentMessagesUrl = `/api/${wahaConfig.session}/chats/${chatId}/messages?limit=100&filter.timestamp.gte=${twentyFourHoursAgo}&downloadMedia=true`;
      console.log(`[loadChatMessages] Buscando mensagens recentes (últimas 24h): ${recentMessagesUrl}`);
      
      let response = await makeWAHARequest(recentMessagesUrl);
      
      // Se não houver mensagens recentes, buscar as últimas 50 mensagens sem filtro
      if (!response || response.length === 0) {
        console.log(`[loadChatMessages] Nenhuma mensagem recente encontrada, buscando últimas 50 mensagens`);
        response = await makeWAHARequest(`/api/${wahaConfig.session}/chats/${chatId}/messages?limit=50&downloadMedia=true`);
      }
      
      // Ordenar mensagens por timestamp (mais recentes primeiro, depois reverter para ordem cronológica)
      const sortedMessages = (response || []).sort((a, b) => a.timestamp - b.timestamp);
      
      console.log(`[loadChatMessages] ${sortedMessages.length} mensagens carregadas para ${chatId}`);
      setChatMessages(sortedMessages);
      
      // Auto-scroll para a última mensagem
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Erro ao carregar mensagens do chat:', error);
      setChatMessages([]);
    }
  };

  // Scroll automático para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enviar mensagem no chat atual
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return;

    setIsSending(true);
    try {
      await makeWAHARequest(`/api/sendText`, {
        method: 'POST',
        body: JSON.stringify({
          session: wahaConfig.session,
          chatId: selectedChat,
          text: newMessage.trim()
        }),
      });

      setNewMessage('');
      // Recarregar mensagens imediatamente após enviar
      loadChatMessages(selectedChat);
      
      toast({
        title: "Enviado!",
        description: "Mensagem enviada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao enviar mensagem',
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Enviar mensagem WhatsApp
  const sendWhatsAppMessage = async (phone: string, content: string) => {
    try {
      const chatId = phone.includes('@') ? phone : `${phone.replace(/\D/g, '')}@c.us`;
      
      const response = await makeWAHARequest('/api/sendText', {
        method: 'POST',
        body: JSON.stringify({
          session: wahaConfig.session,
          chatId: chatId,
          text: content,
        }),
      });

      return response;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  };

  // Salvar configurações
  const handleSaveConfig = () => {
    if (!wahaConfig.url || !wahaConfig.session) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos a URL e Session",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem(`whatsapp_config_${user?.schoolId}`, JSON.stringify(wahaConfig));
    
    toast({
      title: "Salvo!",
      description: "Configurações salvas com sucesso",
    });
  };

  // Envio manual
  const handleManualSend = async () => {
    if (!phoneNumber || !message) {
      toast({
        title: "Erro",
        description: "Preencha o número e a mensagem",
        variant: "destructive",
      });
      return;
    }

    if (sessionStatus?.status !== 'WORKING') {
      toast({
        title: "Erro",
        description: "WhatsApp não está conectado",
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

  // Função para baixar QR Code
  const downloadQRCode = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = 'whatsapp-qr-code.png';
      link.click();
    }
  };

  // Forçar atualização imediata do status
  const forceStatusUpdate = async () => {
    toast({
      title: "🔄 Verificando...",
      description: "Atualizando status da conexão WhatsApp",
    });
    
    try {
      await checkSessionStatus();
      // Restart monitoring com intervalo atualizado
      startStatusMonitoring();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar status",
        variant: "destructive",
      });
    }
  };

  // Filtrar conversas (ocultar grupos e busca por nome)
  const getFilteredChats = () => {
    let filteredChats = chats;
    
    // Filtrar por tipo (grupos/individuais)
    if (hideGroups) {
      filteredChats = filteredChats.filter(chat => !chat.isGroup);
    }
    
    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredChats = filteredChats.filter(chat => 
        (chat.name || chat.id.user || '').toLowerCase().includes(searchLower) ||
        chat.id._serialized.includes(searchLower)
      );
    }
    
    return filteredChats;
  };

  // Toggle para ocultar/mostrar grupos
  const toggleHideGroups = () => {
    setHideGroups(!hideGroups);
    toast({
      title: hideGroups ? "👥 Grupos mostrados" : "👤 Grupos ocultados",
      description: hideGroups ? "Agora mostrando conversas em grupo" : "Mostrando apenas conversas individuais",
    });
  };

  // Marcar conversa como lida
  const markChatAsRead = async (chatId: string) => {
    try {
      console.log(`[markChatAsRead] Marcando conversa ${chatId} como lida...`);
      
      // Primeiro atualizar localmente para feedback imediato
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id._serialized === chatId 
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      );

      // Depois fazer a chamada para a API usando o endpoint correto
      const response = await makeWAHARequest(`/api/${wahaConfig.session}/chats/${chatId}/messages/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      console.log(`[markChatAsRead] Resposta da API:`, response);
      
      // Recarregar após sucesso para sincronizar com servidor
      setTimeout(() => loadChats(), 1000);
    } catch (error) {
      console.error('Erro ao marcar conversa como lida:', error);
      // Em caso de erro, reverter mudança local
      setTimeout(() => loadChats(), 500);
    }
  };

  // Status da conexão
  const getConnectionStatus = () => {
    if (!sessionStatus) {
      return {
        color: 'bg-gray-500',
        text: 'Desconhecido',
        icon: AlertCircle,
        pulsating: false
      };
    }

    switch (sessionStatus.status) {
      case 'WORKING':
        return {
          color: 'bg-green-500',
          text: 'Conectado',
          icon: CheckCircle,
          pulsating: true
        };
      case 'SCAN_QR_CODE':
        return {
          color: 'bg-yellow-500',
          text: 'Aguardando QR',
          icon: QrCode,
          pulsating: true
        };
      case 'STARTING':
        return {
          color: 'bg-blue-500',
          text: 'Iniciando',
          icon: Loader2,
          pulsating: true
        };
      case 'STOPPED':
        return {
          color: 'bg-red-500',
          text: 'Parado',
          icon: XCircle,
          pulsating: false
        };
      case 'FAILED':
        return {
          color: 'bg-red-600',
          text: 'Falhou',
          icon: XCircle,
          pulsating: false
        };
      default:
        return {
          color: 'bg-gray-500',
          text: sessionStatus.status,
          icon: AlertCircle,
          pulsating: false
        };
    }
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  // Animações
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

  // Renderizar conteúdo de mídia
  const renderMediaContent = (media: any) => {
    if (!media?.mimetype || !media?.url) {
      return (
        <div className="flex items-center space-x-2 text-slate-400">
          <FileText className="w-4 h-4" />
          <span className="text-xs">Mídia não disponível</span>
        </div>
      );
    }

    const isAudio = media.mimetype.startsWith('audio/');
    const isImage = media.mimetype.startsWith('image/');
    const isVideo = media.mimetype.startsWith('video/');
    const isDocument = media.mimetype.includes('pdf') || 
                      media.mimetype.includes('document') || 
                      media.mimetype.includes('text/');

    if (isAudio) {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-slate-300">
            <Volume2 className="w-4 h-4" />
            <span className="text-xs font-medium">Mensagem de Áudio</span>
          </div>
          <audio 
            controls 
            className="w-full max-w-xs"
            style={{ height: '32px' }}
            preload="metadata"
          >
            <source src={media.url} type={media.mimetype} />
            <span className="text-xs text-slate-400">
              Seu navegador não suporta o elemento de áudio.
            </span>
          </audio>
          {media.filename && (
            <div className="text-xs text-slate-400 truncate">
              {media.filename}
            </div>
          )}
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-slate-300">
            <ImageIcon className="w-4 h-4" />
            <span className="text-xs font-medium">Imagem</span>
          </div>
          <img 
            src={media.url} 
            alt="Imagem compartilhada"
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.open(media.url, '_blank')}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              const nextDiv = target.nextElementSibling as HTMLDivElement | null;
              target.style.display = 'none';
              if (nextDiv) {
                (nextDiv as HTMLDivElement).style.display = 'block';
              }
            }}
          />
          <div style={{ display: 'none' }} className="text-xs text-slate-400">
            Erro ao carregar imagem. <a href={media.url} target="_blank" rel="noopener noreferrer" className="underline">Abrir link</a>
          </div>
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-slate-300">
            <Play className="w-4 h-4" />
            <span className="text-xs font-medium">Vídeo</span>
          </div>
          <video 
            controls 
            className="max-w-xs rounded-lg"
            preload="metadata"
          >
            <source src={media.url} type={media.mimetype} />
            <span className="text-xs text-slate-400">
              Seu navegador não suporta o elemento de vídeo.
            </span>
          </video>
        </div>
      );
    }

    if (isDocument) {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-slate-300">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-medium">Documento</span>
          </div>
          <a 
            href={media.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm underline">
              {media.filename || 'Baixar documento'}
            </span>
          </a>
        </div>
      );
    }

    // Fallback para outros tipos de mídia
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-slate-300">
          <FileText className="w-4 h-4" />
          <span className="text-xs font-medium">Arquivo ({media.mimetype})</span>
        </div>
        <a 
          href={media.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm underline">
            {media.filename || 'Baixar arquivo'}
          </span>
        </a>
      </div>
    );
  };

  // Componente Avatar com foto de perfil
  const ChatAvatar = ({ chat, size = 40, className = "" }: { 
    chat: any; 
    size?: number; 
    className?: string; 
  }) => {
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      if (!chat.isGroup && sessionStatus?.status === 'WORKING') {
        // Tentar obter foto de perfil apenas para contatos individuais
        getContactProfilePicture(chat.id._serialized)
          .then(url => setProfilePicUrl(url))
          .catch(() => setProfilePicUrl(null));
      }
    }, [chat.id._serialized, chat.isGroup, sessionStatus?.status]);

    const hasUnread = chat.unreadCount > 0;

    if (!imageError && profilePicUrl && !chat.isGroup) {
      return (
        <div className={`relative ${className}`}>
          <img
            src={profilePicUrl}
            alt={chat.name}
            className={`rounded-full object-cover`}
            style={{ width: size, height: size }}
            onError={() => {
              setImageError(true);
              console.log(`[ChatAvatar] Erro ao carregar imagem para ${chat.name}`);
            }}
            onLoad={() => {
              console.log(`[ChatAvatar] Imagem carregada com sucesso para ${chat.name}`);
            }}
          />
          {/* Badge de contagem no avatar com foto */}
          {hasUnread && (
            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            </div>
          )}
        </div>
      );
    }

    // Fallback para ícones quando não há foto ou é grupo
    return (
      <div className={`relative ${className}`}>
        {chat.isGroup ? (
          <div className={`rounded-full flex items-center justify-center ${
            hasUnread ? 'bg-green-600' : 'bg-green-500'
          }`} style={{ width: size, height: size }}>
            <Users className="text-white" size={size * 0.4} />
          </div>
        ) : (
          <div className={`rounded-full flex items-center justify-center ${
            hasUnread ? 'bg-blue-600' : 'bg-blue-500'
          }`} style={{ width: size, height: size }}>
            <User className="text-white" size={size * 0.4} />
          </div>
        )}
        
        {/* Badge de contagem no avatar com ícone */}
        {hasUnread && (
          <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      className={`space-y-${isMobile ? '4' : '6'}`}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header com Status */}
      <motion.div variants={item}>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="text-green-400" size={24} />
                <div>
                  <h2 className="text-xl font-semibold text-white">WhatsApp Integration</h2>
                  <p className="text-slate-400 text-sm">Conecte e gerencie seu WhatsApp Business</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className={status.color}>
                  <StatusIcon className="mr-1" size={14} />
                  {status.text}
                </Badge>
                
                <Button
                  onClick={forceStatusUpdate}
                  variant="outline"
                  size="sm"
                  className="border-slate-600"
                >
                  <RefreshCw className="mr-1" size={14} />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs Principais */}
      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="connection" className="data-[state=active]:bg-slate-700">
              <Wifi className="mr-2" size={16} />
              {isMobile ? 'Conexão' : 'Conexão'}
            </TabsTrigger>
            <TabsTrigger value="conversations" className="data-[state=active]:bg-slate-700">
              <MessageSquare className="mr-2" size={16} />
              {isMobile ? 'Conversas' : 'Conversas'}
            </TabsTrigger>
            <TabsTrigger value="ai-automation" className="data-[state=active]:bg-slate-700">
              <Bot className="mr-2" size={16} />
              {isMobile ? 'IA' : 'IA Auto'}
            </TabsTrigger>
            <TabsTrigger value="manual-send" className="data-[state=active]:bg-slate-700">
              <Send className="mr-2" size={16} />
              {isMobile ? 'Manual' : 'Envio'}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Conexão */}
          <TabsContent value="connection">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configurações */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Settings className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-white">Configurações</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">URL do WAHA</Label>
                      <Input
                        value={wahaConfig.url}
                        onChange={(e) => setWahaConfig({...wahaConfig, url: e.target.value})}
                        placeholder="http://localhost:3000"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Session Name</Label>
                      <Input
                        value={wahaConfig.session}
                        onChange={(e) => setWahaConfig({...wahaConfig, session: e.target.value})}
                        placeholder="default"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">API Key (opcional)</Label>
                      <Input
                        type="password"
                        value={wahaConfig.apiKey}
                        onChange={(e) => setWahaConfig({...wahaConfig, apiKey: e.target.value})}
                        placeholder="Deixe vazio se não usar"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">OpenAI API Key</Label>
                      <Input
                        type="password"
                        value={wahaConfig.chatgptKey}
                        onChange={(e) => setWahaConfig({...wahaConfig, chatgptKey: e.target.value})}
                        placeholder="sk-..."
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <Button
                      onClick={handleSaveConfig}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      <Settings className="mr-2" size={16} />
                      Salvar Configurações
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Conexão e QR Code */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <QrCode className="text-green-400" size={20} />
                    <h3 className="text-lg font-semibold text-white">Conexão WhatsApp</h3>
                  </div>
                  
                  {/* Status da Conexão */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={status.color.includes('green') ? 'text-green-400' : 
                                              status.color.includes('yellow') ? 'text-yellow-400' : 
                                              status.color.includes('blue') ? 'text-blue-400' : 'text-red-400'} size={18} />
                        <span className="text-white font-medium">{status.text}</span>
                      </div>
                      
                      {sessionStatus?.status === 'WORKING' ? (
                        <Button
                          onClick={stopWhatsAppSession}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <StopCircle className="mr-1" size={14} />
                          Desconectar
                        </Button>
                      ) : (
                        <Button
                          onClick={startWhatsAppSession}
                          disabled={isConnecting}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                          size="sm"
                        >
                          {isConnecting ? (
                            <RefreshCw className="mr-1 animate-spin" size={14} />
                          ) : (
                            <PlayCircle className="mr-1" size={14} />
                          )}
                          {isConnecting ? 'Conectando...' : 'Conectar'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Erro de Conexão */}
                  {connectionError && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="text-red-400" size={16} />
                        <span className="text-red-300 text-sm">{connectionError}</span>
                      </div>
                    </div>
                  )}

                  {/* QR Code */}
                  {sessionStatus?.status === 'SCAN_QR_CODE' && (
                    <div className="text-center">
                      <p className="text-slate-300 mb-4">Escaneie o QR Code com seu WhatsApp:</p>
                      
                      {qrCode ? (
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg inline-block">
                            <img src={qrCode} alt="QR Code WhatsApp" className="w-48 h-48 mx-auto" />
                          </div>
                          
                          <div className="flex justify-center space-x-2">
                            <Button
                              onClick={downloadQRCode}
                              variant="outline"
                              size="sm"
                              className="border-slate-600"
                            >
                              <Download className="mr-1" size={14} />
                              Baixar QR
                            </Button>
                            
                            <Button
                              onClick={forceStatusUpdate}
                              variant="outline"
                              size="sm"
                              className="border-slate-600"
                            >
                              <RefreshCw className="mr-1" size={14} />
                              Atualizar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <RefreshCw className="animate-spin mx-auto mb-2 text-blue-400" size={24} />
                          <p className="text-slate-400">Carregando QR Code...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* WhatsApp Conectado */}
                  {sessionStatus?.status === 'WORKING' && (
                    <div className="text-center py-8">
                      <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
                      <h4 className="text-white font-medium mb-2">WhatsApp Conectado!</h4>
                      <p className="text-slate-400 text-sm">Seu WhatsApp está pronto para uso</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Conversas */}
          <TabsContent value="conversations">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Conversas */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 lg:col-span-1">
                <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  {/* Header melhorado das conversas */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="text-blue-400" size={24} />
                        <div>
                          <h3 className="text-xl font-semibold text-white">Conversas</h3>
                          <p className="text-xs text-slate-400">
                            {sessionStatus?.status === 'WORKING' 
                              ? 'WhatsApp conectado • Tempo real' 
                              : 'WhatsApp desconectado'}
                          </p>
                        </div>
                      </div>
                      
                      {chats.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 text-blue-300">
                            <span className="text-sm font-medium">
                              {getFilteredChats().length}
                              {hideGroups && getFilteredChats().length !== chats.length && ` de ${chats.length}`}
                            </span>
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Barra de busca */}
                    <div className="mb-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                          type="text"
                          placeholder="Buscar conversas..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-10 bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                        />
                        {searchTerm && (
                          <Button
                            onClick={() => setSearchTerm('')}
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-600/50"
                            title="Limpar busca"
                          >
                            <XCircle className="text-slate-400 hover:text-slate-300" size={12} />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Barra de controles */}
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-slate-400 flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            sessionStatus?.status === 'WORKING' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'
                          }`}></div>
                          <span>
                            {sessionStatus?.status === 'WORKING' 
                              ? `${getFilteredChats().length} conversa${getFilteredChats().length !== 1 ? 's' : ''} ${searchTerm ? 'encontrada' + (getFilteredChats().length !== 1 ? 's' : '') : 'ativa' + (getFilteredChats().length !== 1 ? 's' : '')}`
                              : 'Aguardando conexão'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Botão de filtro melhorado */}
                        <div className="flex bg-slate-700/50 rounded-lg border border-slate-600/30 overflow-hidden">
                          <Button
                            onClick={toggleHideGroups}
                            variant="ghost"
                            size="sm"
                            className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 rounded-none ${
                              hideGroups 
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                                : "text-slate-300 hover:text-white hover:bg-slate-600/50"
                            }`}
                            title={hideGroups ? "Mostrando apenas conversas individuais" : "Mostrando todas as conversas"}
                          >
                            <User className="mr-1.5" size={12} />
                            Individual
                          </Button>
                          <Button
                            onClick={toggleHideGroups}
                            variant="ghost"
                            size="sm"
                            className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 rounded-none ${
                              !hideGroups 
                                ? "bg-green-600 hover:bg-green-700 text-white shadow-sm" 
                                : "text-slate-300 hover:text-white hover:bg-slate-600/50"
                            }`}
                            title={!hideGroups ? "Mostrando todas as conversas" : "Mostrar todas as conversas"}
                          >
                            <Users className="mr-1.5" size={12} />
                            Todos
                          </Button>
                        </div>
                        
                        {/* Botão de atualizar melhorado */}
                        <Button
                          onClick={loadChats}
                          variant="outline"
                          size="sm"
                          className="border-slate-600/50 hover:border-slate-500 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
                          title="Atualizar lista de conversas"
                        >
                          <RefreshCw className="mr-1.5" size={12} />
                          <span className="text-xs font-medium">Atualizar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {sessionStatus?.status === 'WORKING' ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {getFilteredChats().length > 0 ? (
                        getFilteredChats().map((chat) => {
                          const hasUnread = chat.unreadCount > 0;
                          const isSelected = selectedChat === chat.id._serialized;
                          
                          return (
                            <div
                              key={chat.id._serialized}
                              onClick={() => {
                                setSelectedChat(chat.id._serialized);
                                loadChatMessages(chat.id._serialized);
                                markChatAsRead(chat.id._serialized);
                              }}
                              className={`relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-blue-600/30 border border-blue-500/50' 
                                  : hasUnread
                                    ? 'bg-green-600/10 border border-green-500/30 hover:bg-green-600/20'
                                    : 'bg-slate-700/30 hover:bg-slate-600/30'
                              } ${hasUnread ? 'ring-1 ring-green-500/20' : ''}`}
                            >
                              {/* Indicador de mensagem não lida */}
                              {hasUnread && !isSelected && (
                                <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              )}
                              
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 relative">
                                  <ChatAvatar chat={chat} size={32} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`font-medium truncate ${
                                      hasUnread ? 'text-white' : 'text-slate-200'
                                    }`}>
                                      {chat.name || chat.id.user}
                                    </p>
                                    
                                    {/* Timestamp da última mensagem */}
                                    {chat.timestamp && (
                                      <span className={`text-xs ${
                                        hasUnread ? 'text-green-400' : 'text-slate-500'
                                      }`}>
                                        {new Date(chat.timestamp * 1000).toLocaleTimeString('pt-BR', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between mt-1">
                                    <p className={`text-sm truncate ${
                                      hasUnread ? 'text-slate-300' : 'text-slate-400'
                                    }`}>
                                      {chat.isGroup ? 'Grupo' : 'Contato individual'}
                                    </p>
                                    
                                    {/* Indicador de status adicional */}
                                    {hasUnread && (
                                      <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-xs text-green-400 font-medium">
                                          {chat.unreadCount} nova{chat.unreadCount > 1 ? 's' : ''}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="mx-auto mb-2 text-slate-400" size={32} />
                          <p className="text-slate-400 text-sm">
                            {hideGroups && chats.length > 0 
                              ? "Nenhuma conversa individual encontrada" 
                              : "Nenhuma conversa encontrada"
                            }
                          </p>
                          {hideGroups && chats.length > 0 && (
                            <p className="text-slate-500 text-xs mt-1">
                              ({chats.length} grupo{chats.length !== 1 ? 's' : ''} oculto{chats.length !== 1 ? 's' : ''})
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <WifiOff className="mx-auto mb-2 text-slate-400" size={32} />
                      <p className="text-slate-400 text-sm">WhatsApp desconectado</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Mensagens da Conversa Selecionada */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 lg:col-span-2">
                {selectedChat ? (
                  <div className="flex flex-col h-[600px]">
                    {/* Header da conversa */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                          <ChatAvatar chat={getFilteredChats().find(c => c.id._serialized === selectedChat) || chats[0]} size={32} />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">
                            {getFilteredChats().find(c => c.id._serialized === selectedChat)?.name || 'Conversa'}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {getFilteredChats().find(c => c.id._serialized === selectedChat)?.isGroup ? 'Grupo' : 'Contato'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => loadChatMessages(selectedChat)}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Área de mensagens com scroll */}
                    <div 
                      className="flex-1 overflow-y-auto p-4 space-y-3"
                      style={{ maxHeight: 'calc(600px - 140px)' }}
                    >
                      {chatMessages.length > 0 ? (
                        chatMessages.map((message, index) => (
                          <div
                            key={message.id || index}
                            className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.fromMe
                                  ? 'bg-green-600 text-white rounded-br-none'
                                  : 'bg-slate-700 text-white rounded-bl-none'
                              }`}
                            >
                              <div className="text-sm">
                                {/* Texto da mensagem */}
                                {message.body && (
                                  <div className="whitespace-pre-wrap mb-2">
                                    {message.body}
                                  </div>
                                )}
                                
                                {/* Mídia */}
                                {message.hasMedia && message.media && (
                                  <div className="mt-2">
                                    {renderMediaContent(message.media)}
                                  </div>
                                )}
                                
                                {/* Fallback para tipos de mensagem não texto sem mídia */}
                                {!message.body && !message.hasMedia && (
                                  <div className="flex items-center space-x-2 text-slate-400">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-xs">[Mensagem {message.type || 'desconhecida'}]</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-end space-x-1 mt-1">
                                <p className="text-xs opacity-70">
                                  {new Date(message.timestamp * 1000).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                {message.fromMe && (
                                  <div className="text-xs opacity-70">
                                    {message.ack === 1 && '✓'}
                                    {message.ack === 2 && '✓✓'}
                                    {message.ack === 3 && <span className="text-blue-400">✓✓</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <MessageSquare className="mx-auto mb-2 text-slate-500" size={48} />
                            <p className="text-slate-400">Nenhuma mensagem encontrada</p>
                            <Button
                              onClick={() => loadChatMessages(selectedChat)}
                              size="sm"
                              variant="outline"
                              className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              Carregar mensagens
                            </Button>
                          </div>
                        </div>
                      )}
                      {/* Div para scroll automático */}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Campo de digitação - sempre na parte inferior */}
                    <div className="p-4 border-t border-slate-700">
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          placeholder="Digite sua mensagem..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isSending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`${isMobile ? 'p-4' : 'p-6'} text-center py-12`}>
                    <MessageSquare className="mx-auto mb-4 text-slate-400" size={48} />
                    <h4 className="text-white font-medium mb-2">Selecione uma conversa</h4>
                    <p className="text-slate-400 text-sm">
                      Escolha uma conversa da lista para ver as mensagens
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Tab: IA Automática */}
          <TabsContent value="ai-automation">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Bot className="mr-2 text-blue-400" />
                    IA Automática
                  </h3>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    Em Desenvolvimento
                  </Badge>
                </div>

                <div className="text-center py-12">
                  <Bot className="mx-auto mb-4 text-slate-400" size={48} />
                  <h4 className="text-white font-medium mb-2">IA Automática</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    Sistema de IA para atendimento automático será implementado em breve.
                    Incluirá qualificação de leads e transferência para vendedores.
                  </p>
                  <div className="text-left max-w-md mx-auto space-y-2 text-sm text-slate-300">
                    <p>✅ Respostas automáticas inteligentes</p>
                    <p>✅ Qualificação de leads com BANT</p>
                    <p>✅ Transferência para vendedores</p>
                    <p>✅ Integração com base de conhecimento</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Envio Manual */}
          <TabsContent value="manual-send">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <h3 className="text-xl font-semibold text-white mb-6">Envio Manual</h3>
                
                {sessionStatus?.status === 'WORKING' ? (
                  <div className="max-w-md mx-auto space-y-4">
                    <div>
                      <Label className="text-slate-300">Número do WhatsApp</Label>
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+55 11 99999-9999"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Use o formato: +55 11 99999-9999 ou apenas 11999999999
                      </p>
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
                      disabled={!phoneNumber || !message}
                    >
                      <Send className="mr-2" size={18} />
                      Enviar Mensagem
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <WifiOff className="mx-auto mb-4 text-slate-400" size={48} />
                    <h4 className="text-white font-medium mb-2">WhatsApp Desconectado</h4>
                    <p className="text-slate-400 text-sm">Conecte o WhatsApp primeiro para enviar mensagens</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};
