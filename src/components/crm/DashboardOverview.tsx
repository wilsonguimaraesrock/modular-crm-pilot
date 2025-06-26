import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Calendar, Send, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const DashboardOverview = () => {
  const isMobile = useIsMobile();
  
  const [stats, setStats] = useState({
    leadsCapturados: 0,
    qualificadosIA: 0,
    reunioesAgendadas: 0,
    enviadosWhatsApp: 0
  });

  const [pipeline, setPipeline] = useState({
    novosLeads: 0,
    qualificados: 0,
    agendados: 0,
    fechados: 0
  });

  const statsDisplay = [
    { label: 'Leads Capturados', value: stats.leadsCapturados, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Qualificados pela IA', value: stats.qualificadosIA, icon: MessageSquare, color: 'from-blue-600 to-blue-700' },
    { label: 'Reuniões Agendadas', value: stats.reunioesAgendadas, icon: Calendar, color: 'from-blue-700 to-blue-800' },
    { label: 'Enviados WhatsApp', value: stats.enviadosWhatsApp, icon: Send, color: 'from-blue-800 to-blue-900' },
  ];

  const pipelineData = [
    { stage: 'Novos Leads', count: pipeline.novosLeads, color: 'bg-blue-500', progress: pipeline.novosLeads > 0 ? (pipeline.novosLeads / (pipeline.novosLeads + pipeline.qualificados + pipeline.agendados + pipeline.fechados)) * 100 : 0 },
    { stage: 'Qualificados', count: pipeline.qualificados, color: 'bg-blue-600', progress: pipeline.qualificados > 0 ? (pipeline.qualificados / (pipeline.novosLeads + pipeline.qualificados + pipeline.agendados + pipeline.fechados)) * 100 : 0 },
    { stage: 'Agendados', count: pipeline.agendados, color: 'bg-blue-700', progress: pipeline.agendados > 0 ? (pipeline.agendados / (pipeline.novosLeads + pipeline.qualificados + pipeline.agendados + pipeline.fechados)) * 100 : 0 },
    { stage: 'Fechados', count: pipeline.fechados, color: 'bg-blue-800', progress: pipeline.fechados > 0 ? (pipeline.fechados / (pipeline.novosLeads + pipeline.qualificados + pipeline.agendados + pipeline.fechados)) * 100 : 0 },
  ];

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
            <CardTitle className={`${
              isMobile ? 'text-lg' : 'text-xl'
            } font-semibold text-white flex items-center`}>
              <TrendingUp className="mr-2" size={isMobile ? 18 : 20} />
              Pipeline de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
            {pipeline.novosLeads === 0 && pipeline.qualificados === 0 && pipeline.agendados === 0 && pipeline.fechados === 0 ? (
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
                  ? 'grid-cols-2 gap-4' 
                  : 'grid-cols-1 md:grid-cols-4 gap-6'
              }`}>
                {pipelineData.map((stage, index) => (
                  <motion.div 
                    key={index} 
                    className={`text-center ${
                      isMobile ? 'space-y-2' : 'space-y-3'
                    }`}
                    whileHover={isMobile ? {} : { scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={`${
                      isMobile ? 'w-12 h-12' : 'w-16 h-16'
                    } ${stage.color} rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                      <span className={`text-white font-bold ${
                        isMobile ? 'text-base' : 'text-lg'
                      }`}>
                        {stage.count}
                      </span>
                    </div>
                    <p className={`text-slate-300 font-medium ${
                      isMobile ? 'text-xs' : ''
                    }`}>
                      {stage.stage}
                    </p>
                    <Progress value={stage.progress} className="h-2" />
                  </motion.div>
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
                <Button className={`${
                  isMobile ? 'w-full' : ''
                } bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800`}>
                  <Plus className="mr-2" size={18} />
                  Capturar Primeiro Lead
                </Button>
                <Button 
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
    </motion.div>
  );
};
