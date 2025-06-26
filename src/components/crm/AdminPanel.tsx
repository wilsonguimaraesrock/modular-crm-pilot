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

import { useState } from 'react';
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
  Webhook
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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

  /**
   * ESTADO: Equipe de vendas
   * 
   * Gerencia todos os vendedores da empresa com suas informações:
   * - name: Nome completo do vendedor
   * - phone: Telefone para contato
   * - role: Cargo/função na empresa
   * - active: Status ativo/inativo (controla atribuições automáticas)
   */
  const [salesTeam, setSalesTeam] = useState([
    { name: 'Carlos Silva', phone: '+55 11 99999-9999', role: 'Vendedor Senior', active: true },
    { name: 'Ana Santos', phone: '+55 11 88888-8888', role: 'Vendedora Pleno', active: true },
    { name: 'Pedro Costa', phone: '+55 11 77777-7777', role: 'Vendedor Junior', active: false },
  ]);

  /**
   * ESTADO: Fontes de Captura de Leads (FUNCIONALIDADE PRINCIPAL)
   * 
   * Este é o coração do sistema de gestão de fontes. Cada fonte possui:
   * - id: Identificador único
   * - name: Nome exibido da fonte
   * - type: 'form' (formulários) ou 'integration' (APIs/webhooks)
   * - icon: Ícone da fonte (componente Lucide)
   * - active: Status ativo/inativo
   * - url: URL da fonte (para formulários)
   * - description: Descrição detalhada
   * - fields: Campos capturados
   * - autoAssign: Vendedor responsável automático
   * - notifications: Se deve enviar notificações
   * - webhookUrl: URL para integrações via webhook
   * - leadsCount: Contador de leads capturados
   */
  const [leadSources, setLeadSources] = useState([
    {
      id: 'website',
      name: 'Website',
      type: 'form',
      icon: Globe,
      active: true,
      url: 'https://seusite.com.br/contato',
      description: 'Formulário de contato do website principal',
      fields: ['name', 'email', 'phone', 'message'],
      autoAssign: 'Carlos Silva',
      notifications: true,
      webhookUrl: '',
      leadsCount: 125
    },
    {
      id: 'facebook',
      name: 'Facebook Ads',
      type: 'integration',
      icon: Facebook,
      active: true,
      url: '',
      description: 'Integração com Facebook Lead Ads',
      fields: ['name', 'email', 'phone'],
      autoAssign: 'Ana Santos',
      notifications: true,
      webhookUrl: 'https://api.seucrm.com/webhook/facebook',
      leadsCount: 89
    },
    {
      id: 'instagram',
      name: 'Instagram',
      type: 'integration',
      icon: Instagram,
      active: false,
      url: '',
      description: 'Integração com Instagram Business',
      fields: ['name', 'email'],
      autoAssign: 'Pedro Costa',
      notifications: false,
      webhookUrl: '',
      leadsCount: 0
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      type: 'integration',
      icon: Linkedin,
      active: true,
      url: '',
      description: 'Integração com LinkedIn Lead Gen Forms',
      fields: ['name', 'email', 'company', 'position'],
      autoAssign: 'Carlos Silva',
      notifications: true,
      webhookUrl: 'https://api.seucrm.com/webhook/linkedin',
      leadsCount: 45
    },
    {
      id: 'landing_page',
      name: 'Landing Page Campanha',
      type: 'form',
      icon: Code,
      active: true,
      url: 'https://campanha.seusite.com.br',
      description: 'Landing page para campanha específica',
      fields: ['name', 'email', 'phone', 'interests'],
      autoAssign: 'Ana Santos',
      notifications: true,
      webhookUrl: '',
      leadsCount: 67
    }
  ]);

  const [newSource, setNewSource] = useState({
    name: '',
    type: 'form',
    description: '',
    url: '',
    autoAssign: 'Carlos Silva',
    notifications: true,
    fields: ['name', 'email']
  });

  const systemSettings = {
    workingHours: { start: '09:00', end: '18:00' },
    timezone: 'America/Sao_Paulo',
    autoQualification: true,
    whatsappIntegration: true,
    emailNotifications: true,
  };

  /**
   * FUNÇÃO: Alternar status ativo/inativo de uma fonte
   * 
   * Permite ativar ou desativar fontes de leads individualmente.
   * Quando uma fonte está inativa, ela não captura novos leads.
   * Inclui feedback visual através de notificação toast.
   * 
   * @param sourceId - ID da fonte a ser alterada
   */
  const handleToggleSource = (sourceId: string) => {
    setLeadSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, active: !source.active } 
        : source
    ));
    
    toast({
      title: "Fonte atualizada",
      description: "Status da fonte de captura foi alterado",
    });
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
  const handleAddSource = () => {
    // Validação: campos obrigatórios
    if (!newSource.name || !newSource.description) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos nome e descrição",
        variant: "destructive",
      });
      return;
    }

    // Criação da nova fonte com valores padrão
    const source = {
      id: newSource.name.toLowerCase().replace(/\s+/g, '_'), // ID gerado automaticamente
      ...newSource,
      icon: Globe,      // Ícone padrão
      active: true,     // Ativa por padrão
      webhookUrl: '',   // Webhook vazio inicialmente
      leadsCount: 0     // Contador zerado
    };

    // Adiciona à lista e limpa o formulário
    setLeadSources(prev => [...prev, source]);
    setNewSource({
      name: '',
      type: 'form',
      description: '',
      url: '',
      autoAssign: 'Carlos Silva',
      notifications: true,
      fields: ['name', 'email']
    });

    // Feedback de sucesso
    toast({
      title: "Fonte adicionada",
      description: `Fonte ${source.name} foi criada com sucesso`,
    });
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
            : 'grid w-full grid-cols-4'
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
                    {leadSources.filter(s => s.active).length} Ativas
                  </Badge>
                </div>

                {/* Sources Overview */}
                <div className={`grid ${
                  isMobile 
                    ? 'grid-cols-1 gap-3 mb-6' 
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'
                }`}>
                  {leadSources.map((source) => {
                    const Icon = source.icon;
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
                        onChange={(e) => setNewSource({...newSource, type: e.target.value})}
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
          <motion.div variants={item}>
            <Card className={`${
              isMobile ? 'p-4' : 'p-6'
            } bg-slate-800/50 backdrop-blur-sm border-slate-700`}>
              <h2 className={`${
                isMobile ? 'text-lg mb-4' : 'text-2xl mb-6'
              } font-semibold text-white flex items-center`}>
                <MessageSquare className={`${
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
                }`}>
                  Salvar Configurações da IA
                </Button>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team">
          <motion.div variants={item}>
            <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Users className="mr-2" />
                Equipe de Vendas
              </h3>
              
              <div className="space-y-3">
                {salesTeam.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{member.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-slate-400 text-sm">{member.role} • {member.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {member.active ? 'Ativo' : 'Inativo'}
                      </span>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Adicionar Vendedor
              </Button>
            </Card>
          </motion.div>
        </TabsContent>

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
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <Input
                        type="time"
                        value={systemSettings.workingHours.end}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-slate-300">Fuso Horário</Label>
                    <Input
                      value={systemSettings.timezone}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-white">Qualificação Automática</span>
                    <div className={`w-12 h-6 rounded-full ${systemSettings.autoQualification ? 'bg-green-500' : 'bg-slate-600'} relative`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${systemSettings.autoQualification ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-white">Integração WhatsApp</span>
                    <div className={`w-12 h-6 rounded-full ${systemSettings.whatsappIntegration ? 'bg-green-500' : 'bg-slate-600'} relative`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${systemSettings.whatsappIntegration ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-white">Notificações por E-mail</span>
                    <div className={`w-12 h-6 rounded-full ${systemSettings.emailNotifications ? 'bg-green-500' : 'bg-slate-600'} relative`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${systemSettings.emailNotifications ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Salvar Configurações
              </Button>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
