
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Calendar, Send, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardOverview = () => {
  const stats = [
    { label: 'Leads Capturados', value: '0', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Qualificados pela IA', value: '0', icon: MessageSquare, color: 'from-blue-600 to-blue-700' },
    { label: 'Reuniões Agendadas', value: '0', icon: Calendar, color: 'from-blue-700 to-blue-800' },
    { label: 'Enviados WhatsApp', value: '0', icon: Send, color: 'from-blue-800 to-blue-900' },
  ];

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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={item}>
              <Card className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white" size={24} />
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
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <TrendingUp className="mr-2" />
              Pipeline de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { stage: 'Novos Leads', count: 0, color: 'bg-blue-500', progress: 0 },
                { stage: 'Qualificados', count: 0, color: 'bg-blue-600', progress: 0 },
                { stage: 'Agendados', count: 0, color: 'bg-blue-700', progress: 0 },
                { stage: 'Fechados', count: 0, color: 'bg-blue-800', progress: 0 },
              ].map((stage, index) => (
                <motion.div 
                  key={index} 
                  className="text-center space-y-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={`w-16 h-16 ${stage.color} rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                    <span className="text-white font-bold text-lg">{stage.count}</span>
                  </div>
                  <p className="text-slate-300 font-medium">{stage.stage}</p>
                  <Progress value={stage.progress} className="h-2" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Welcome Card */}
      <motion.div variants={item}>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">Bem-vindo ao CRM Inteligente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-slate-300">
                Seu sistema está pronto para começar. Configure as integrações e comece a capturar leads.
              </p>
              <div className="flex space-x-3">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Plus className="mr-2" size={18} />
                  Capturar Primeiro Lead
                </Button>
                <Button variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
                  Configurar Integrações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
