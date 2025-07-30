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
  Search,
  Pause
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDatabaseAuth } from '@/contexts/DatabaseAuthContext';
import { motion } from 'framer-motion';
import React from 'react'; // Added missing import for React

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
  const { user, getLeadsBySchool, getSellersBySchool } = useDatabaseAuth();
  const { toast } = useToast();
  const qrIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Estados principais
  const [activeTab, setActiveTab] = useState('conversations');
  const [wahaConfig, setWahaConfig] = useState({
    url: '/api/whatsapp', // Usar proxy do Next.js
    apiKey: process.env.NEXT_PUBLIC_WAHA_API_KEY || 'waha-key-2025',
    session: process.env.NEXT_PUBLIC_WAHA_SESSION || 'default',
    chatgptKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  });
  const [sessionStatus, setSessionStatus] = useState<WAHASession | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hideGroups, setHideGroups] = useState(false);
  const [profilePictures, setProfilePictures] = useState<Record<string, string>>({});
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  
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
  
  // Ref para scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Carregar dados
  const schoolLeads = user ? getLeadsBySchool(user.schoolId) : [];
  const sellers = user ? getSellersBySchool(user.schoolId) : [];

  // Sistema de gerenciamento de áudio global simplificado
  const audioManagerRef = useRef<{
    currentAudio: HTMLAudioElement | null;
    currentUrl: string | null;
    isPlaying: boolean;
  }>({
    currentAudio: null,
    currentUrl: null,
    isPlaying: false
  });

  // Cache para URLs processadas para evitar recálculos
  const urlCacheRef = useRef<Map<string, string>>(new Map());

  // Sistema de áudio simplificado - funções removidas para evitar conflitos

  // Função para processar URL de mídia (com cache)
  const processMediaUrl = (originalUrl: string, wahaUrl: string): string => {
    // Verificar cache primeiro
    const cacheKey = `${originalUrl}_${wahaUrl}`;
    if (urlCacheRef.current.has(cacheKey)) {
      return urlCacheRef.current.get(cacheKey)!;
    }

    if (!originalUrl) return '';

    let finalUrl = originalUrl;
    
    // Se ainda tem /api/files/ mas não é URL absoluta, corrigir
    if (finalUrl.includes('/api/files/') && !finalUrl.startsWith('http')) {
      // Converter /api/files/default/filename para URL direta do WAHA
      const filename = finalUrl.split('/api/files/')[1];
      finalUrl = `${wahaUrl.replace(/\/$/, '')}/api/files/${filename}`;
    } else if (!finalUrl.startsWith('http')) {
      // Se não for URL absoluta, adicionar base do WAHA
      finalUrl = `${wahaUrl.replace(/\/$/, '')}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
    }
    
    // Armazenar no cache
    urlCacheRef.current.set(cacheKey, finalUrl);
    
    console.log(`[MediaURL] URL original: ${originalUrl} -> URL final: ${finalUrl}`);
    
    return finalUrl;
  };

  // Sistema de áudio simplificado - verificação de arquivo removida para evitar latência

  // Sistema de áudio simplificado - removido funções que causavam conflito

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
      // LIMPAR TODAS as configurações antigas do localStorage
      localStorage.removeItem(`whatsapp_config_${user.schoolId}`);
      localStorage.removeItem(`whatsapp_config_${user.schoolId}_backup`);
      localStorage.removeItem(`whatsapp_config`);
      localStorage.removeItem(`waha_config`);
      
      // Forçar uso das variáveis de ambiente
      const newConfig = {
        url: '/api/whatsapp', // Usar proxy do Next.js
        apiKey: process.env.NEXT_PUBLIC_WAHA_API_KEY || 'waha-key-2025',
        session: process.env.NEXT_PUBLIC_WAHA_SESSION || 'default',
        chatgptKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
      };
      
      console.log('🔧 Configuração WAHA carregada:', newConfig);
      setWahaConfig(newConfig);
      
      // Verificar status da sessão automaticamente
      checkSessionStatus(newConfig);
      // Iniciar monitoramento
      setTimeout(() => startStatusMonitoring(), 1000);

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

  // Auto-refresh das mensagens quando uma conversa está selecionada (DESABILITADO)
  useEffect(() => {
    if (selectedChat && sessionStatus?.status === 'WORKING') {
      // DESABILITADO: Auto-refresh estava causando re-renderização das imagens
      // const startMessagesRefresh = () => {
      //   if (messagesRefreshRef.current) clearInterval(messagesRefreshRef.current);
      //   messagesRefreshRef.current = setInterval(() => {
      //     console.log('[Auto-refresh] Atualizando mensagens...');
      //     loadChatMessages(selectedChat);
      //   }, 5000);
      // };
      
      // startMessagesRefresh();
      
      // return () => {
      //   if (messagesRefreshRef.current) {
      //     clearInterval(messagesRefreshRef.current);
      //     messagesRefreshRef.current = null;
      //   }
      // };
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
          ...(wahaConfig.apiKey && { 'X-API-Key': wahaConfig.apiKey }),
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

  // Verificar status da sessão com detecção melhorada e recuperação automática
  const checkSessionStatus = async (config = wahaConfig) => {
    try {
      console.log('🔍 Verificando status da sessão...', `${config.url}/sessions/${config.session}`);
      const response = await makeWAHARequest(`/sessions/${config.session}`);
      console.log('📊 Status da sessão:', response);
      const previousStatus = sessionStatus?.status;
      const currentTime = new Date().toLocaleTimeString();
      
      setSessionStatus(response);
      setConnectionError(null);
      
      // Detecção melhorada de mudanças de status
      if (previousStatus !== response.status) {
        console.log(`🔄 [${currentTime}] Status mudou de "${previousStatus}" para "${response.status}"`);
        
        // Conectado com sucesso
        if (response.status === 'WORKING') {
          const userName = response.me?.pushName || response.me?.user || 'usuário';
          console.log(`✅ [${currentTime}] WhatsApp conectado como: ${userName}`);
          toast({
            title: "✅ WhatsApp Conectado!",
            description: `Conectado como ${userName}`,
            duration: 5000,
          });
          stopQRCodePolling();
          loadChats();
          loadContacts();
          
          // Ajustar intervalo de monitoramento para conectado
          startStatusMonitoring();
          return;
        }
        
        // Autenticado mas ainda não pronto
        if (response.status === 'AUTHENTICATED' || response.status === 'READY') {
          console.log(`🔄 [${currentTime}] Sessão autenticada, aguardando finalização...`);
          // Acelerar o monitoramento durante a transição
          setTimeout(() => checkSessionStatus(config), 1000);
          return;
        }
        
        // Desconectado ou erro
        if (previousStatus === 'WORKING' && ['SCAN_QR_CODE', 'STOPPED', 'FAILED'].includes(response.status)) {
          console.log(`⚠️ [${currentTime}] Conexão perdida! Tentando reconectar...`);
          toast({
            title: "⚠️ WhatsApp Desconectado",
            description: "Conexão perdida. Tentando reconectar automaticamente...",
            variant: "destructive",
          });
          
          // Tentar reconectar automaticamente após 3 segundos
          setTimeout(() => {
            console.log(`🔄 [${currentTime}] Iniciando reconexão automática...`);
            startWhatsAppSession();
          }, 3000);
        }
        
        // Mudou para aguardar QR Code
        if (response.status === 'SCAN_QR_CODE') {
          console.log(`📱 [${currentTime}] Novo QR Code disponível`);
          if (previousStatus && previousStatus !== 'SCAN_QR_CODE') {
            toast({
              title: "📱 Novo QR Code",
              description: "Escaneie o QR Code para conectar",
              duration: 3000,
            });
          }
        }
        
        // Ajustar intervalo de monitoramento baseado no status
        startStatusMonitoring();
      }
      
      // Se estiver esperando QR Code, começar a buscar
      if (response.status === 'SCAN_QR_CODE') {
        startQRCodePolling();
      } else if (response.status !== 'WORKING') {
        stopQRCodePolling();
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      setConnectionError(error instanceof Error ? error.message : 'Erro ao verificar status');
      setSessionStatus(null);
      
      // Tentar novamente em caso de erro
      setTimeout(() => checkSessionStatus(config), 5000);
    }
  };

  // Iniciar monitoramento do QR Code
  const startQRCodePolling = () => {
    console.log('🚀 Iniciando polling do QR Code...');
    if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
    
    const fetchQRCode = async () => {
      try {
            console.log('📲 Buscando QR Code...', `${wahaConfig.url}/${wahaConfig.session}/auth/qr`);
    // Endpoint correto via proxy: /{session}/auth/qr
    const response = await fetch(`${wahaConfig.url}/${wahaConfig.session}/auth/qr`, {
          headers: {
            'Accept': 'image/png',
            ...(wahaConfig.apiKey && { 'X-API-Key': wahaConfig.apiKey }),
          },
        });
        
        console.log('📲 Resposta QR Code:', response.status, response.statusText);
        
        if (response.ok) {
          const blob = await response.blob();
          const qrUrl = URL.createObjectURL(blob);
          console.log('✅ QR Code obtido com sucesso, blob size:', blob.size);
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
        currentSession = await makeWAHARequest(`/sessions/${wahaConfig.session}`);
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

      // Se a sessão já está aguardando QR, começar polling
      if (currentSession && currentSession.status === 'SCAN_QR_CODE') {
        setSessionStatus(currentSession);
        startStatusMonitoring();
        startQRCodePolling();
        toast({
          title: "Aguardando QR Code",
          description: "Escaneie o QR Code para conectar o WhatsApp",
        });
        return;
      }

      // Se não existir, criar a sessão
      if (!currentSession) {
        try {
          await makeWAHARequest(`/sessions`, {
            method: 'POST',
            body: JSON.stringify({
              name: wahaConfig.session,
              config: {
                webhooks: []
              }
            }),
          });
        } catch (error) {
          // Ignorar se sessão já existe
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
      }

      // Iniciar a sessão apenas se estiver parada
      if (!currentSession || currentSession.status === 'STOPPED' || currentSession.status === 'FAILED') {
        try {
          await makeWAHARequest(`/sessions/${wahaConfig.session}/start`, {
            method: 'POST',
          });
        } catch (error) {
          // Se retornar 422 "already started", ignorar e continuar
          if (error.message.includes('422') && error.message.includes('already started')) {
            console.log('Sessão já estava iniciada, continuando...');
          } else {
            throw error;
          }
        }
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
      await makeWAHARequest(`/sessions/${wahaConfig.session}/stop`, {
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
    
    // Intervalo mais agressivo para detectar mudanças rapidamente
    const currentStatus = sessionStatus?.status;
    // 500ms durante QR Code para detecção ultra-rápida, 2s para estados intermediários, 15s quando conectado
    const interval = currentStatus === 'SCAN_QR_CODE' ? 500 : 
                    currentStatus === 'WORKING' ? 15000 : 
                    ['STARTING', 'AUTHENTICATED', 'READY'].includes(currentStatus) ? 800 : 2000;
    
    console.log(`⏰ Iniciando monitoramento de status: ${interval}ms (status: ${currentStatus})`);
    
    statusIntervalRef.current = setInterval(() => {
      checkSessionStatus();
    }, interval);
    
    // Durante QR Code, fazer verificação adicional a cada 2 segundos para mudanças rápidas
    if (currentStatus === 'SCAN_QR_CODE') {
      const rapidCheckRef = setInterval(() => {
        if (sessionStatus?.status !== 'SCAN_QR_CODE') {
          clearInterval(rapidCheckRef);
          return;
        }
        checkSessionStatus();
      }, 2000);
      
      // Limpar verificação rápida após 2 minutos
      setTimeout(() => clearInterval(rapidCheckRef), 120000);
    }
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
      console.log(`[loadChats] Carregando conversas...`);
      console.log(`[loadChats] URL da requisição: ${wahaConfig.url}/${wahaConfig.session}/chats`);
      
      const response = await makeWAHARequest(`/${wahaConfig.session}/chats`);
      console.log(`[loadChats] Resposta recebida:`, response);
      
      if (Array.isArray(response)) {
        console.log(`[loadChats] ${response.length} conversas carregadas`);
        setChats(response);
      } else {
        console.error(`[loadChats] Resposta não é um array:`, response);
        setChats([]);
      }
    } catch (error) {
      console.error('[loadChats] Erro ao carregar conversas:', error);
      setChats([]);
    }
  };

  // Carregar contatos
  const loadContacts = async () => {
    try {
      // O WAHA não tem endpoint específico para contatos, mas podemos extrair dos chats
      // Vamos usar os chats para obter informações dos contatos
      const chatsResponse = await makeWAHARequest(`/${wahaConfig.session}/chats`);
      
      if (chatsResponse && Array.isArray(chatsResponse)) {
        // Extrair contatos individuais dos chats (excluir grupos)
        const individualContacts = chatsResponse
          .filter(chat => !chat.isGroup)
          .map(chat => {
            // Verificar se chat.id é um objeto ou string
            const chatId = typeof chat.id === 'object' ? chat.id._serialized : chat.id;
            const chatName = chat.name || (chatId ? chatId.split('@')[0] : 'Desconhecido');
            
            return {
              id: chatId,
              name: chatName,
              number: chatId ? chatId.split('@')[0] : '',
              isGroup: false
            };
          });
        
        setContacts(individualContacts);
        console.log(`[loadContacts] ${individualContacts.length} contatos carregados`);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      setContacts([]);
    }
  };

  // Obter foto de perfil de um contato
  const getContactProfilePicture = async (contactId: string): Promise<string | null> => {
    // WAHA não suporta API de foto de perfil, retornar null
    console.log(`[getContactProfilePicture] API de foto de perfil não suportada pelo WAHA para: ${contactId}`);
    return null;
  };

  // Carregar mensagens de um chat específico
  const loadChatMessages = async (chatId: string) => {
    try {
      console.log(`[loadChatMessages] Carregando mensagens para chat: ${chatId}`);
      console.log(`[loadChatMessages] URL da requisição: ${wahaConfig.url}/${wahaConfig.session}/chats/${chatId}/messages?limit=100&downloadMedia=true`);
      
      const response = await makeWAHARequest(`/${wahaConfig.session}/chats/${chatId}/messages?limit=100&downloadMedia=true`);
      console.log(`[loadChatMessages] Resposta recebida:`, response);
      
      const sortedMessages = (response || []).sort((a, b) => a.timestamp - b.timestamp);
      console.log(`[loadChatMessages] Mensagens ordenadas:`, sortedMessages.length, 'mensagens');
      
      setChatMessages(sortedMessages);
      // Reset do estado de scroll ao carregar novas mensagens
      setIsUserScrolling(false);
      setLastScrollTop(0);
      // Scroll para a última mensagem quando abrir conversa (como WhatsApp)
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('[loadChatMessages] Erro ao carregar mensagens do chat:', error);
      setChatMessages([]);
    }
  };

  // Scroll automático para a última mensagem (HABILITADO apenas quando abrir conversa)
  const scrollToBottom = () => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Função para detectar scroll manual do usuário (menos agressiva)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    
    // Só marcar como scroll manual se o usuário estiver bem longe do final
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
    
    if (isNearBottom) {
      // Se está perto do final, permitir scroll automático
      setIsUserScrolling(false);
    } else if (scrollTop < lastScrollTop && scrollTop > 100) {
      // Se está scrollando para cima e não está no topo, marcar como scroll manual
      setIsUserScrolling(true);
    }
    
    setLastScrollTop(scrollTop);
  };

  // Reset do estado de scroll quando trocar de chat
  useEffect(() => {
    setIsUserScrolling(false);
    setLastScrollTop(0);
  }, [selectedChat]);

  // Enviar mensagem no chat atual
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');
    
    try {
      const response = await makeWAHARequest(`/sendText`, {
        method: 'POST',
        body: JSON.stringify({
          session: wahaConfig.session,
          chatId: selectedChat,
          text: messageText
        }),
      });

      // Adicionar a mensagem enviada ao estado local em vez de recarregar tudo
      const newMessageObj = {
        id: `temp_${Date.now()}`,
        body: messageText,
        from: 'me',
        to: selectedChat,
        timestamp: Date.now(),
        fromMe: true,
        type: 'text'
      };
      
      setChatMessages(prev => [...prev, newMessageObj]);
      
      toast({
        title: "Enviado!",
        description: "Mensagem enviada com sucesso",
      });
    } catch (error) {
      // Se falhou, restaurar a mensagem no input
      setNewMessage(messageText);
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
      
      const response = await makeWAHARequest('/sendText', {
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
      const response = await makeWAHARequest(`/${wahaConfig.session}/chats/${chatId}/messages/read`, {
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

  // Componente para renderizar mídia com fallback de erro (VERSÃO OTIMIZADA)
  const MediaWithFallback = React.memo(({ media, wahaUrl }: { media: any, wahaUrl: string }) => {
    const [errored, setErrored] = React.useState(false);
    
    // Usar a função de processamento de URL com cache
    const url = React.useMemo(() => {
      if (!media || !media.url) return null;
      return processMediaUrl(media.url, wahaUrl);
    }, [media?.url, wahaUrl]);
    
    // Gerar uma chave única estável para o componente baseada no ID da mensagem
    const componentKey = React.useMemo(() => {
      if (!media || !media.url) return null;
      // Usar uma combinação mais estável para evitar re-renderizações
      return `media_${media.url.split('/').pop()}_${media.mimetype}`;
    }, [media?.url, media?.mimetype]);
    
    // Memoizar o componente de áudio para evitar re-renderizações
    const audioComponent = React.useMemo(() => {
      if (media.mimetype?.startsWith('audio') && url && componentKey) {
        return <AudioPlayer key={componentKey} url={url} componentKey={componentKey} onError={() => setErrored(true)} />;
      }
      return null;
    }, [url, media.mimetype, componentKey]);
    
    if (!url) return null;
    
    if (errored) {
      return (
        <div className="text-xs text-red-400">
          Não foi possível carregar a mídia. <a href={url} target="_blank" rel="noopener noreferrer" className="underline">Abrir em nova aba</a>
        </div>
      );
    }
    
    if (media.mimetype?.startsWith('image')) {
      return (
        <img 
          src={url} 
          alt="imagem" 
          className="max-w-xs max-h-60 rounded" 
          onError={() => setErrored(true)}
          loading="lazy"
        />
      );
    }
    
    if (media.mimetype?.startsWith('audio')) {
      return audioComponent;
    }
    
    if (media.mimetype?.startsWith('video')) {
      return (
        <video 
          controls 
          src={url} 
          onError={() => setErrored(true)} 
          className="max-w-xs max-h-60"
          preload="metadata"
        />
      );
    }
    
    // Outro tipo
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
        Baixar mídia
      </a>
    );
  }, (prevProps, nextProps) => {
    // Comparação customizada para evitar re-renderizações desnecessárias
    return (
      prevProps.media?.url === nextProps.media?.url &&
      prevProps.media?.mimetype === nextProps.media?.mimetype &&
      prevProps.wahaUrl === nextProps.wahaUrl
    );
  });

  // Componente de Player de Áudio Customizado (VERSÃO ULTRA SIMPLIFICADA)
  const AudioPlayer = React.memo(({ url, componentKey, onError }: { url: string, componentKey: string, onError: () => void }) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [playbackRate, setPlaybackRate] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    const audioElementRef = React.useRef<HTMLAudioElement | null>(null);
    const progressRef = React.useRef<HTMLDivElement>(null);

    // Velocidades de reprodução disponíveis
    const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

    // Configurar elemento de áudio de forma mais simples
    React.useEffect(() => {
      const audio = new Audio(url);
      audio.preload = 'metadata';
      audioElementRef.current = audio;
      
      // Timeout para evitar loading infinito
      const loadingTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn(`[AudioPlayer ${componentKey}] Timeout no carregamento - usando fallback`);
          setIsLoading(false);
          setDuration(0);
        }
      }, 5000); // 5 segundos timeout

      const handleLoadedData = () => {
        clearTimeout(loadingTimeout);
        setDuration(audio.duration || 0);
        setIsLoading(false);
        setHasError(false);
        console.log(`[AudioPlayer ${componentKey}] Áudio carregado - Duração: ${audio.duration}s`);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      const handleError = () => {
        clearTimeout(loadingTimeout);
        console.error(`[AudioPlayer ${componentKey}] Erro ao carregar áudio: ${url}`);
        setIsLoading(false);
        setHasError(true);
      };

      // Event listeners básicos
      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      // Cleanup
      return () => {
        clearTimeout(loadingTimeout);
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.pause();
        audio.src = '';
      };
    }, [url, componentKey, isLoading]);

    const togglePlay = async () => {
      if (!audioElementRef.current || hasError) return;
      
      const audio = audioElementRef.current;
      
      try {
        if (isPlaying) {
          audio.pause();
        } else {
          // Pausar qualquer outro áudio
          if (audioManagerRef.current.currentAudio && audioManagerRef.current.currentAudio !== audio) {
            audioManagerRef.current.currentAudio.pause();
          }
          
          audio.playbackRate = playbackRate;
          await audio.play();
          
          audioManagerRef.current.currentAudio = audio;
          audioManagerRef.current.currentUrl = url;
          audioManagerRef.current.isPlaying = true;
        }
      } catch (error) {
        console.error(`[AudioPlayer ${componentKey}] Erro ao reproduzir:`, error);
        setHasError(true);
      }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (audioElementRef.current && progressRef.current && duration > 0 && !hasError) {
        const rect = progressRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        const newTime = percentage * duration;
        
        audioElementRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    const handlePlaybackRateChange = (rate: number) => {
      if (audioElementRef.current && !hasError) {
        audioElementRef.current.playbackRate = rate;
        setPlaybackRate(rate);
      }
    };

    const formatTime = (time: number) => {
      if (!isFinite(time) || isNaN(time)) return '0:00';
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Se houver erro, mostrar fallback
    if (hasError) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 max-w-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-red-400 text-sm">Áudio indisponível</div>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 text-xs underline hover:text-blue-300"
              >
                Tentar baixar
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-700 rounded-lg p-3 max-w-xs">
        <div className="flex items-center space-x-3">
          <button 
            onClick={togglePlay}
            disabled={isLoading}
            className="w-10 h-10 bg-green-500 hover:bg-green-600 disabled:bg-slate-500 rounded-full flex items-center justify-center text-white transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Áudio</span>
              <span>
                {isLoading ? (
                  <span className="text-slate-400">Carregando...</span>
                ) : (
                  `${formatTime(currentTime)} / ${formatTime(duration)}`
                )}
              </span>
            </div>
            
            <div 
              ref={progressRef}
              onClick={handleProgressClick}
              className="w-full bg-slate-600 rounded-full h-2 cursor-pointer"
            >
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-slate-400">Velocidade:</span>
              <select
                value={playbackRate}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value);
                  handlePlaybackRateChange(rate);
                }}
                className="text-xs bg-slate-600 border-slate-500 rounded px-1 py-0.5 text-white"
              >
                {playbackRates.map(rate => (
                  <option key={rate} value={rate}>{rate}x</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }, (prevProps, nextProps) => {
    return prevProps.url === nextProps.url;
  });

  // ChatAvatar SIMPLIFICADO - sempre renderiza ícones
  const ChatAvatar = ({ chat, size = 40, className = "" }: { 
    chat: any; 
    size?: number; 
    className?: string; 
  }) => {
    const chatId = typeof chat?.id === 'object' ? chat.id._serialized : (chat?.id || 'unknown');
    const hasUnread = (chat?.unreadCount || 0) > 0;
    const isGroup = chat?.isGroup || false;
    
    console.log(`[ChatAvatar] Renderizando:`, { chatId, isGroup, hasUnread, size });

    const avatarStyle = {
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      minHeight: `${size}px`
    };

    const iconSize = Math.max(12, Math.floor(size * 0.4));

    if (isGroup) {
      return (
        <div className={`relative flex-shrink-0 ${className}`} style={avatarStyle}>
          <div 
            className="rounded-full flex items-center justify-center bg-green-500 text-white" 
            style={avatarStyle}
          >
            <Users size={iconSize} />
          </div>
          {hasUnread && (
            <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className={`relative flex-shrink-0 ${className}`} style={avatarStyle}>
        <div 
          className="rounded-full flex items-center justify-center bg-blue-500 text-white" 
          style={avatarStyle}
        >
          <User size={iconSize} />
        </div>
        {hasUnread && (
          <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
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
            <TabsTrigger value="conversations" className="data-[state=active]:bg-slate-700">
              <MessageSquare className="mr-2" size={16} />
              {isMobile ? 'Conversas' : 'Conversas'}
            </TabsTrigger>
            <TabsTrigger value="connection" className="data-[state=active]:bg-slate-700">
              <Wifi className="mr-2" size={16} />
              {isMobile ? 'Conexão' : 'Conexão'}
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
                        placeholder="/api/whatsapp"
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Session Name</Label>
                      <Input
                        value={wahaConfig.session}
                        onChange={(e) => setWahaConfig({...wahaConfig, session: e.target.value})}
                        placeholder="default"
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">API Key (opcional)</Label>
                      <Input
                        type="password"
                        value={wahaConfig.apiKey}
                        onChange={(e) => setWahaConfig({...wahaConfig, apiKey: e.target.value})}
                        placeholder="Deixe vazio se não usar"
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">OpenAI API Key</Label>
                      <Input
                        type="password"
                        value={wahaConfig.chatgptKey}
                        onChange={(e) => setWahaConfig({...wahaConfig, chatgptKey: e.target.value})}
                        placeholder="sua-chave-openai-aqui"
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
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
                  
                  {/* Status da Conexão MELHORADO */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <StatusIcon className={status.color.includes('green') ? 'text-green-400' : 
                                                status.color.includes('yellow') ? 'text-yellow-400' : 
                                                status.color.includes('blue') ? 'text-blue-400' : 'text-red-400'} size={20} />
                          {sessionStatus?.status === 'WORKING' && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          )}
                          {sessionStatus?.status === 'SCAN_QR_CODE' && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        
                        <div>
                          <div className="text-white font-medium">{status.text}</div>
                          {sessionStatus?.me ? (
                            <div className="text-green-400 text-sm font-medium">
                              👤 {sessionStatus.me.pushName || sessionStatus.me.user}
                            </div>
                          ) : sessionStatus?.status === 'SCAN_QR_CODE' ? (
                            <div className="text-yellow-400 text-xs animate-pulse">
                              📱 Escaneie o QR Code com seu WhatsApp
                            </div>
                          ) : sessionStatus?.status === 'STARTING' ? (
                            <div className="text-blue-400 text-xs animate-pulse">
                              🔄 Iniciando conexão...
                            </div>
                          ) : sessionStatus?.status ? (
                            <div className="text-slate-400 text-xs">
                              Status: {sessionStatus.status}
                            </div>
                          ) : null}
                        </div>
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
                          disabled={isConnecting || sessionStatus?.status === 'STARTING'}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                          size="sm"
                        >
                          {isConnecting || sessionStatus?.status === 'STARTING' ? (
                            <RefreshCw className="mr-1 animate-spin" size={14} />
                          ) : (
                            <PlayCircle className="mr-1" size={14} />
                          )}
                          {isConnecting || sessionStatus?.status === 'STARTING' ? 'Conectando...' : 'Conectar'}
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
                                console.log(`[Conversation Click] Chat clicado:`, chat.id._serialized);
                                console.log(`[Conversation Click] Nome do chat:`, chat.name || chat.id.user);
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
                      onScroll={handleScroll}
                    >
                      {chatMessages.length > 0 ? (
                        <>
                          {/* Debug: mostrar quantidade de mensagens */}
                          <div className="text-xs text-slate-400 mb-2">
                            Mostrando {chatMessages.length} mensagens
                          </div>
                          {chatMessages.map((message, index) => (
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
                                      <MediaWithFallback 
                                        key={`media_${message.id}_${message.media.url.split('/').pop()}`}
                                        media={message.media} 
                                        wahaUrl={wahaConfig.url} 
                                      />
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
                          ))}
                        </>
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
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
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
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
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
