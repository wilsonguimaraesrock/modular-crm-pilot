
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Users, MessageSquare } from 'lucide-react';

export const AdminPanel = () => {
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

  const [salesTeam, setSalesTeam] = useState([
    { name: 'Carlos Silva', phone: '+55 11 99999-9999', role: 'Vendedor Senior', active: true },
    { name: 'Ana Santos', phone: '+55 11 88888-8888', role: 'Vendedora Pleno', active: true },
    { name: 'Pedro Costa', phone: '+55 11 77777-7777', role: 'Vendedor Junior', active: false },
  ]);

  const systemSettings = {
    workingHours: { start: '09:00', end: '18:00' },
    timezone: 'America/Sao_Paulo',
    autoQualification: true,
    whatsappIntegration: true,
    emailNotifications: true,
  };

  return (
    <div className="space-y-6">
      {/* AI Prompt Configuration */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <MessageSquare className="mr-2" />
          Configuração da IA
        </h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="ai-prompt" className="text-slate-300">Prompt do SDR Virtual</Label>
            <Textarea
              id="ai-prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={12}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Salvar Configurações da IA
          </Button>
        </div>
      </Card>

      {/* Sales Team Management */}
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

      {/* System Settings */}
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
    </div>
  );
};
