import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertCircle, BarChart3, TrendingUp, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { useDatabaseAuth } from '@/contexts/DatabaseAuthContext';
import { format, isToday, isTomorrow, isAfter, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AttendanceStatus {
  id: string;
  status: 'agendado' | 'compareceu' | 'nao_compareceu' | 'em_fechamento' | 'matriculou' | 'nao_matriculou' | 'reagendado';
  updatedAt: Date;
  notes?: string;
}

export const AttendanceModule = () => {
  const { user, getAppointmentsBySchool, updateAppointment, getSellersBySchool } = useDatabaseAuth();
  const isMobile = useIsMobile();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [attendanceStatuses, setAttendanceStatuses] = useState<AttendanceStatus[]>([]);

  const schoolId = user?.schoolId || '';
  const appointments = getAppointmentsBySchool(schoolId);
  const sellers = getSellersBySchool(schoolId);

  // Organizar appointments por categorias
  const organizedAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return isToday(aptDate) && apt.status === 'agendado';
    });

    const upcomingAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return isAfter(aptDate, today) && !isToday(aptDate) && apt.status === 'agendado';
    });

    const completedAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return apt.status !== 'agendado' && apt.status !== 'cancelado';
    });

    return {
      today: todayAppointments,
      upcoming: upcomingAppointments,
      completed: completedAppointments
    };
  }, [appointments]);

  // Calcular métricas mensais
  const monthlyMetrics = useMemo(() => {
    const monthStart = startOfMonth(new Date(selectedMonth));
    const monthEnd = endOfMonth(new Date(selectedMonth));
    
    const monthlyAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= monthStart && aptDate <= monthEnd;
    });

    const totalAgendados = monthlyAppointments.length;
    const compareceram = monthlyAppointments.filter(apt => 
      apt.status === 'compareceu' || apt.status === 'em_fechamento' || apt.status === 'matriculou'
    ).length;
    const matricularam = monthlyAppointments.filter(apt => apt.status === 'matriculou').length;
    const naoCompareceram = monthlyAppointments.filter(apt => apt.status === 'nao_compareceu').length;

    const taxaComparecimento = totalAgendados > 0 ? (compareceram / totalAgendados * 100) : 0;
    const taxaMatricula = compareceram > 0 ? (matricularam / compareceram * 100) : 0;
    const taxaConversao = totalAgendados > 0 ? (matricularam / totalAgendados * 100) : 0;

    return {
      totalAgendados,
      compareceram,
      matricularam,
      naoCompareceram,
      taxaComparecimento,
      taxaMatricula,
      taxaConversao
    };
  }, [appointments, selectedMonth]);

  // Função para atualizar status do atendimento
  const updateAttendanceStatus = async (appointmentId: string, newStatus: AttendanceStatus['status'], notes?: string) => {
    await updateAppointment(appointmentId, { 
      status: newStatus as any,
      notes: notes || ''
    });
  };

  // Função para obter vendedor por ID
  const getSellerById = (sellerId?: string) => {
    if (!sellerId) return null;
    return sellers.find(seller => seller.id === sellerId);
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'compareceu': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'nao_compareceu': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'em_fechamento': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'matriculou': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'nao_matriculou': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'compareceu': return 'Compareceu';
      case 'nao_compareceu': return 'Não Compareceu';
      case 'em_fechamento': return 'Em Fechamento';
      case 'matriculou': return 'Matriculou';
      case 'nao_matriculou': return 'Não Matriculou';
      default: return 'Indefinido';
    }
  };

  // Função para verificar se é passado
  const isPastAppointment = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return isAfter(new Date(), appointmentDateTime);
  };

  // Componente do Card de Atendimento
  const AttendanceCard = ({ appointment }: { appointment: any }) => {
    const seller = getSellerById(appointment.assignedTo);
    const isPast = isPastAppointment(appointment.date, appointment.time);
    const canTakeActions = isPast && appointment.status === 'agendado';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white">
                {appointment.leadName}
              </CardTitle>
              <Badge className={`px-2 py-1 text-xs border ${getStatusColor(appointment.status)}`}>
                {getStatusText(appointment.status)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{appointment.time}</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-300">
              <User className="h-4 w-4" />
              <span className="text-sm">{seller?.name || 'Vendedor não definido'}</span>
            </div>
            
            {appointment.leadPhone && (
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{appointment.leadPhone}</span>
              </div>
            )}

            {/* Botões de ação para atendimentos passados */}
            {canTakeActions && (
              <div className="pt-2 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateAttendanceStatus(appointment.id, 'compareceu')}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Compareceu
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateAttendanceStatus(appointment.id, 'nao_compareceu')}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Não Compareceu
                  </Button>
                </div>
              </div>
            )}

            {/* Botões de fechamento para quem compareceu */}
            {appointment.status === 'compareceu' && (
              <div className="pt-2 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateAttendanceStatus(appointment.id, 'em_fechamento')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Em Fechamento
                  </Button>
                </div>
              </div>
            )}

            {/* Botões de matrícula para quem está em fechamento */}
            {appointment.status === 'em_fechamento' && (
              <div className="pt-2 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateAttendanceStatus(appointment.id, 'matriculou')}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Matriculou
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateAttendanceStatus(appointment.id, 'nao_matriculou')}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-xs"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Não Matriculou
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">🎯 Atendimentos</h1>
      </div>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
          <TabsTrigger 
            value="attendance" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Atendimentos
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          {/* Seção Hoje */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              📅 Hoje ({organizedAppointments.today.length})
            </h2>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {organizedAppointments.today.map((appointment) => (
                <AttendanceCard key={appointment.id} appointment={appointment} />
              ))}
              {organizedAppointments.today.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-slate-400">Nenhum atendimento agendado para hoje</p>
                </div>
              )}
            </div>
          </div>

          {/* Seção Próximos */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              📅 Próximos ({organizedAppointments.upcoming.length})
            </h2>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {organizedAppointments.upcoming.map((appointment) => (
                <AttendanceCard key={appointment.id} appointment={appointment} />
              ))}
              {organizedAppointments.upcoming.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-slate-400">Nenhum atendimento próximo agendado</p>
                </div>
              )}
            </div>
          </div>

          {/* Seção Realizados */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              ✅ Realizados ({organizedAppointments.completed.length})
            </h2>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {organizedAppointments.completed.slice(0, 6).map((appointment) => (
                <AttendanceCard key={appointment.id} appointment={appointment} />
              ))}
              {organizedAppointments.completed.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-slate-400">Nenhum atendimento realizado ainda</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">📊 Relatórios Mensais</h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-white"
            />
          </div>

          {/* Cards de Métricas */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'}`}>
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Agendados</p>
                    <p className="text-2xl font-bold text-white">{monthlyMetrics.totalAgendados}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Compareceram</p>
                    <p className="text-2xl font-bold text-green-400">{monthlyMetrics.compareceram}</p>
                    <p className="text-xs text-slate-500">{monthlyMetrics.taxaComparecimento.toFixed(1)}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Matricularam</p>
                    <p className="text-2xl font-bold text-purple-400">{monthlyMetrics.matricularam}</p>
                    <p className="text-xs text-slate-500">{monthlyMetrics.taxaMatricula.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Taxa Conversão</p>
                    <p className="text-2xl font-bold text-yellow-400">{monthlyMetrics.taxaConversao.toFixed(1)}%</p>
                    <p className="text-xs text-slate-500">Agendado → Matrícula</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Detalhado */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Resumo do Mês</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Total de Agendamentos:</p>
                  <p className="text-white font-semibold">{monthlyMetrics.totalAgendados}</p>
                </div>
                <div>
                  <p className="text-slate-400">Não Compareceram:</p>
                  <p className="text-red-400 font-semibold">{monthlyMetrics.naoCompareceram}</p>
                </div>
                <div>
                  <p className="text-slate-400">Taxa de Comparecimento:</p>
                  <p className="text-green-400 font-semibold">{monthlyMetrics.taxaComparecimento.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Taxa de Matrícula:</p>
                  <p className="text-purple-400 font-semibold">{monthlyMetrics.taxaMatricula.toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-700/50">
                <p className="text-slate-400 text-sm">
                  De <span className="text-white font-semibold">{monthlyMetrics.totalAgendados}</span> agendamentos,{' '}
                  <span className="text-green-400 font-semibold">{monthlyMetrics.compareceram}</span> compareceram e{' '}
                  <span className="text-purple-400 font-semibold">{monthlyMetrics.matricularam}</span> se matricularam.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 