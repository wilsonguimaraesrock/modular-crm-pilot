
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, MessageSquare, Calendar, Send, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardOverview = () => {
  const stats = [
    { label: 'Leads Capturados', value: '127', icon: Users, color: 'from-blue-500 to-blue-600', trend: '+12%' },
    { label: 'Qualificados pela IA', value: '89', icon: MessageSquare, color: 'from-purple-500 to-purple-600', trend: '+8%' },
    { label: 'Reuniões Agendadas', value: '34', icon: Calendar, color: 'from-green-500 to-green-600', trend: '+15%' },
    { label: 'Enviados WhatsApp', value: '23', icon: Send, color: 'from-orange-500 to-orange-600', trend: '+5%' },
  ];

  const recentLeads = [
    { name: 'Maria Silva', email: 'maria@email.com', score: 95, status: 'Qualificado', time: '2min' },
    { name: 'João Santos', email: 'joao@email.com', score: 78, status: 'Em Análise', time: '5min' },
    { name: 'Ana Costa', email: 'ana@email.com', score: 92, status: 'Agendado', time: '10min' },
    { name: 'Pedro Lima', email: 'pedro@email.com', score: 85, status: 'Qualificado', time: '15min' },
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
                        <Badge variant="secondary" className="text-green-400 bg-green-400/10">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {stat.trend}
                        </Badge>
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
                { stage: 'Novos Leads', count: 45, color: 'bg-blue-500', progress: 75 },
                { stage: 'Qualificados', count: 32, color: 'bg-purple-500', progress: 60 },
                { stage: 'Agendados', count: 18, color: 'bg-green-500', progress: 45 },
                { stage: 'Fechados', count: 12, color: 'bg-orange-500', progress: 30 },
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

      {/* Recent Leads */}
      <motion.div variants={item}>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-white">Leads Recentes</CardTitle>
            <Button variant="outline" size="sm" className="text-slate-300 border-slate-600 hover:bg-slate-700">
              Ver Todos
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads.map((lead, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-slate-600"
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                        {lead.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{lead.name}</p>
                      <p className="text-slate-400 text-sm">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-white font-semibold">{lead.score}</p>
                      <p className="text-slate-400 text-xs">Score</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        lead.status === 'Qualificado' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                        lead.status === 'Agendado' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                        'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      }>
                        {lead.status}
                      </Badge>
                      <div className="flex items-center text-slate-400 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {lead.time}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
