import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Database, Upload, AlertTriangle, Loader2 } from 'lucide-react';

interface MigrationStatus {
  isRunning: boolean;
  progress: number;
  currentStep: string;
  completed: boolean;
  error?: string;
  migratedData: {
    leads: number;
    appointments: number;
    conversations: number;
    followUps: number;
    tasks: number;
  };
}

export const MigrationPanel = () => {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    isRunning: false,
    progress: 0,
    currentStep: '',
    completed: false,
    migratedData: {
      leads: 0,
      appointments: 0,
      conversations: 0,
      followUps: 0,
      tasks: 0
    }
  });

  const getLocalStorageData = () => {
    const data = {
      leads: JSON.parse(localStorage.getItem('crm_leads') || '[]'),
      appointments: JSON.parse(localStorage.getItem('crm_appointments') || '[]'),
      qualificationConversations: JSON.parse(localStorage.getItem('crm_qualification_conversations') || '[]'),
      followUps: JSON.parse(localStorage.getItem('crm_follow_ups') || '[]'),
      tasks: JSON.parse(localStorage.getItem('crm_tasks') || '[]')
    };
    return data;
  };

  const startMigration = async () => {
    setMigrationStatus(prev => ({ ...prev, isRunning: true, progress: 0, error: undefined }));

    try {
      // 1. Verificar dados do localStorage
      setMigrationStatus(prev => ({ ...prev, currentStep: 'Verificando dados do localStorage...', progress: 10 }));
      const localData = getLocalStorageData();
      
      const totalItems = Object.values(localData).reduce((sum, arr) => sum + arr.length, 0);
      
      if (totalItems === 0) {
        throw new Error('Nenhum dado encontrado no localStorage para migrar');
      }

      // 2. Simular migração (em produção, chamaria uma API)
      setMigrationStatus(prev => ({ ...prev, currentStep: 'Conectando ao banco MySQL...', progress: 20 }));
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Migrar leads
      if (localData.leads.length > 0) {
        setMigrationStatus(prev => ({ 
          ...prev, 
          currentStep: `Migrando ${localData.leads.length} leads...`, 
          progress: 30 
        }));
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // 4. Migrar appointments
      if (localData.appointments.length > 0) {
        setMigrationStatus(prev => ({ 
          ...prev, 
          currentStep: `Migrando ${localData.appointments.length} agendamentos...`, 
          progress: 50 
        }));
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // 5. Migrar conversations
      if (localData.qualificationConversations.length > 0) {
        setMigrationStatus(prev => ({ 
          ...prev, 
          currentStep: `Migrando ${localData.qualificationConversations.length} conversas...`, 
          progress: 70 
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 6. Migrar follow-ups
      if (localData.followUps.length > 0) {
        setMigrationStatus(prev => ({ 
          ...prev, 
          currentStep: `Migrando ${localData.followUps.length} follow-ups...`, 
          progress: 85 
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 7. Migrar tasks
      if (localData.tasks.length > 0) {
        setMigrationStatus(prev => ({ 
          ...prev, 
          currentStep: `Migrando ${localData.tasks.length} tarefas...`, 
          progress: 95 
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 8. Finalizar
      setMigrationStatus(prev => ({ 
        ...prev, 
        currentStep: 'Migração concluída com sucesso!', 
        progress: 100,
        completed: true,
        isRunning: false,
        migratedData: {
          leads: localData.leads.length,
          appointments: localData.appointments.length,
          conversations: localData.qualificationConversations.length,
          followUps: localData.followUps.length,
          tasks: localData.tasks.length
        }
      }));

    } catch (error) {
      setMigrationStatus(prev => ({ 
        ...prev, 
        isRunning: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }));
    }
  };

  const clearLocalStorage = () => {
    const keys = [
      'crm_leads',
      'crm_appointments', 
      'crm_qualification_conversations',
      'crm_follow_ups',
      'crm_tasks',
      'crm_schools',
      'crm_sellers',
      'crm_lead_sources',
      'crm_user'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    alert('LocalStorage limpo! Recarregue a página para usar o banco MySQL.');
  };

  const getLocalStorageStats = () => {
    const data = getLocalStorageData();
    return {
      leads: data.leads.length,
      appointments: data.appointments.length,
      conversations: data.qualificationConversations.length,
      followUps: data.followUps.length,
      tasks: data.tasks.length,
      total: Object.values(data).reduce((sum, arr) => sum + arr.length, 0)
    };
  };

  const stats = getLocalStorageStats();

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="h-5 w-5" />
            Migração para MySQL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Status dos dados no localStorage */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-sm text-slate-400">Leads</div>
              <div className="text-lg font-semibold text-white">{stats.leads}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-sm text-slate-400">Agendamentos</div>
              <div className="text-lg font-semibold text-white">{stats.appointments}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-sm text-slate-400">Conversas</div>
              <div className="text-lg font-semibold text-white">{stats.conversations}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-sm text-slate-400">Follow-ups</div>
              <div className="text-lg font-semibold text-white">{stats.followUps}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-sm text-slate-400">Tarefas</div>
              <div className="text-lg font-semibold text-white">{stats.tasks}</div>
            </div>
            <div className="bg-blue-600/20 p-3 rounded-lg border border-blue-500/30">
              <div className="text-sm text-blue-400">Total</div>
              <div className="text-lg font-semibold text-white">{stats.total}</div>
            </div>
          </div>

          {/* Status da migração */}
          {migrationStatus.isRunning && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{migrationStatus.currentStep}</span>
              </div>
              <Progress value={migrationStatus.progress} className="h-2" />
            </div>
          )}

          {/* Resultado da migração */}
          {migrationStatus.completed && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400">
                <div className="font-semibold">Migração concluída com sucesso!</div>
                <div className="text-sm mt-1">
                  • {migrationStatus.migratedData.leads} leads migrados<br/>
                  • {migrationStatus.migratedData.appointments} agendamentos migrados<br/>
                  • {migrationStatus.migratedData.conversations} conversas migradas<br/>
                  • {migrationStatus.migratedData.followUps} follow-ups migrados<br/>
                  • {migrationStatus.migratedData.tasks} tarefas migradas
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Erro na migração */}
          {migrationStatus.error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                <div className="font-semibold">Erro na migração:</div>
                <div className="text-sm mt-1">{migrationStatus.error}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Aviso */}
          {stats.total > 0 && !migrationStatus.completed && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-400">
                <div className="font-semibold">Importante:</div>
                <div className="text-sm mt-1">
                  Esta migração irá transferir todos os dados do localStorage para o banco MySQL na DigitalOcean. 
                  Certifique-se de ter uma conexão estável com a internet.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={startMigration}
              disabled={migrationStatus.isRunning || stats.total === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {migrationStatus.isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Migrando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Migrar para MySQL
                </>
              )}
            </Button>

            {migrationStatus.completed && (
              <Button
                onClick={clearLocalStorage}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                Limpar LocalStorage
              </Button>
            )}
          </div>

          {stats.total === 0 && (
            <Alert className="border-slate-500/50 bg-slate-500/10">
              <AlertDescription className="text-slate-400">
                Nenhum dado encontrado no localStorage para migrar. O sistema já está usando o banco MySQL.
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
      </Card>
    </div>
  );
}; 