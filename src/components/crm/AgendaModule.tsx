import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Plus, CheckCircle, AlertCircle, TrendingUp, Target, Filter, CalendarDays, BarChart3 } from 'lucide-react';
import { useDatabaseAuth, Task } from '@/contexts/DatabaseAuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

// Interface para as props dos componentes de visualização
interface CalendarViewProps {
  tasks: Task[];
  selectedDate: Date;
  onCompleteTask: (taskId: string) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  sellers: any[];
}

// Componente de Visualização Diária - Timeline com horas
const DailyCalendarView: React.FC<CalendarViewProps> = ({ tasks, selectedDate, onCompleteTask, getPriorityColor, getStatusColor, sellers }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getTasksForHour = (hour: number) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledDate);
      return taskDate.getHours() === hour;
    });
  };
  
  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Agenda do Dia - {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {hours.map(hour => {
            const hourTasks = getTasksForHour(hour);
            return (
              <div key={hour} className="flex border-b border-slate-700/50">
                <div className="w-16 text-sm text-slate-400 py-3 pr-4">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 min-h-[60px] py-2">
                  {hourTasks.length > 0 ? (
                    <div className="space-y-1">
                      {hourTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded border-l-4 border-blue-500">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-white text-sm">{task.title}</h4>
                              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-xs">{task.description}</p>
                          </div>
                          {task.status === 'pendente' && (
                            <Button
                              size="sm"
                              onClick={() => onCompleteTask(task.id)}
                              className="bg-green-600 hover:bg-green-700 text-white ml-2"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center text-slate-500 text-xs">
                      {/* Horário vazio */}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de Visualização Semanal - 7 colunas
const WeeklyCalendarView: React.FC<CalendarViewProps> = ({ tasks, selectedDate, onCompleteTask, getPriorityColor, getStatusColor, sellers }) => {
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(day.getDate() + i);
    return day;
  });
  
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledDate);
      return taskDate.toDateString() === day.toDateString();
    });
  };
  
  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <CalendarDays className="w-5 h-5 mr-2" />
          Visualização Semanal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div key={index} className={`border border-slate-600 rounded-lg p-3 min-h-[200px] ${isToday ? 'bg-blue-500/10 border-blue-500' : 'bg-slate-700/20'}`}>
                <div className="text-center mb-3">
                  <div className="text-xs text-slate-400">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                  <div className={`text-lg font-semibold ${isToday ? 'text-blue-400' : 'text-white'}`}>
                    {day.getDate()}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {dayTasks.map(task => (
                    <div key={task.id} className="p-2 bg-slate-600/30 rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium truncate">{task.title}</span>
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-slate-400">
                        {new Date(task.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {task.status === 'pendente' && (
                        <Button
                          size="sm"
                          onClick={() => onCompleteTask(task.id)}
                          className="w-full mt-1 bg-green-600 hover:bg-green-700 text-white h-6 text-xs"
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de Visualização Mensal - Grade de calendário
const MonthlyCalendarView: React.FC<CalendarViewProps> = ({ tasks, selectedDate, onCompleteTask, getPriorityColor, getStatusColor, sellers }) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledDate);
      return taskDate.toDateString() === day.toDateString();
    });
  };
  
  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          {selectedDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grade do calendário */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = day.getMonth() === month;
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index} 
                className={`border border-slate-600 p-2 h-24 text-xs ${
                  isCurrentMonth ? 'bg-slate-700/20' : 'bg-slate-800/50'
                } ${isToday ? 'bg-blue-500/20 border-blue-500' : ''}`}
              >
                <div className={`font-medium mb-1 ${
                  isCurrentMonth ? (isToday ? 'text-blue-400' : 'text-white') : 'text-slate-500'
                }`}>
                  {day.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div 
                      key={task.id} 
                      className={`px-1 py-0.5 rounded text-xs truncate ${getPriorityColor(task.priority)}`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-slate-400 text-xs">
                      +{dayTasks.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de Visualização Anual - Overview por mês
const YearlyCalendarView: React.FC<CalendarViewProps> = ({ tasks, selectedDate, onCompleteTask, getPriorityColor, getStatusColor, sellers }) => {
  const year = selectedDate.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i);
  
  const getTasksForMonth = (month: number) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledDate);
      return taskDate.getMonth() === month;
    });
  };
  
  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Visão Anual - {year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {months.map(month => {
            const monthTasks = getTasksForMonth(month);
            const completed = monthTasks.filter(t => t.status === 'concluido').length;
            const pending = monthTasks.filter(t => t.status === 'pendente').length;
            
            return (
              <div key={month} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                <h3 className="text-white font-medium mb-2">
                  {new Date(year, month).toLocaleDateString('pt-BR', { month: 'long' })}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total:</span>
                    <span className="text-white">{monthTasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Concluídas:</span>
                    <span className="text-green-400">{completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pendentes:</span>
                    <span className="text-yellow-400">{pending}</span>
                  </div>
                  
                  {monthTasks.length > 0 && (
                    <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(completed / monthTasks.length) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

type CalendarView = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface NewTaskData {
  title: string;
  description: string;
  priority: 'alta' | 'media' | 'baixa';
  scheduledDate: string;
  category: string;
  estimatedTime: string;
  assignedTo: string;
}

export const AgendaModule = () => {
  const { user, getAllTasksForAgenda, getTaskStats, updateTask, createTask, getSellersBySchool } = useDatabaseAuth();
  const isMobile = useIsMobile();
  const [view, setView] = useState<CalendarView>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState<NewTaskData>({
    title: '',
    description: '',
    priority: 'media',
    scheduledDate: new Date().toISOString().split('T')[0],
    category: 'vendas',
    estimatedTime: '30',
    assignedTo: ''
  });

  const schoolId = user?.schoolId || '';
  const allTasks = getAllTasksForAgenda(schoolId);
  const taskStats = getTaskStats(schoolId);
  const sellers = getSellersBySchool(schoolId);

  // Filtrar tarefas baseado na visualização selecionada
  const filteredTasks = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (view) {
      case 'daily':
        startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'yearly':
        startDate = new Date(selectedDate.getFullYear(), 0, 1);
        endDate = new Date(selectedDate.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date();
        endDate = new Date();
    }

    return allTasks.filter(task => {
      const taskDate = new Date(task.scheduledDate);
      return taskDate >= startDate && taskDate <= endDate;
    });
  }, [allTasks, view, selectedDate]);

  const handleCompleteTask = async (taskId: string) => {
    await updateTask(taskId, { 
      status: 'concluido', 
      completedDate: new Date() 
    });
  };

  const handleCreateTask = async () => {
    if (!newTaskData.title || !newTaskData.description) return;

    await createTask({
      title: newTaskData.title,
      description: newTaskData.description,
      type: 'manual',
      priority: newTaskData.priority,
      status: 'pendente',
      scheduledDate: new Date(newTaskData.scheduledDate),
      schoolId,
      assignedTo: newTaskData.assignedTo || user?.id,
      category: newTaskData.category,
      estimatedTime: parseInt(newTaskData.estimatedTime)
    });

    setNewTaskData({
      title: '',
      description: '',
      priority: 'media',
      scheduledDate: new Date().toISOString().split('T')[0],
      category: 'vendas',
      estimatedTime: '30',
      assignedTo: ''
    });
    setIsCreateDialogOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'media': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'baixa': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pendente': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelado': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getViewTitle = () => {
    switch (view) {
      case 'daily': return selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      case 'weekly': return `Semana de ${selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`;
      case 'monthly': return selectedDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
      case 'yearly': return selectedDate.getFullYear().toString();
      default: return '';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    switch (view) {
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header com título e filtros */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Agenda de Tarefas</CardTitle>
                <p className="text-slate-400 text-sm">Gerencie todas as suas tarefas e follow-ups</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Filtros de visualização */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <Select value={view} onValueChange={(value) => setView(value as CalendarView)}>
                  <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botão Nova Tarefa */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Tarefa
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Tarefa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={newTaskData.title}
                        onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                        className="bg-slate-700/50 border-slate-600"
                        placeholder="Ex: Ligar para lead João"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={newTaskData.description}
                        onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                        className="bg-slate-700/50 border-slate-600"
                        placeholder="Descreva os detalhes da tarefa..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select value={newTaskData.priority} onValueChange={(value) => setNewTaskData({...newTaskData, priority: value as 'alta' | 'media' | 'baixa'})}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="baixa">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Select value={newTaskData.category} onValueChange={(value) => setNewTaskData({...newTaskData, category: value})}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vendas">Vendas</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="administrativo">Administrativo</SelectItem>
                            <SelectItem value="atendimento">Atendimento</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scheduledDate">Data Agendada</Label>
                        <Input
                          id="scheduledDate"
                          type="date"
                          value={newTaskData.scheduledDate}
                          onChange={(e) => setNewTaskData({...newTaskData, scheduledDate: e.target.value})}
                          className="bg-slate-700/50 border-slate-600"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="estimatedTime">Tempo Estimado (min)</Label>
                        <Input
                          id="estimatedTime"
                          type="number"
                          value={newTaskData.estimatedTime}
                          onChange={(e) => setNewTaskData({...newTaskData, estimatedTime: e.target.value})}
                          className="bg-slate-700/50 border-slate-600"
                          placeholder="30"
                        />
                      </div>
                    </div>
                    
                    {sellers.length > 0 && (
                      <div>
                        <Label htmlFor="assignedTo">Responsável</Label>
                        <Select value={newTaskData.assignedTo} onValueChange={(value) => setNewTaskData({...newTaskData, assignedTo: value})}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600">
                            <SelectValue placeholder="Selecione um responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            {sellers.map(seller => (
                              <SelectItem key={seller.id} value={seller.id}>{seller.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleCreateTask}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Criar Tarefa
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cards de métricas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{taskStats.total}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">{taskStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Atrasadas</p>
                <p className="text-2xl font-bold text-red-400">{taskStats.overdue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Performance</p>
                <p className="text-2xl font-bold text-green-400">{taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navegação de calendário */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDate('prev')}
              className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50"
            >
              ← Anterior
            </Button>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">{getViewTitle()}</h3>
              <p className="text-sm text-slate-400">{filteredTasks.length} tarefas</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDate('next')}
              className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50"
            >
              Próximo →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualizações de Calendário */}
      {view === 'daily' && <DailyCalendarView tasks={filteredTasks} selectedDate={selectedDate} onCompleteTask={handleCompleteTask} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} sellers={sellers} />}
      {view === 'weekly' && <WeeklyCalendarView tasks={filteredTasks} selectedDate={selectedDate} onCompleteTask={handleCompleteTask} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} sellers={sellers} />}
      {view === 'monthly' && <MonthlyCalendarView tasks={filteredTasks} selectedDate={selectedDate} onCompleteTask={handleCompleteTask} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} sellers={sellers} />}
      {view === 'yearly' && <YearlyCalendarView tasks={filteredTasks} selectedDate={selectedDate} onCompleteTask={handleCompleteTask} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} sellers={sellers} />}
    </div>
  );
};
