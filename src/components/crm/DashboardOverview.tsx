
import { Card } from '@/components/ui/card';
import { Users, MessageSquare, Calendar, Send } from 'lucide-react';

export const DashboardOverview = () => {
  const stats = [
    { label: 'Leads Capturados', value: '127', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Qualificados pela IA', value: '89', icon: MessageSquare, color: 'from-purple-500 to-purple-600' },
    { label: 'Reuniões Agendadas', value: '34', icon: Calendar, color: 'from-green-500 to-green-600' },
    { label: 'Enviados WhatsApp', value: '23', icon: Send, color: 'from-orange-500 to-orange-600' },
  ];

  const recentLeads = [
    { name: 'Maria Silva', email: 'maria@email.com', score: 95, status: 'Qualificado' },
    { name: 'João Santos', email: 'joao@email.com', score: 78, status: 'Em Análise' },
    { name: 'Ana Costa', email: 'ana@email.com', score: 92, status: 'Agendado' },
    { name: 'Pedro Lima', email: 'pedro@email.com', score: 85, status: 'Qualificado' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pipeline Visual */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Pipeline de Vendas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { stage: 'Novos Leads', count: 45, color: 'bg-blue-500' },
            { stage: 'Qualificados', count: 32, color: 'bg-purple-500' },
            { stage: 'Agendados', count: 18, color: 'bg-green-500' },
            { stage: 'Fechados', count: 12, color: 'bg-orange-500' },
          ].map((stage, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${stage.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <span className="text-white font-bold text-lg">{stage.count}</span>
              </div>
              <p className="text-slate-300 font-medium">{stage.stage}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Leads */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Leads Recentes</h3>
        <div className="space-y-3">
          {recentLeads.map((lead, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{lead.name[0]}</span>
                </div>
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
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  lead.status === 'Qualificado' ? 'bg-green-500/20 text-green-400' :
                  lead.status === 'Agendado' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {lead.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
