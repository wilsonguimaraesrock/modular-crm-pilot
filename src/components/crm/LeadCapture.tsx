
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, Globe, Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Building } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export const LeadCapture = () => {
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

  const sources = [
    { id: 'website', name: 'Website', icon: Globe, count: 45, color: 'bg-blue-500' },
    { id: 'facebook', name: 'Facebook Ads', icon: Facebook, count: 32, color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, count: 28, color: 'bg-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, count: 19, color: 'bg-blue-700' },
  ];

  const recentLeads = [
    { name: 'Carlos Silva', company: 'Tech Corp', source: 'website', time: '2min', score: 85 },
    { name: 'Ana Oliveira', company: 'Marketing Plus', source: 'facebook', time: '5min', score: 92 },
    { name: 'João Santos', company: 'StartupX', source: 'linkedin', time: '8min', score: 78 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de envio do formulário
    console.log('Lead capturado:', formData);
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
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <Tabs defaultValue="capture" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="capture" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
            Capturar Lead
          </TabsTrigger>
          <TabsTrigger value="sources" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
            Fontes
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
            Recentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="capture">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <UserPlus className="mr-2" />
                    Novo Lead
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-300">Nome *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="Nome completo"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="email@exemplo.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-300">Telefone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-slate-300">Empresa</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder="Nome da empresa"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interests" className="text-slate-300">Interesses</Label>
                      <Textarea
                        id="interests"
                        value={formData.interests}
                        onChange={(e) => setFormData({...formData, interests: e.target.value})}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Descreva os interesses do lead..."
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-qualification"
                        checked={autoQualification}
                        onCheckedChange={setAutoQualification}
                      />
                      <Label htmlFor="auto-qualification" className="text-slate-300">
                        Qualificação automática com IA
                      </Label>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                        >
                          Capturar Lead
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-800 border-slate-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Lead Capturado!</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-300">
                            O lead foi capturado com sucesso e será processado pela IA para qualificação automática.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogAction className="bg-green-600 hover:bg-green-700">
                            OK
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Estatísticas Hoje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Mail className="text-blue-400" size={20} />
                        <div>
                          <p className="text-2xl font-bold text-white">12</p>
                          <p className="text-slate-400 text-sm">Leads Hoje</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Phone className="text-green-400" size={20} />
                        <div>
                          <p className="text-2xl font-bold text-white">8</p>
                          <p className="text-slate-400 text-sm">Qualificados</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <MapPin className="text-purple-400" size={20} />
                        <div>
                          <p className="text-2xl font-bold text-white">5</p>
                          <p className="text-slate-400 text-sm">Agendados</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Building className="text-orange-400" size={20} />
                        <div>
                          <p className="text-2xl font-bold text-white">3</p>
                          <p className="text-slate-400 text-sm">Fechados</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sources.map((source, index) => {
              const Icon = source.icon;
              return (
                <motion.div 
                  key={source.id}
                  variants={item}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 ${source.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <h3 className="text-white font-semibold mb-2">{source.name}</h3>
                      <p className="text-3xl font-bold text-white mb-1">{source.count}</p>
                      <p className="text-slate-400 text-sm">leads este mês</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Leads Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLeads.map((lead, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{lead.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{lead.name}</p>
                        <p className="text-slate-400 text-sm">{lead.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary" className="text-slate-300">
                        {lead.source}
                      </Badge>
                      <div className="text-center">
                        <p className="text-white font-semibold">{lead.score}</p>
                        <p className="text-slate-400 text-xs">Score</p>
                      </div>
                      <span className="text-slate-400 text-sm">{lead.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
