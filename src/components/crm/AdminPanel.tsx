/**
 * AdminPanel.tsx - Painel de Administração do CRM Inteligente
 * 
 * Este é o centro de controle completo do sistema CRM, organizado em abas:
 * - Fontes de Leads: Gerenciamento completo das origens de captura
 * - Configuração IA: Customização do SDR Virtual ChatGPT
 * - Equipe: Gestão de vendedores e atribuições
 * - Sistema: Configurações globais do CRM
 * 
 * Funcionalidades principais:
 * ✅ Controle total de fontes de leads (nova funcionalidade)
 * ✅ Configuração de IA personalizada
 * ✅ Gestão de equipe de vendas
 * ✅ Configurações do sistema
 * ✅ Interface com abas organizadas
 * ✅ Animações fluidas com Framer Motion
 * ✅ Notificações em tempo real
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  MessageSquare, 
  Globe, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Link,
  Code,
  Webhook,
  Upload,
  FileText,
  Download,
  Brain
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth, Lead } from '@/contexts/AuthContext';

export const AdminPanel = () => {
  // Hook para detectar dispositivos móveis
  const isMobile = useIsMobile();
  
  // Hook de notificações para feedback ao usuário
  const { toast } = useToast();
  /**
   * ESTADO: Prompt personalizado para o SDR Virtual (IA)
   * 
   * Este prompt define o comportamento da IA na qualificação de leads.
   * Inclui diretrizes de conduta, critérios de qualificação e instruções
   * específicas para maximizar a conversão.
   */
  const [aiPrompt, setAiPrompt] = useState(`Você é um SDR (Sales Development Representative) especializado da empresa Rockfeller. Sua missão é qualificar leads de forma consultiva e profissional.

DIRETRIZES:
1. Seja sempre educado e profissional
2. Faça perguntas para entender as necessidades
3. Identifique: urgência, orçamento, autoridade para decidir
4. Mantenha o foco no problema do cliente
5. Não seja invasivo, mas seja assertivo

CRITÉRIOS DE QUALIFICAÇÃO:
- Interesse genuíno no produto/serviço
- Orçamento disponível
- Autoridade para tomar decisões
- Timing adequado para implementação

Inicie sempre com uma pergunta sobre os desafios atuais da empresa.`);

  const { 
    user, 
    getSellersBySchool, 
    registerSeller, 
    updateSeller, 
    deleteSeller, 
    schools, 
    registerSchool, 
    deleteSchool,
    getLeadSourcesBySchool,
    registerLeadSource,
    updateLeadSource,
    deleteLeadSource,
    toggleLeadSource,
    getLeadsBySchool
  } = useAuth();
  
  // Buscar vendedores da escola atual
  const salesTeam = user ? getSellersBySchool(user.schoolId) : [];
  
  // Calcular estatísticas de distribuição de leads
  const getLeadDistributionStats = () => {
    if (!user) return [];
    
    const schoolLeads = getLeadsBySchool(user.schoolId);
    const activeSellers = salesTeam.filter(seller => seller.active);
    
    return activeSellers.map(seller => {
      const sellerLeads = schoolLeads.filter(lead => lead.assignedTo === seller.id);
      const totalLeads = sellerLeads.length;
      const todayLeads = sellerLeads.filter(lead => {
        const today = new Date();
        const leadDate = new Date(lead.createdAt);
        return leadDate.toDateString() === today.toDateString();
      }).length;
      
      return {
        seller,
        totalLeads,
        todayLeads,
        percentage: schoolLeads.length > 0 ? Math.round((totalLeads / schoolLeads.length) * 100) : 0
      };
    }).sort((a, b) => b.totalLeads - a.totalLeads);
  };
  
  const distributionStats = getLeadDistributionStats();

  // Estado para cadastro de nova escola
  const [newSchool, setNewSchool] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  // Estado para cadastro de novo vendedor
  const [newSeller, setNewSeller] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    password: ''
  });

  // Verificar se é o admin principal (sede)
  const isMainAdmin = user?.email === 'admin@rockfeller.com.br';

  // Obter fontes de leads da escola atual
  const schoolLeadSources = user ? getLeadSourcesBySchool(user.schoolId) : [];

  const [newSource, setNewSource] = useState({
    name: '',
    type: 'form' as 'form' | 'integration',
    description: '',
    url: '',
    autoAssign: '',
    notifications: true,
    fields: ['name', 'email']
  });

  const [systemSettings, setSystemSettings] = useState({
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    timezone: 'America/Sao_Paulo',
    autoQualification: true,
    whatsappIntegration: true,
    emailNotifications: true
  });

  // Estado para arquivos RAG
  const [ragFiles, setRagFiles] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

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
        console.log(`Arquivo padrão da Rockfeller carregado automaticamente para escola ${schoolId}`);
        
        toast({
          title: "Base de conhecimento carregada",
          description: "Arquivo padrão da Rockfeller foi carregado automaticamente",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar arquivo padrão:', error);
      setRagFiles([]);
    }
  };

  // Carregar configurações ao inicializar
  useEffect(() => {
    if (user) {
      // Carregar prompt da IA salvo
      const savedPrompt = localStorage.getItem(`ai_prompt_${user.schoolId}`);
      if (savedPrompt) {
        setAiPrompt(savedPrompt);
      }

      // Carregar arquivos RAG para a escola específica
      try {
        const savedFiles = localStorage.getItem(`rag_files_${user.schoolId}`);
        if (savedFiles) {
          const files = JSON.parse(savedFiles);
          console.log(`Carregando ${files.length} arquivos RAG para escola ${user.schoolId}`);
          setRagFiles(files);
        } else {
          console.log(`Nenhum arquivo RAG encontrado para escola ${user.schoolId}`);
          // Carregar arquivo padrão da Rockfeller se não houver arquivos RAG
          loadDefaultRockfellerKnowledge(user.schoolId);
        }
      } catch (error) {
        console.error('Erro ao carregar arquivos RAG:', error);
        setRagFiles([]);
      }
    }
  }, [user]);

  /**
   * FUNÇÃO: Alternar status ativo/inativo de uma fonte
   * 
   * Permite ativar ou desativar fontes de leads individualmente.
   * Quando uma fonte está inativa, ela não captura novos leads.
   * Inclui feedback visual através de notificação toast.
   * 
   * @param sourceId - ID da fonte a ser alterada
   */
  const handleToggleSource = async (sourceId: string) => {
    const success = await toggleLeadSource(sourceId);
    
    if (success) {
      toast({
        title: "Fonte atualizada",
        description: "Status da fonte de captura foi alterado",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a fonte",
        variant: "destructive",
      });
    }
  };

  /**
   * FUNÇÃO: Adicionar nova fonte de leads
   * 
   * Valida os dados e cria uma nova fonte personalizada.
   * Gera automaticamente:
   * - ID único baseado no nome
   * - Ícone padrão (Globe)
   * - Status ativo
   * - Contador zerado
   * 
   * Inclui validação de campos obrigatórios e feedback ao usuário.
   */
  const handleAddSource = async () => {
    // Validação: campos obrigatórios
    if (!newSource.name || !newSource.description || !user) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos nome e descrição",
        variant: "destructive",
      });
      return;
    }

    // Criação da nova fonte com valores padrão
    const sourceData = {
      ...newSource,
      type: newSource.type as 'form' | 'integration', // Tipagem correta
      icon: 'Globe',      // Ícone padrão como string
      active: true,       // Ativa por padrão
      webhookUrl: '',     // Webhook vazio inicialmente
      leadsCount: 0,      // Contador zerado
      schoolId: user.schoolId // Vincular à escola atual
    };

    // Adiciona à lista usando o contexto
    const success = await registerLeadSource(sourceData);
    
    if (success) {
      // Limpa o formulário
      setNewSource({
        name: '',
        type: 'form' as 'form' | 'integration',
        description: '',
        url: '',
        autoAssign: '',
        notifications: true,
        fields: ['name', 'email']
      });

      // Feedback de sucesso
      toast({
        title: "Fonte adicionada",
        description: `Fonte ${sourceData.name} foi criada com sucesso`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível criar a fonte",
        variant: "destructive",
      });
    }
  };

  const handleSaveSystemSettings = () => {
    // Aqui você salvaria as configurações no banco de dados
    // Por enquanto, vamos simular o salvamento
    
    toast({
      title: "Configurações salvas",
      description: "As configurações do sistema foram atualizadas com sucesso",
    });
  };

  const handleSaveAISettings = () => {
    // Salvar prompt e configurações da IA
    localStorage.setItem(`ai_prompt_${user?.schoolId || 'default'}`, aiPrompt);
    
    toast({
      title: "IA configurada",
      description: "As configurações do SDR Virtual foram atualizadas com sucesso",
    });
  };

  // Função para upload de arquivos RAG
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    const allowedTypes = [
      'text/plain', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Use apenas: TXT, PDF, DOC, DOCX ou MD",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploadingFile(true);

    try {
      // Simular processamento do arquivo
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        const content = e.target?.result as string;
        
        const newFile = {
          id: `file_${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          content: content,
          uploadedAt: new Date().toISOString(),
          processed: true,
          chunks: Math.ceil(content.length / 1000) // Simular chunks para RAG
        };

        const updatedFiles = [...ragFiles, newFile];
        setRagFiles(updatedFiles);
        
        // Salvar no localStorage
        const storageKey = `rag_files_${user.schoolId}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedFiles));
        console.log(`Arquivo ${file.name} salvo no localStorage com chave: ${storageKey}`);
        console.log(`Total de arquivos RAG: ${updatedFiles.length}`);
        
        toast({
          title: "Arquivo processado",
          description: `${file.name} foi adicionado à base de conhecimento da IA`,
        });
      };

      fileReader.readAsText(file);
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível processar o arquivo",
        variant: "destructive"
      });
    } finally {
      setUploadingFile(false);
      // Limpar input
      event.target.value = '';
    }
  };

  // Função para remover arquivo RAG
  const handleRemoveFile = (fileId: string) => {
    if (!user) return;
    
    const updatedFiles = ragFiles.filter((file: any) => file.id !== fileId);
    setRagFiles(updatedFiles);
    localStorage.setItem(`rag_files_${user.schoolId}`, JSON.stringify(updatedFiles));
    
    toast({
      title: "Arquivo removido",
      description: "Arquivo foi removido da base de conhecimento",
    });
  };

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSystemSettingChange = (setting: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleWorkingHoursChange = (type: 'start' | 'end', value: string) => {
    setSystemSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [type]: value
      }
    }));
  };

  const handleDeleteSeller = (sellerId: string, sellerName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o vendedor "${sellerName}"? Esta ação não pode ser desfeita.`)) {
      try {
        deleteSeller(sellerId);
        toast({
          title: "Vendedor excluído",
          description: `${sellerName} foi removido da equipe com sucesso`,
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o vendedor. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleRegisterSeller = async () => {
    // Validação: campos obrigatórios
    if (!newSeller.name || !newSeller.email || !newSeller.password || !user) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos nome, email e senha",
        variant: "destructive",
      });
      return;
    }

    // Validação: formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSeller.email)) {
      toast({
        title: "Erro",
        description: "Digite um email válido",
        variant: "destructive",
      });
      return;
    }

    try {
      // Criação do vendedor
      const sellerData = {
        ...newSeller,
        schoolId: user.schoolId,
        position: newSeller.position || 'Vendedor',
        role: 'seller' as const,
        active: true
      };

      const success = await registerSeller(sellerData);
      
      if (success) {
        // Limpa o formulário
        setNewSeller({
          name: '',
          email: '',
          phone: '',
          position: '',
          password: ''
        });

        // Feedback de sucesso
        toast({
          title: "Vendedor cadastrado",
          description: `${sellerData.name} foi adicionado à equipe`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível cadastrar o vendedor. Verifique se o email já não está em uso.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Não foi possível cadastrar o vendedor. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleRegisterSchool = async () => {
    if (!newSchool.name || !newSchool.email || !newSchool.password) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos nome, email e senha",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await registerSchool({
        name: newSchool.name,
        email: newSchool.email,
        phone: newSchool.phone,
        address: newSchool.address
      });

      if (success) {
        // Adicionar senha ao mock (em produção seria criptografada)
        const MOCK_PASSWORDS = JSON.parse(localStorage.getItem('mock_passwords') || '{}');
        MOCK_PASSWORDS[newSchool.email] = newSchool.password;
        localStorage.setItem('mock_passwords', JSON.stringify(MOCK_PASSWORDS));

        setNewSchool({
          name: '',
          email: '',
          phone: '',
          address: '',
          password: ''
        });

        toast({
          title: "Escola cadastrada",
          description: `${newSchool.name} foi cadastrada com sucesso`,
        });
      } else {
        toast({
          title: "Erro no cadastro",
          description: "Email já existe ou dados inválidos",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Não foi possível cadastrar a escola. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSchool = (schoolId: string, schoolName: string) => {
    if (schoolId === '1') {
      toast({
        title: "Ação não permitida",
        description: "Não é possível excluir a escola sede",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a escola "${schoolName}"? Esta ação excluirá também todos os vendedores desta escola e não pode ser desfeita.`)) {
      try {
        deleteSchool(schoolId);
        toast({
          title: "Escola excluída",
          description: `${schoolName} foi removida com sucesso`,
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a escola. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className={`space-y-${isMobile ? '4' : '6'}`}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <Tabs defaultValue="sources" className={`space-y-${isMobile ? '4' : '6'}`}>
        <TabsList className={`${
          isMobile 
            ? 'grid w-full grid-cols-2 gap-1' 
            : `grid w-full ${isMainAdmin ? 'grid-cols-5' : 'grid-cols-4'}`
        } bg-slate-800/50`}>
          <TabsTrigger 
            value="sources" 
            className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 ${
              isMobile ? 'text-xs px-2' : ''
            }`}
          >
            {isMobile ? 'Fontes' : 'Fontes de Leads'}
          </TabsTrigger>
          <TabsTrigger 
            value="ai" 
            className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 ${
              isMobile ? 'text-xs px-2' : ''
            }`}
          >
            {isMobile ? 'IA' : 'Configuração IA'}
          </TabsTrigger>
          <TabsTrigger 
            value="team" 
            className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 ${
              isMobile ? 'text-xs px-2' : ''
            }`}
          >
            Equipe
          </TabsTrigger>
          {isMainAdmin && (
            <TabsTrigger 
              value="schools" 
              className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 ${
                isMobile ? 'text-xs px-2' : ''
              }`}
            >
              Escolas
            </TabsTrigger>
          )}
          <TabsTrigger 
            value="system" 
            className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 ${
              isMobile ? 'text-xs px-2' : ''
            }`}
          >
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Lead Sources Configuration */}
        <TabsContent value="sources">
          <div className={`space-y-${isMobile ? '4' : '6'}`}>
            <motion.div variants={item}>
              <Card className={`${
                isMobile ? 'p-4' : 'p-6'
              } bg-slate-800/50 backdrop-blur-sm border-slate-700`}>
                <div className={`${
                  isMobile 
                    ? 'flex flex-col space-y-2 mb-4' 
                    : 'flex items-center justify-between mb-6'
                }`}>
                  <h2 className={`${
                    isMobile ? 'text-lg' : 'text-2xl'
                  } font-semibold text-white flex items-center`}>
                    <Webhook className={`${
                      isMobile ? 'mr-1' : 'mr-2'
                    }`} size={isMobile ? 18 : 24} />
                    {isMobile ? 'Fontes de Leads' : 'Fontes de Captura de Leads'}
                  </h2>
                  <Badge variant="secondary" className={`bg-blue-500/20 text-blue-400 ${
                    isMobile ? 'self-start text-xs' : ''
                  }`}>
                    {schoolLeadSources.filter(s => s.active).length} Ativas
                  </Badge>
                </div>

                {/* Sources Overview */}
                <div className={`grid ${
                  isMobile 
                    ? 'grid-cols-1 gap-3 mb-6' 
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'
                }`}>
                  {schoolLeadSources.map((source) => {
                    // Mapear string do ícone para componente
                    const iconMap: Record<string, any> = {
                      'Globe': Globe,
                      'Facebook': Facebook,
                      'Instagram': Instagram,
                      'Linkedin': Linkedin,
                      'Code': Code,
                      'Webhook': Webhook
                    };
                    const Icon = iconMap[source.icon] || Globe;
                    return (
                      <Card key={source.id} className={`${
                        isMobile ? 'p-3' : 'p-4'
                      } bg-slate-700/30 border-slate-600`}>
                        <div className={`${
                          isMobile 
                            ? 'flex flex-col space-y-2 mb-3' 
                            : 'flex items-center justify-between mb-3'
                        }`}>
                          <div className={`flex items-center ${
                            isMobile ? 'space-x-1' : 'space-x-2'
                          }`}>
                            <Icon size={isMobile ? 16 : 20} className="text-blue-400" />
                            <h3 className={`font-medium text-white ${
                              isMobile ? 'text-sm' : ''
                            }`}>
                              {source.name}
                            </h3>
                          </div>
                          <div className={`flex items-center ${
                            isMobile ? 'space-x-1 self-end' : 'space-x-2'
                          }`}>
                            <Switch
                              checked={source.active}
                              onCheckedChange={() => handleToggleSource(source.id)}
                            />
                            {source.active ? (
                              <Eye size={isMobile ? 14 : 16} className="text-green-400" />
                            ) : (
                              <EyeOff size={isMobile ? 14 : 16} className="text-slate-400" />
                            )}
                          </div>
                        </div>
                        
                        <p className={`text-slate-400 ${
                          isMobile ? 'text-xs mb-2' : 'text-sm mb-3'
                        }`}>
                          {source.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className={`flex justify-between ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            <span className="text-slate-400">Leads capturados:</span>
                            <span className="text-white font-medium">{source.leadsCount}</span>
                          </div>
                          <div className={`flex justify-between ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            <span className="text-slate-400">Responsável:</span>
                            <span className={`text-white font-medium ${
                              isMobile ? 'text-xs' : ''
                            }`}>
                              {source.autoAssign}
                            </span>
                          </div>
                          <div className={`flex justify-between ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            <span className="text-slate-400">Tipo:</span>
                            <Badge variant="outline" className={`${
                              isMobile ? 'text-xs' : 'text-xs'
                            }`}>
                              {source.type === 'form' ? 'Formulário' : 'Integração'}
                            </Badge>
                          </div>
                        </div>

                        <div className={`flex ${
                          isMobile ? 'space-x-1 mt-3' : 'space-x-2 mt-4'
                        }`}>
                          <Button 
                            size={isMobile ? "sm" : "sm"} 
                            variant="outline" 
                            className={`flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 ${
                              isMobile ? 'text-xs px-2' : ''
                            }`}
                          >
                            <Edit size={isMobile ? 12 : 14} className={`${
                              isMobile ? 'mr-0.5' : 'mr-1'
                            }`} />
                            Editar
                          </Button>
                          {source.type === 'form' && (
                            <Button 
                              size={isMobile ? "sm" : "sm"} 
                              variant="outline" 
                              className={`border-slate-600 text-slate-300 hover:bg-slate-700 ${
                                isMobile ? 'px-2' : ''
                              }`}
                            >
                              <Code size={isMobile ? 12 : 14} />
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Add New Source */}
                <Card className={`${
                  isMobile ? 'p-4' : 'p-6'
                } bg-slate-700/20 border-slate-600 border-dashed`}>
                  <h3 className={`${
                    isMobile ? 'text-base' : 'text-lg'
                  } font-semibold text-white ${
                    isMobile ? 'mb-3' : 'mb-4'
                  } flex items-center`}>
                    <Plus className={`${
                      isMobile ? 'mr-1' : 'mr-2'
                    }`} size={isMobile ? 16 : 20} />
                    Adicionar Nova Fonte
                  </h3>
                  
                  <div className={`grid ${
                    isMobile 
                      ? 'grid-cols-1 gap-3' 
                      : 'grid-cols-1 md:grid-cols-2 gap-4'
                  }`}>
                    <div className="space-y-2">
                      <Label className={`text-slate-300 ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        Nome da Fonte
                      </Label>
                      <Input
                        value={newSource.name}
                        onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                        placeholder="Ex: Google Ads, WhatsApp Business"
                        className={`bg-slate-700/50 border-slate-600 text-white ${
                          isMobile ? 'h-12 text-sm' : ''
                        }`}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className={`text-slate-300 ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        Tipo
                      </Label>
                      <select
                        value={newSource.type}
                        onChange={(e) => setNewSource({...newSource, type: e.target.value as 'form' | 'integration'})}
                        className={`w-full ${
                          isMobile ? 'p-3 text-sm' : 'p-2'
                        } bg-slate-700/50 border border-slate-600 rounded-md text-white`}
                      >
                        <option value="form">Formulário</option>
                        <option value="integration">Integração</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className={`text-slate-300 ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        URL (opcional)
                      </Label>
                      <Input
                        value={newSource.url}
                        onChange={(e) => setNewSource({...newSource, url: e.target.value})}
                        placeholder="https://exemplo.com/formulario"
                        className={`bg-slate-700/50 border-slate-600 text-white ${
                          isMobile ? 'h-12 text-sm' : ''
                        }`}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className={`text-slate-300 ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        Responsável
                      </Label>
                      <select
                        value={newSource.autoAssign}
                        onChange={(e) => setNewSource({...newSource, autoAssign: e.target.value})}
                        className={`w-full ${
                          isMobile ? 'p-3 text-sm' : 'p-2'
                        } bg-slate-700/50 border border-slate-600 rounded-md text-white`}
                      >
                        {salesTeam.map((member) => (
                          <option key={member.name} value={member.name}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className={`${
                      isMobile ? 'col-span-1' : 'md:col-span-2'
                    } space-y-2`}>
                      <Label className={`text-slate-300 ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        Descrição
                      </Label>
                      <Textarea
                        value={newSource.description}
                        onChange={(e) => setNewSource({...newSource, description: e.target.value})}
                        placeholder="Descreva o propósito desta fonte de leads"
                        className={`bg-slate-700/50 border-slate-600 text-white ${
                          isMobile ? 'text-sm' : ''
                        }`}
                        rows={isMobile ? 2 : 3}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAddSource}
                    className={`${
                      isMobile ? 'mt-3 w-full h-12' : 'mt-4'
                    } bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700`}
                  >
                    <Plus className={`${
                      isMobile ? 'mr-1' : 'mr-2'
                    }`} size={16} />
                    Adicionar Fonte
                  </Button>
                </Card>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* AI Configuration */}
        <TabsContent value="ai">
          <div className={`space-y-${isMobile ? '4' : '6'}`}>
            {/* Configuração do Prompt */}
            <motion.div variants={item}>
              <Card className={`${
                isMobile ? 'p-4' : 'p-6'
              } bg-slate-800/50 backdrop-blur-sm border-slate-700`}>
                <h2 className={`${
                  isMobile ? 'text-lg mb-4' : 'text-2xl mb-6'
                } font-semibold text-white flex items-center`}>
                  <Brain className={`${
                    isMobile ? 'mr-1' : 'mr-2'
                  }`} size={isMobile ? 18 : 24} />
                  Configuração da IA
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ai-prompt" className={`text-slate-300 ${
                      isMobile ? 'text-sm' : ''
                    }`}>
                      Prompt do SDR Virtual
                    </Label>
                    <Textarea
                      id="ai-prompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={isMobile ? 8 : 12}
                      className={`bg-slate-700/50 border-slate-600 text-white ${
                        isMobile ? 'text-sm' : ''
                      }`}
                    />
                  </div>
                  
                  <Button className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 ${
                    isMobile ? 'w-full h-12' : ''
                  }`} onClick={handleSaveAISettings}>
                    Salvar Configurações da IA
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Base de Conhecimento RAG */}
            <motion.div variants={item}>
              <Card className={`${
                isMobile ? 'p-4' : 'p-6'
              } bg-slate-800/50 backdrop-blur-sm border-slate-700`}>
                <div className={`${
                  isMobile 
                    ? 'flex flex-col space-y-2 mb-4' 
                    : 'flex items-center justify-between mb-6'
                }`}>
                  <h3 className={`${
                    isMobile ? 'text-lg' : 'text-xl'
                  } font-semibold text-white flex items-center`}>
                    <FileText className={`${
                      isMobile ? 'mr-1' : 'mr-2'
                    }`} size={isMobile ? 18 : 20} />
                    Base de Conhecimento (RAG)
                  </h3>
                  <Badge variant="secondary" className={`bg-purple-500/20 text-purple-400 ${
                    isMobile ? 'self-start text-xs' : ''
                  }`}>
                    {ragFiles.length} Arquivos
                  </Badge>
                </div>

                <div className="space-y-4">
                  {/* Upload de Arquivos */}
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">
                      Adicionar Arquivos de Treinamento
                    </h4>
                    <p className="text-slate-400 text-sm mb-4">
                      Faça upload de documentos sobre a Rockfeller para treinar a IA
                    </p>
                    <p className="text-slate-500 text-xs mb-4">
                      Formatos aceitos: TXT, PDF, DOC, DOCX, MD (máx. 10MB)
                    </p>
                    
                    <input
                      type="file"
                      accept=".txt,.pdf,.doc,.docx,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="rag-file-upload"
                      disabled={uploadingFile}
                    />
                    
                    <Button
                      onClick={() => document.getElementById('rag-file-upload')?.click()}
                      disabled={uploadingFile}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {uploadingFile ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2" size={16} />
                          Selecionar Arquivo
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Lista de Arquivos */}
                  {ragFiles.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-white font-medium flex items-center">
                        <FileText className="mr-2" size={16} />
                        Arquivos na Base de Conhecimento
                      </h4>
                      
                      <div className="space-y-2">
                        {ragFiles.map((file: any) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                file.isDefault 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                  : 'bg-gradient-to-r from-purple-500 to-blue-500'
                              }`}>
                                <FileText size={16} className="text-white" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="text-white font-medium text-sm">{file.name}</p>
                                  {file.isDefault && (
                                    <Badge className="text-xs bg-green-500/20 text-green-400">
                                      Padrão
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-slate-400 text-xs">
                                  {formatFileSize(file.size)} • {file.chunks} chunks • 
                                  {new Date(file.uploadedAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge className={`text-xs ${
                                file.processed 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {file.processed ? 'Processado' : 'Processando'}
                              </Badge>
                              
                              {!file.isDefault && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveFile(file.id)}
                                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white h-8 w-8 p-0"
                                >
                                  <Trash2 size={12} />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Informações sobre RAG */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-2 flex items-center">
                      <Brain className="mr-2" size={16} />
                      Como funciona o RAG?
                    </h4>
                    <p className="text-slate-300 text-sm">
                      Os arquivos enviados são processados e divididos em chunks (pedaços) que a IA usa como contexto 
                      para responder perguntas específicas sobre a Rockfeller. Isso permite que a IA tenha conhecimento 
                      detalhado sobre seus cursos, metodologia, preços e políticas.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team">
          <motion.div variants={item}>
            <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Users className="mr-2" />
                Equipe de Vendas
              </h3>

              {/* Estatísticas de Distribuição de Leads */}
              {distributionStats.length > 0 && (
                <Card className="mb-6 p-4 bg-slate-700/30 border-slate-600">
                  <h4 className="text-md font-semibold text-white mb-3 flex items-center">
                    <Brain className="mr-2" size={18} />
                    Distribuição Equitativa de Leads
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {distributionStats.map((stat, index) => (
                      <div key={stat.seller.id} className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-medium text-sm">{stat.seller.name}</p>
                          <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                            {stat.percentage}%
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Total:</span>
                            <span className="text-white">{stat.totalLeads} leads</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Hoje:</span>
                            <span className="text-green-400">{stat.todayLeads} leads</span>
                          </div>
                        </div>
                        <div className="mt-2 w-full bg-slate-600 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${stat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-xs text-center">
                      ✨ Sistema automático: Novos leads são distribuídos para o vendedor com menos atribuições
                    </p>
                  </div>
                </Card>
              )}
              
              <div className="space-y-3">
                {salesTeam.map((member, index) => (
                  <div key={member.id || index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{member.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-slate-400 text-sm">{member.email} • {member.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {member.active ? 'Ativo' : 'Inativo'}
                      </span>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Edit size={14} className="mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => handleDeleteSeller(member.id, member.name)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Formulário para Novo Vendedor */}
              <Card className="mt-6 p-6 bg-slate-700/20 border-slate-600 border-dashed">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Plus className="mr-2" size={20} />
                  Cadastrar Novo Vendedor
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nome Completo</Label>
                    <Input
                      value={newSeller.name}
                      onChange={(e) => setNewSeller({...newSeller, name: e.target.value})}
                      placeholder="Ex: João Silva"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Email de Login</Label>
                    <Input
                      type="email"
                      value={newSeller.email}
                      onChange={(e) => setNewSeller({...newSeller, email: e.target.value})}
                      placeholder="joao@rockfeller.com.br"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Senha</Label>
                    <Input
                      type="password"
                      value={newSeller.password}
                      onChange={(e) => setNewSeller({...newSeller, password: e.target.value})}
                      placeholder="Senha para acesso"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Telefone</Label>
                    <Input
                      value={newSeller.phone}
                      onChange={(e) => setNewSeller({...newSeller, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-slate-300">Cargo/Posição</Label>
                    <Input
                      value={newSeller.position}
                      onChange={(e) => setNewSeller({...newSeller, position: e.target.value})}
                      placeholder="Ex: Vendedor Sênior, Consultor de Vendas"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleRegisterSeller}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="mr-2" size={16} />
                  Cadastrar Vendedor
                </Button>
              </Card>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Schools Management - Only for Main Admin */}
        {isMainAdmin && (
          <TabsContent value="schools">
            <motion.div variants={item}>
              <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Users className="mr-2" />
                  Gerenciar Escolas
                </h3>
                
                {/* Lista de Escolas */}
                <div className="space-y-3 mb-6">
                  {schools.map((school) => (
                    <div key={school.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{school.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{school.name}</p>
                          <p className="text-slate-400 text-sm">{school.email} • {school.phone || 'Sem telefone'}</p>
                          {school.address && <p className="text-slate-400 text-xs">{school.address}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Ativa
                        </span>
                        {school.id !== '1' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            onClick={() => handleDeleteSchool(school.id, school.name)}
                          >
                            <Trash2 size={14} className="mr-1" />
                            Excluir
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formulário para Nova Escola */}
                <Card className="p-6 bg-slate-700/20 border-slate-600 border-dashed">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Plus className="mr-2" size={20} />
                    Cadastrar Nova Escola
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Nome da Escola</Label>
                      <Input
                        value={newSchool.name}
                        onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                        placeholder="Ex: Escola Rockfeller Filial Norte"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email de Login</Label>
                      <Input
                        type="email"
                        value={newSchool.email}
                        onChange={(e) => setNewSchool({...newSchool, email: e.target.value})}
                        placeholder="admin@filial.rockfeller.com.br"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Senha</Label>
                      <Input
                        type="password"
                        value={newSchool.password}
                        onChange={(e) => setNewSchool({...newSchool, password: e.target.value})}
                        placeholder="Senha para acesso"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Telefone</Label>
                      <Input
                        value={newSchool.phone}
                        onChange={(e) => setNewSchool({...newSchool, phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-slate-300">Endereço</Label>
                      <Textarea
                        value={newSchool.address}
                        onChange={(e) => setNewSchool({...newSchool, address: e.target.value})}
                        placeholder="Endereço completo da escola"
                        className="bg-slate-700/50 border-slate-600 text-white"
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleRegisterSchool}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="mr-2" size={16} />
                    Cadastrar Escola
                  </Button>
                </Card>
              </Card>
            </motion.div>
          </TabsContent>
        )}

        {/* System Settings */}
        <TabsContent value="system">
          <motion.div variants={item}>
            <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Settings className="mr-2" />
                Configurações do Sistema
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Horário de Funcionamento</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        type="time"
                        value={systemSettings.workingHours.start}
                        onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <Input
                        type="time"
                        value={systemSettings.workingHours.end}
                        onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-slate-300">Fuso Horário</Label>
                    <Input
                      value={systemSettings.timezone}
                      onChange={(e) => handleSystemSettingChange('timezone', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-white">Qualificação Automática</span>
                    <Switch
                      checked={systemSettings.autoQualification}
                      onCheckedChange={(checked) => handleSystemSettingChange('autoQualification', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-white">Integração WhatsApp</span>
                    <Switch
                      checked={systemSettings.whatsappIntegration}
                      onCheckedChange={(checked) => handleSystemSettingChange('whatsappIntegration', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-white">Notificações por E-mail</span>
                    <Switch
                      checked={systemSettings.emailNotifications}
                      onCheckedChange={(checked) => handleSystemSettingChange('emailNotifications', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleSaveSystemSettings}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Salvar Configurações
              </Button>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Schools Management - Only for Main Admin */}
        {isMainAdmin && (
          <TabsContent value="schools">
            <motion.div variants={item}>
              <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Users className="mr-2" />
                  Gerenciar Escolas
                </h3>
                
                {/* Lista de Escolas */}
                <div className="space-y-3 mb-6">
                  {schools.map((school) => (
                    <div key={school.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">{school.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{school.name}</p>
                          <p className="text-slate-400 text-sm">{school.email} • {school.phone || 'Sem telefone'}</p>
                          {school.address && <p className="text-slate-400 text-xs">{school.address}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Ativa
                        </span>
                        {school.id !== '1' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            onClick={() => handleDeleteSchool(school.id, school.name)}
                          >
                            <Trash2 size={14} className="mr-1" />
                            Excluir
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formulário para Nova Escola */}
                <Card className="p-6 bg-slate-700/20 border-slate-600 border-dashed">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Plus className="mr-2" size={20} />
                    Cadastrar Nova Escola
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Nome da Escola</Label>
                      <Input
                        value={newSchool.name}
                        onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                        placeholder="Ex: Escola Rockfeller Filial Norte"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email de Login</Label>
                      <Input
                        type="email"
                        value={newSchool.email}
                        onChange={(e) => setNewSchool({...newSchool, email: e.target.value})}
                        placeholder="admin@filial.rockfeller.com.br"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Senha</Label>
                      <Input
                        type="password"
                        value={newSchool.password}
                        onChange={(e) => setNewSchool({...newSchool, password: e.target.value})}
                        placeholder="Senha para acesso"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Telefone</Label>
                      <Input
                        value={newSchool.phone}
                        onChange={(e) => setNewSchool({...newSchool, phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-slate-300">Endereço</Label>
                      <Textarea
                        value={newSchool.address}
                        onChange={(e) => setNewSchool({...newSchool, address: e.target.value})}
                        placeholder="Endereço completo da escola"
                        className="bg-slate-700/50 border-slate-600 text-white"
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleRegisterSchool}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="mr-2" size={16} />
                    Cadastrar Escola
                  </Button>
                </Card>
              </Card>
            </motion.div>
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
};