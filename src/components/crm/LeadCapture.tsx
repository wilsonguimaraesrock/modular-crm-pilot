import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Globe, Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Building } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export const LeadCapture = () => {
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    interests: '',
    source: 'website'
  });

  const [autoQualification, setAutoQualification] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState({
    leadsHoje: 0,
    qualificados: 0,
    agendados: 0,
    fechados: 0
  });

  const { toast } = useToast();

  const sources = [
    { id: 'website', name: 'Website', icon: Globe, count: 0, color: 'bg-blue-500' },
    { id: 'facebook', name: 'Facebook Ads', icon: Facebook, count: 0, color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, count: 0, color: 'bg-blue-700' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, count: 0, color: 'bg-blue-800' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos nome e e-mail",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Criar novo lead
      const newLead = {
        id: Date.now().toString(),
        ...formData,
        timestamp: new Date().toISOString(),
        score: 0,
        status: 'novo'
      };

      // Adicionar à lista de leads
      setLeads(prev => [newLead, ...prev]);
      
      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        leadsHoje: prev.leadsHoje + 1
      }));

      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        interests: '',
        source: 'website'
      });

      toast({
        title: "Lead Capturado!",
        description: `Lead ${newLead.name} foi adicionado com sucesso`,
      });

      console.log('Lead capturado:', newLead);

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
                    Novo Lead
                  </CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
                  <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '3' : '4'}`}>
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
                    </div>

                    <div className={`grid ${
                      isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'
                    }`}>
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
                        <Label htmlFor="company" className={`text-slate-300 ${
                          isMobile ? 'text-sm' : ''
                        }`}>
                          Empresa
                        </Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          className={`bg-slate-700/50 border-slate-600 text-white ${
                            isMobile ? 'h-12' : ''
                          }`}
                          placeholder="Nome da empresa"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interests" className={`text-slate-300 ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        Interesses
                      </Label>
                      <Textarea
                        id="interests"
                        value={formData.interests}
                        onChange={(e) => setFormData({...formData, interests: e.target.value})}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Descreva os interesses do lead..."
                        rows={isMobile ? 2 : 3}
                      />
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
              {leads.length === 0 ? (
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
                  {leads.map((lead, index) => (
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
