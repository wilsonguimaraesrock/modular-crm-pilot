import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Globe, Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Building, GraduationCap, Users } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

export const LeadCapture = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user, registerLead, getLeadsBySchool, getLeadStats, getLeadSourcesBySchool } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    interests: '',
    source: 'website',
    method: '', // Adults, Teens, Kids, Practice & Progress, On Demand
    modality: '', // Presencial ou Live
    age: '',
    experience: '',
    availability: '',
    budget: '',
    goals: ''
  });

  const [autoQualification, setAutoQualification] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Obter dados do contexto
  const schoolLeads = user ? getLeadsBySchool(user.schoolId) : [];
  const stats = user ? getLeadStats(user.schoolId) : {
    leadsHoje: 0,
    qualificados: 0,
    agendados: 0,
    fechados: 0,
    novosLeads: 0
  };
  const schoolLeadSources = user ? getLeadSourcesBySchool(user.schoolId) : [];

  const sources = [
    { id: 'website', name: 'Website', icon: Globe, count: 0, color: 'bg-blue-500' },
    { id: 'facebook', name: 'Facebook Ads', icon: Facebook, count: 0, color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, count: 0, color: 'bg-blue-700' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, count: 0, color: 'bg-blue-800' },
  ];

  // Opções específicas da Rockfeller
  const teachingMethods = [
    { value: 'adults', label: 'Adults' },
    { value: 'teens', label: 'Teens' },
    { value: 'kids', label: 'Kids' },
    { value: 'practice-progress', label: 'Practice & Progress' },
    { value: 'on-demand', label: 'On Demand' }
  ];

  const modalities = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'live', label: 'Live' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.method || !formData.modality || !user) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios: Nome, E-mail, Método e Modalidade",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Criar novo lead usando o contexto
      const leadData = {
        ...formData,
        score: 0,
        status: 'novo' as const,
        schoolId: user.schoolId
      };

      const success = await registerLead(leadData);
      
      if (success) {
        // Limpar formulário
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          position: '',
          interests: '',
          source: 'website',
          method: '',
          modality: '',
          age: '',
          experience: '',
          availability: '',
          budget: '',
          goals: ''
        });

        toast({
          title: "Lead Capturado!",
          description: `Lead ${leadData.name} foi adicionado com sucesso`,
        });
      } else {
        throw new Error('Falha ao registrar lead');
      }

    } catch (error) {
      console.error('Erro ao capturar lead:', error);
      toast({
        title: "Erro",
        description: "Erro ao capturar lead. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      <Tabs defaultValue="capture" className={`space-y-${isMobile ? '4' : '6'}`}>
        <TabsList className={`grid w-full ${
          isMobile ? 'grid-cols-3 h-12' : 'grid-cols-3'
        } bg-slate-800/50`}>
          <TabsTrigger 
            value="capture" 
            className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 ${
              isMobile ? 'text-xs px-2' : ''
            }`}
          >
            {isMobile ? 'Capturar' : 'Capturar Lead'}
          </TabsTrigger>
          <TabsTrigger 
            value="sources" 
            className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 ${
              isMobile ? 'text-xs px-2' : ''
            }`}
          >
            Fontes
          </TabsTrigger>
          <TabsTrigger 
            value="recent" 
            className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 ${
              isMobile ? 'text-xs px-2' : ''
            }`}
          >
            {isMobile ? 'Recentes' : 'Leads Recentes'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="capture">
          <div className={`grid ${
            isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'
          }`}>
            <motion.div variants={item}>
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
                  <CardTitle className={`text-white flex items-center ${
                    isMobile ? 'text-lg' : ''
                  }`}>
                    <UserPlus className="mr-2" size={isMobile ? 18 : 20} />
                    Novo Lead - Rockfeller
                  </CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
                  <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '3' : '4'}`}>
                    {/* Dados Pessoais */}
                    <div className="space-y-3">
                      <h3 className="text-white font-semibold flex items-center">
                        <Users className="mr-2" size={16} />
                        Dados Pessoais
                      </h3>
                      <div className={`grid ${
                        isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'
                      }`}>
                        <div className="space-y-2">
                          <Label htmlFor="name" className={`text-slate-300 ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            Nome *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className={`bg-slate-700/50 border-slate-600 text-white ${
                              isMobile ? 'h-12' : ''
                            }`}
                            placeholder="Nome completo"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className={`text-slate-300 ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            E-mail *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className={`bg-slate-700/50 border-slate-600 text-white ${
                              isMobile ? 'h-12' : ''
                            }`}
                            placeholder="email@exemplo.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className={`text-slate-300 ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            Telefone
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className={`bg-slate-700/50 border-slate-600 text-white ${
                              isMobile ? 'h-12' : ''
                            }`}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age" className={`text-slate-300 ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            Idade
                          </Label>
                          <Input
                            id="age"
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                            className={`bg-slate-700/50 border-slate-600 text-white ${
                              isMobile ? 'h-12' : ''
                            }`}
                            placeholder="Ex: 25 anos"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Informações do Curso */}
                    <div className="space-y-3">
                      <h3 className="text-white font-semibold flex items-center">
                        <GraduationCap className="mr-2" size={16} />
                        Informações do Curso
                      </h3>
                      <div className={`grid ${
                        isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'
                      }`}>
                        <div className="space-y-2">
                          <Label htmlFor="method" className={`text-slate-300 ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            Método *
                          </Label>
                          <Select value={formData.method} onValueChange={(value) => setFormData({...formData, method: value})}>
                            <SelectTrigger className={`bg-slate-700/50 border-slate-600 text-white ${
                              isMobile ? 'h-12' : ''
                            }`}>
                              <SelectValue placeholder="Selecione o método" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              {teachingMethods.map((method) => (
                                <SelectItem key={method.value} value={method.value} className="text-white hover:bg-slate-600">
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="modality" className={`text-slate-300 ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            Modalidade *
                          </Label>
                          <Select value={formData.modality} onValueChange={(value) => setFormData({...formData, modality: value})}>
                            <SelectTrigger className={`bg-slate-700/50 border-slate-600 text-white ${
                              isMobile ? 'h-12' : ''
                            }`}>
                              <SelectValue placeholder="Selecione a modalidade" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              {modalities.map((modality) => (
                                <SelectItem key={modality.value} value={modality.value} className="text-white hover:bg-slate-600">
                                  {modality.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="experience" className={`text-slate-300 ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            Experiência com Inglês
                          </Label>
                          <Input
                            id="experience"
                            value={formData.experience}
                            onChange={(e) => setFormData({...formData, experience: e.target.value})}
                            className={`bg-slate-700/50 border-slate-600 text-white ${
                              isMobile ? 'h-12' : ''
                            }`}
                            placeholder="Ex: Básico, Intermediário, Avançado"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="availability" className={`text-slate-300 ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            Disponibilidade
                          </Label>
                          <Input
                            id="availability"
                            value={formData.availability}
                            onChange={(e) => setFormData({...formData, availability: e.target.value})}
                            className={`bg-slate-700/50 border-slate-600 text-white ${
                              isMobile ? 'h-12' : ''
                            }`}
                            placeholder="Ex: Manhã, Tarde, Noite"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="space-y-3">
                      <div className={`grid ${
                        isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'
                      }`}>
                        <div className="space-y-2">
                          <Label htmlFor="budget" className={`text-slate-300 ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            Orçamento Mensal
                          </Label>
                          <Input
                            id="budget"
                            value={formData.budget}
                            onChange={(e) => setFormData({...formData, budget: e.target.value})}
                            className={`bg-slate-700/50 border-slate-600 text-white ${
                              isMobile ? 'h-12' : ''
                            }`}
                            placeholder="Ex: R$ 500,00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="source" className={`text-slate-300 ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            Fonte
                          </Label>
                          <Select value={formData.source} onValueChange={(value) => setFormData({...formData, source: value})}>
                            <SelectTrigger className={`bg-slate-700/50 border-slate-600 text-white ${
                              isMobile ? 'h-12' : ''
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              {sources.map((source) => (
                                <SelectItem key={source.id} value={source.id} className="text-white hover:bg-slate-600">
                                  {source.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goals" className={`text-slate-300 ${
                          isMobile ? 'text-sm' : ''
                        }`}>
                          Objetivos com o Inglês
                        </Label>
                        <Textarea
                          id="goals"
                          value={formData.goals}
                          onChange={(e) => setFormData({...formData, goals: e.target.value})}
                          className={`bg-slate-700/50 border-slate-600 text-white ${
                            isMobile ? 'min-h-20' : 'min-h-24'
                          }`}
                          placeholder="Ex: Trabalho, viagem, estudos, hobby..."
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-qualification"
                        checked={autoQualification}
                        onCheckedChange={setAutoQualification}
                      />
                      <Label htmlFor="auto-qualification" className={`text-slate-300 ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        Qualificação automática com IA
                      </Label>
                    </div>

                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 ${
                        isMobile ? 'h-12' : ''
                      }`}
                    >
                      {isLoading ? 'Capturando...' : 'Capturar Lead'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
                  <CardTitle className={`text-white ${
                    isMobile ? 'text-lg' : ''
                  }`}>
                    Estatísticas Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
                  <div className={`grid ${
                    isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 gap-4'
                  }`}>
                    <div className={`${
                      isMobile ? 'p-3' : 'p-4'
                    } bg-slate-700/30 rounded-lg`}>
                      <div className={`flex items-center ${
                        isMobile ? 'space-x-1' : 'space-x-2'
                      }`}>
                        <Mail className="text-blue-400" size={isMobile ? 16 : 20} />
                        <div>
                          <p className={`${
                            isMobile ? 'text-xl' : 'text-2xl'
                          } font-bold text-white`}>
                            {stats.leadsHoje}
                          </p>
                          <p className={`text-slate-400 ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            Leads Hoje
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={`${
                      isMobile ? 'p-3' : 'p-4'
                    } bg-slate-700/30 rounded-lg`}>
                      <div className={`flex items-center ${
                        isMobile ? 'space-x-1' : 'space-x-2'
                      }`}>
                        <Phone className="text-blue-500" size={isMobile ? 16 : 20} />
                        <div>
                          <p className={`${
                            isMobile ? 'text-xl' : 'text-2xl'
                          } font-bold text-white`}>
                            {stats.qualificados}
                          </p>
                          <p className={`text-slate-400 ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            Qualificados
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={`${
                      isMobile ? 'p-3' : 'p-4'
                    } bg-slate-700/30 rounded-lg`}>
                      <div className={`flex items-center ${
                        isMobile ? 'space-x-1' : 'space-x-2'
                      }`}>
                        <MapPin className="text-blue-600" size={isMobile ? 16 : 20} />
                        <div>
                          <p className={`${
                            isMobile ? 'text-xl' : 'text-2xl'
                          } font-bold text-white`}>
                            {stats.agendados}
                          </p>
                          <p className={`text-slate-400 ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            Agendados
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={`${
                      isMobile ? 'p-3' : 'p-4'
                    } bg-slate-700/30 rounded-lg`}>
                      <div className={`flex items-center ${
                        isMobile ? 'space-x-1' : 'space-x-2'
                      }`}>
                        <Building className="text-blue-700" size={isMobile ? 16 : 20} />
                        <div>
                          <p className={`${
                            isMobile ? 'text-xl' : 'text-2xl'
                          } font-bold text-white`}>
                            {stats.fechados}
                          </p>
                          <p className={`text-slate-400 ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            Fechados
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="sources">
          <div className={`grid ${
            isMobile 
              ? 'grid-cols-1 gap-4' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
          }`}>
            {sources.map((source, index) => {
              const Icon = source.icon;
              return (
                <motion.div 
                  key={source.id}
                  variants={item}
                  whileHover={isMobile ? {} : { scale: 1.05 }}
                >
                  <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer">
                    <CardContent className={`${
                      isMobile ? 'p-4' : 'p-6'
                    } text-center`}>
                      <div className={`${
                        isMobile ? 'w-10 h-10' : 'w-12 h-12'
                      } ${source.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="text-white" size={isMobile ? 18 : 24} />
                      </div>
                      <h3 className={`text-white font-semibold mb-2 ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        {source.name}
                      </h3>
                      <p className={`${
                        isMobile ? 'text-2xl' : 'text-3xl'
                      } font-bold text-white mb-1`}>
                        {source.count}
                      </p>
                      <p className={`text-slate-400 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        leads este mês
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
              <CardTitle className={`text-white ${
                isMobile ? 'text-lg' : ''
              }`}>
                Leads Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
              {schoolLeads.length === 0 ? (
                <div className={`text-center ${
                  isMobile ? 'py-6' : 'py-8'
                }`}>
                  <p className={`text-slate-400 ${
                    isMobile ? 'text-base' : 'text-lg'
                  } mb-2`}>
                    Nenhum lead ainda
                  </p>
                  <p className={`text-slate-500 ${
                    isMobile ? 'text-sm' : ''
                  }`}>
                    Os leads capturados aparecerão aqui
                  </p>
                </div>
              ) : (
                <div className={`space-y-${isMobile ? '2' : '3'}`}>
                  {schoolLeads.map((lead, index) => (
                    <motion.div 
                      key={lead.id}
                      className={`${
                        isMobile 
                          ? 'flex flex-col space-y-2 p-3' 
                          : 'flex items-center justify-between p-4'
                      } bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-300`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={isMobile ? {} : { x: 4 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${
                          isMobile ? 'w-8 h-8' : 'w-10 h-10'
                        } bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center`}>
                          <span className={`text-white font-semibold ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            {lead.name[0]}
                          </span>
                        </div>
                        <div>
                          <p className={`text-white font-medium ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            {lead.name}
                          </p>
                          <p className={`text-slate-400 ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            {lead.company || lead.email}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center ${
                        isMobile ? 'justify-between ml-11' : 'space-x-4'
                      }`}>
                        <Badge variant="secondary" className={`text-slate-300 ${
                          isMobile ? 'text-xs' : ''
                        }`}>
                          {lead.source}
                        </Badge>
                        <div className="text-center">
                          <p className={`text-white font-semibold ${
                            isMobile ? 'text-sm' : ''
                          }`}>
                            {lead.score}
                          </p>
                          <p className={`text-slate-400 ${
                            isMobile ? 'text-xs' : 'text-xs'
                          }`}>
                            Score
                          </p>
                        </div>
                        <span className={`text-slate-400 ${
                          isMobile ? 'text-xs' : 'text-sm'
                        }`}>
                          {new Date(lead.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
