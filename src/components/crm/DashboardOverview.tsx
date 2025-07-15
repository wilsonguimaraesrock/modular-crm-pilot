import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, MessageSquare, Calendar, Send, TrendingUp, Plus, Phone, Mail, Clock, User, ArrowLeft, FileText, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDatabaseAuth, Lead, FollowUp } from '@/contexts/DatabaseAuthContext';
import { toast } from '@/components/ui/use-toast';

interface DashboardOverviewProps {
  onNavigate?: (module: string) => void;
}

export const DashboardOverview = ({ onNavigate }: DashboardOverviewProps) => {
  const isMobile = useIsMobile();
  const { user, getLeadStats, getLeadsBySchool, updateLead, getFollowUpsByLead, createFollowUp, getSellersBySchool } = useDatabaseAuth();
  
  // Estados para o modal de detalhes do lead
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [newFollowUp, setNewFollowUp] = useState({
    type: 'ligacao' as const,
    priority: 'media' as const,
    description: '',
    scheduledDate: '',
    assignedTo: '',
    notes: ''
  });
  
  // Estados para atualização automática
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newLeadNotification, setNewLeadNotification] = useState(false);
  const previousLeadsRef = useRef<typeof schoolLeads>([]);
  
  // Obter estatísticas reais do contexto
  const stats = user ? getLeadStats(user.schoolId) : {
    leadsHoje: 0,
    qualificados: 0,
    agendados: 0,
    fechados: 0,
    novosLeads: 0
  };

  const schoolLeads = user ? getLeadsBySchool(user.schoolId) : [];
  const sellers = user ? getSellersBySchool(user.schoolId) : [];

  // Sistema de atualização automática
  useEffect(() => {
    // Verificar se há novos leads
    if (schoolLeads.length > previousLeadsRef.current.length) {
      const newLeads = schoolLeads.filter(lead => 
        !previousLeadsRef.current.some(prevLead => prevLead.id === lead.id)
      );
      
      if (newLeads.length > 0) {
        console.log('🆕 Novos leads detectados no Dashboard:', newLeads);
        setNewLeadNotification(true);
        
        // Mostrar toast para cada novo lead
        newLeads.forEach(lead => {
          toast({
            title: "🆕 Novo Lead no Pipeline!",
            description: `${lead.name} - ${lead.source}`,
            duration: 4000,
          });
        });
        
        // Esconder notificação após 5 segundos
        setTimeout(() => setNewLeadNotification(false), 5000);
      }
    }
    
    // Atualizar referência
    previousLeadsRef.current = schoolLeads;
  }, [schoolLeads, toast]);

  // Função para atualização manual
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    
    toast({
      title: "🔄 Atualizando Dashboard...",
      description: "Dados atualizados",
      duration: 2000,
    });
    
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Função para abrir modal de detalhes do lead
  const openLeadModal = (lead: Lead) => {
    setSelectedLead(lead);
    setFollowUps(getFollowUpsByLead(lead.id));
    setIsLeadModalOpen(true);
  };

  // Função para criar novo follow-up
  const handleCreateFollowUp = async () => {
    if (!selectedLead || !newFollowUp.description || !newFollowUp.scheduledDate || !user) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Criar o objeto follow-up que será salvo
    const followUpData = {
      leadId: selectedLead.id,
      leadName: selectedLead.name,
      type: newFollowUp.type,
      priority: newFollowUp.priority,
      description: newFollowUp.description,
      scheduledDate: new Date(newFollowUp.scheduledDate),
      status: 'pendente' as const,
      schoolId: user.schoolId,
      assignedTo: newFollowUp.assignedTo || user.id,
      notes: newFollowUp.notes
    };

    const success = await createFollowUp(followUpData);

    if (success) {
      toast({
        title: "Follow-up criado!",
        description: "Follow-up foi agendado com sucesso",
      });
      
      // Criar o follow-up completo para adicionar ao estado local
      const newFollowUpComplete = {
        id: Date.now().toString(), // ID temporário
        ...followUpData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Adicionar o novo follow-up à lista existente imediatamente
      setFollowUps(prev => [...prev, newFollowUpComplete]);
      
      // Resetar formulário
      setNewFollowUp({
        type: 'ligacao',
        priority: 'media',
        description: '',
        scheduledDate: '',
        assignedTo: '',
        notes: ''
      });
    }
  };

  const statsDisplay = [
    { label: 'Leads Capturados', value: stats.leadsHoje, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Qualificados pela IA', value: stats.qualificados, icon: MessageSquare, color: 'from-blue-600 to-blue-700' },
    { label: 'Reuniões Agendadas', value: stats.agendados, icon: Calendar, color: 'from-blue-700 to-blue-800' },
    { label: 'Matriculados', value: stats.fechados, icon: Send, color: 'from-blue-800 to-blue-900' },
  ];

  // Organizar leads por estágio
  const leadsByStage = {
    novo: schoolLeads.filter(lead => lead.status === 'novo'),
    qualificado: schoolLeads.filter(lead => lead.status === 'qualificado'),
    agendado: schoolLeads.filter(lead => lead.status === 'agendado'),
    matriculado: schoolLeads.filter(lead => lead.status === 'fechado')
  };

  const pipelineStages = [
    { 
      id: 'novo',
      stage: 'Novos Leads', 
      leads: leadsByStage.novo,
      color: 'bg-blue-500',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-600'
    },
    { 
      id: 'qualificado',
      stage: 'Qualificados', 
      leads: leadsByStage.qualificado,
      color: 'bg-green-500',
      borderColor: 'border-green-500',
      textColor: 'text-green-600'
    },
    { 
      id: 'agendado',
      stage: 'Agendados', 
      leads: leadsByStage.agendado,
      color: 'bg-yellow-500',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-600'
    },
    { 
      id: 'matriculado',
      stage: 'Matriculados', 
      leads: leadsByStage.matriculado,
      color: 'bg-purple-500',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-600'
    },
  ];

  // Função para mover lead entre estágios
  const moveLeadToStage = async (leadId: string, newStatus: Lead['status']) => {
    if (user) {
      await updateLead(leadId, { status: newStatus });
    }
  };

  // Função para mover lead para estágio anterior
  const moveLeadToPreviousStage = async (leadId: string, currentStatus: Lead['status']) => {
    if (user) {
      let previousStatus: Lead['status'];
      switch (currentStatus) {
        case 'fechado':
          previousStatus = 'agendado';
          break;
        case 'agendado':
          previousStatus = 'qualificado';
          break;
        case 'qualificado':
          previousStatus = 'novo';
          break;
        default:
          return; // Não há estágio anterior para 'novo'
      }
      await updateLead(leadId, { status: previousStatus });
    }
  };

  // Função para formatar data
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Função para obter cor do método
  const getMethodColor = (method: string) => {
    const colors = {
      'adults': 'bg-blue-100 text-blue-800',
      'teens': 'bg-green-100 text-green-800',
      'kids': 'bg-yellow-100 text-yellow-800',
      'practice-progress': 'bg-purple-100 text-purple-800',
      'on-demand': 'bg-gray-100 text-gray-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Função para obter label do método
  const getMethodLabel = (method: string) => {
    const labels = {
      'adults': 'Adults',
      'teens': 'Teens',
      'kids': 'Kids',
      'practice-progress': 'P&P',
      'on-demand': 'On Demand'
    };
    return labels[method as keyof typeof labels] || method;
  };

  // Função para redirecionar para WhatsApp
  const redirectToWhatsApp = (lead: Lead) => {
    if (!lead.phone) {
      toast({
        title: "Telefone não informado",
        description: "Este lead não possui telefone cadastrado",
        variant: "destructive",
      });
      return;
    }

    // Salvar lead no localStorage para o WhatsApp
    const leadData = {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      timestamp: Date.now()
    };
    
    localStorage.setItem('whatsapp_target_lead', JSON.stringify(leadData));
    
    // Redirecionar para WhatsApp
    if (onNavigate) {
      onNavigate('whatsapp');
      toast({
        title: "Redirecionando para WhatsApp",
        description: `Preparando conversa com ${lead.name}`,
      });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.1
      }
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
      {/* Stats Cards */}
      <div className={`grid ${
        isMobile 
          ? 'grid-cols-1 gap-4' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
      }`}>
        {statsDisplay.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={item}>
              <Card className={`relative overflow-hidden bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group ${
                isMobile ? 'shadow-sm' : ''
              }`}>
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className={`text-slate-400 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      } font-medium`}>
                        {stat.label}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className={`${
                          isMobile ? 'text-2xl' : 'text-3xl'
                        } font-bold text-white`}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    <div className={`${
                      isMobile ? 'p-2' : 'p-3'
                    } rounded-lg bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white" size={isMobile ? 20 : 24} />
                    </div>
                  </div>
                </CardContent>
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Pipeline Visual */}
      <motion.div variants={item}>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
            <div className="flex items-center justify-between">
              <CardTitle className={`${
                isMobile ? 'text-lg' : 'text-xl'
              } font-semibold text-white flex items-center`}>
                <TrendingUp className="mr-2" size={isMobile ? 18 : 20} />
                Pipeline de Vendas
              </CardTitle>
              <div className="flex items-center space-x-2">
                {/* Notificação de novos leads */}
                <AnimatePresence>
                  {newLeadNotification && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium"
                    >
                      🆕 Novo!
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Botão de atualização */}
                <Button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-500/30"
                >
                  <RefreshCw 
                    className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} 
                    size={isMobile ? 14 : 16} 
                  />
                  {isMobile ? '' : 'Atualizar'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
            {schoolLeads.length === 0 ? (
              <div className={`text-center ${isMobile ? 'py-6' : 'py-8'}`}>
                <p className={`text-slate-400 ${
                  isMobile ? 'text-base' : 'text-lg'
                } mb-4`}>
                  Nenhum lead ainda
                </p>
                <p className={`text-slate-500 ${
                  isMobile ? 'text-sm' : ''
                }`}>
                  Comece capturando seus primeiros leads
                </p>
              </div>
            ) : (
              <div className={`grid ${
                isMobile 
                  ? 'grid-cols-1 gap-4' 
                  : 'grid-cols-4 gap-6'
              } min-h-[400px]`}>
                {pipelineStages.map((stage, stageIndex) => (
                  <div key={stage.id} className="space-y-3">
                    {/* Header da coluna */}
                    <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${stage.borderColor} bg-slate-700/30`}>
                      <h3 className={`font-semibold ${stage.textColor} ${
                        isMobile ? 'text-sm' : 'text-base'
                      }`}>
                        {stage.stage}
                      </h3>
                      <Badge variant="secondary" className={`${stage.color} text-white ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        {stage.leads.length}
                      </Badge>
                    </div>

                    {/* Cards dos leads */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {stage.leads.length === 0 ? (
                        <div className={`text-center py-4 text-slate-500 ${
                          isMobile ? 'text-xs' : 'text-sm'
                        }`}>
                          Nenhum lead neste estágio
                        </div>
                      ) : (
                        stage.leads.map((lead, leadIndex) => (
                          <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: leadIndex * 0.1 }}
                          >
                            <Card 
                              className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-200 cursor-pointer group"
                              onClick={() => openLeadModal(lead)}
                            >
                              <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
                                <div className="space-y-2">
                                  {/* Nome e método */}
                                  <div className="flex items-center justify-between">
                                    <h4 className={`font-semibold text-white truncate ${
                                      isMobile ? 'text-sm' : 'text-base'
                                    }`}>
                                      {lead.name}
                                    </h4>
                                    <Badge className={`${getMethodColor(lead.method)} ${
                                      isMobile ? 'text-xs px-1' : 'text-xs'
                                    }`}>
                                      {getMethodLabel(lead.method)}
                                    </Badge>
                                  </div>

                                  {/* Email e telefone */}
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <Mail className="text-slate-400" size={isMobile ? 12 : 14} />
                                      <span className={`text-slate-300 truncate ${
                                        isMobile ? 'text-xs' : 'text-sm'
                                      }`}>
                                        {lead.email}
                                      </span>
                                    </div>
                                    {lead.phone && (
                                      <div className="flex items-center space-x-2">
                                        <Phone className="text-slate-400" size={isMobile ? 12 : 14} />
                                        <span className={`text-slate-300 ${
                                          isMobile ? 'text-xs' : 'text-sm'
                                        }`}>
                                          {lead.phone}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Modalidade e data */}
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className={`text-slate-300 border-slate-500 ${
                                      isMobile ? 'text-xs' : 'text-xs'
                                    }`}>
                                      {lead.modality === 'presencial' ? 'Presencial' : 'Live'}
                                    </Badge>
                                    <div className="flex items-center space-x-1">
                                      <Clock className="text-slate-400" size={isMobile ? 10 : 12} />
                                      <span className={`text-slate-400 ${
                                        isMobile ? 'text-xs' : 'text-xs'
                                      }`}>
                                        {formatDate(lead.createdAt)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Score se houver */}
                                  {lead.score > 0 && (
                                    <div className="flex items-center justify-between">
                                      <span className={`text-slate-400 ${
                                        isMobile ? 'text-xs' : 'text-sm'
                                      }`}>
                                        Score:
                                      </span>
                                      <Badge className={`${
                                        lead.score >= 80 ? 'bg-green-500' :
                                        lead.score >= 60 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                      } text-white`}>
                                        {lead.score}
                                      </Badge>
                                    </div>
                                  )}

                                  {/* Botões de ação */}
                                  <div className={`flex items-center justify-between pt-2`}>
                                    {/* Ícone para voltar ao estágio anterior */}
                                    {stage.id !== 'novo' ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveLeadToPreviousStage(lead.id, lead.status);
                                        }}
                                        className="p-1 h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-600"
                                      >
                                        <ArrowLeft size={14} />
                                      </Button>
                                    ) : (
                                      <div className="w-6"></div>
                                    )}
                                    
                                    {/* Botões para avançar */}
                                    <div className={`flex ${
                                      isMobile ? 'flex-col space-y-1' : 'space-x-2'
                                    }`}>
                                      {/* Botão WhatsApp */}
                                      {lead.phone && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            redirectToWhatsApp(lead);
                                          }}
                                          className={`text-green-400 border-green-400 hover:border-green-500 hover:text-green-500 bg-transparent ${
                                            isMobile ? 'text-xs h-7' : 'text-xs'
                                          }`}
                                        >
                                          WhatsApp
                                        </Button>
                                      )}
                                      
                                      {stage.id === 'novo' && (
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            moveLeadToStage(lead.id, 'qualificado');
                                          }}
                                          className={`bg-green-600 hover:bg-green-700 text-white ${
                                            isMobile ? 'text-xs h-7' : 'text-xs'
                                          }`}
                                        >
                                          Qualificar
                                        </Button>
                                      )}
                                      {stage.id === 'qualificado' && (
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            moveLeadToStage(lead.id, 'agendado');
                                          }}
                                          className={`bg-yellow-600 hover:bg-yellow-700 text-white ${
                                            isMobile ? 'text-xs h-7' : 'text-xs'
                                          }`}
                                        >
                                          Agendar
                                        </Button>
                                      )}
                                      {stage.id === 'agendado' && (
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            moveLeadToStage(lead.id, 'fechado');
                                          }}
                                          className={`bg-purple-600 hover:bg-purple-700 text-white ${
                                            isMobile ? 'text-xs h-7' : 'text-xs'
                                          }`}
                                        >
                                          Matricular
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Welcome Card */}
      <motion.div variants={item}>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
            <CardTitle className={`${
              isMobile ? 'text-lg' : 'text-xl'
            } font-semibold text-white`}>
              Sistema CRM Inteligente
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
              <p className={`text-slate-300 ${
                isMobile ? 'text-sm' : ''
              }`}>
                Configure as integrações e comece a capturar leads reais. O sistema está pronto para processar dados reais.
              </p>
              <div className={`flex ${
                isMobile ? 'flex-col space-y-2' : 'space-x-3'
              }`}>
                <Button 
                  onClick={() => onNavigate?.('leads')}
                  className={`${
                    isMobile ? 'w-full' : ''
                  } bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800`}
                >
                  <Plus className="mr-2" size={18} />
                  Capturar Primeiro Lead
                </Button>
                <Button 
                  onClick={() => onNavigate?.('admin')}
                  variant="outline" 
                  className={`${
                    isMobile ? 'w-full' : ''
                  } text-slate-300 border-slate-600 hover:bg-slate-700`}
                >
                  Configurar Integrações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal de Follow-ups - Layout Simplificado */}
      <Dialog open={isLeadModalOpen} onOpenChange={setIsLeadModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Follow-ups - {selectedLead?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4">
              {/* Informações resumidas do Lead */}
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{selectedLead.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedLead.name}</p>
                    <p className="text-slate-400 text-sm">{selectedLead.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getMethodColor(selectedLead.method)}>
                    {getMethodLabel(selectedLead.method)}
                  </Badge>
                </div>
              </div>

              {/* Follow-ups Existentes */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">Follow-ups Existentes ({followUps.length})</h3>
                {followUps.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>Nenhum follow-up cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {followUps.map((followUp) => (
                      <div key={followUp.id} className="flex items-center justify-between p-2 bg-slate-700/20 rounded">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={`text-xs ${
                              followUp.priority === 'alta' ? 'bg-red-500/20 text-red-400' :
                              followUp.priority === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {followUp.type}
                            </Badge>
                            <Badge className={`text-xs ${
                              followUp.status === 'concluido' ? 'bg-green-500/20 text-green-400' :
                              followUp.status === 'pendente' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {followUp.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-white">{followUp.description}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(followUp.scheduledDate).toLocaleDateString('pt-BR')} às {new Date(followUp.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Criar Novo Follow-up - Formulário Compacto */}
              <div className="border-t border-slate-600 pt-4">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Novo Follow-up</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="type" className="text-xs text-slate-400">Tipo</Label>
                      <Select value={newFollowUp.type} onValueChange={(value) => setNewFollowUp({...newFollowUp, type: value as any})}>
                        <SelectTrigger className="bg-slate-600/50 border-slate-500 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="ligacao">Ligação</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="visita">Visita</SelectItem>
                          <SelectItem value="reuniao">Reunião</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority" className="text-xs text-slate-400">Prioridade</Label>
                      <Select value={newFollowUp.priority} onValueChange={(value) => setNewFollowUp({...newFollowUp, priority: value as any})}>
                        <SelectTrigger className="bg-slate-600/50 border-slate-500 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-xs text-slate-400">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newFollowUp.description}
                      onChange={(e) => setNewFollowUp({...newFollowUp, description: e.target.value})}
                      placeholder="Descreva o que será feito..."
                      className="bg-slate-600/50 border-slate-500 h-16 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="scheduledDate" className="text-xs text-slate-400">Data e Hora</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={newFollowUp.scheduledDate}
                      onChange={(e) => setNewFollowUp({...newFollowUp, scheduledDate: e.target.value})}
                      className="bg-slate-600/50 border-slate-500 h-8"
                    />
                  </div>

                  <Button 
                    onClick={handleCreateFollowUp}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-8"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Follow-up
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
