import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { useDatabaseAuth } from '@/contexts/DatabaseAuthContext';

export const CalendarScheduling = () => {
  const isMobile = useIsMobile();
  const { user, getAppointmentsBySchool, createAppointment } = useDatabaseAuth();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const availableSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Buscar agendamentos reais do sistema
  const upcomingMeetings = user ? getAppointmentsBySchool(user.schoolId) : [];

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      console.log('Agendamento:', { date: selectedDate, time: selectedTime });
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
      <motion.div variants={item}>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <h2 className={`${
              isMobile ? 'text-xl' : 'text-2xl'
            } font-semibold text-white mb-6`}>
              Agendamento de Reuniões
            </h2>
            
            <div className={`grid ${
              isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'
            }`}>
              {/* Calendar Selection */}
              <div>
                <h3 className={`${
                  isMobile ? 'text-base' : 'text-lg'
                } font-semibold text-white mb-4`}>
                  Selecionar Data
                </h3>
                <div className={`bg-slate-700/30 ${
                  isMobile ? 'p-3' : 'p-4'
                } rounded-lg`}>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`w-full bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-lg ${
                      isMobile ? 'p-3 h-12' : 'p-2'
                    }`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <h3 className={`${
                  isMobile ? 'text-base' : 'text-lg'
                } font-semibold text-white mb-4`}>
                  Horários Disponíveis
                </h3>
                <div className={`grid ${
                  isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-3 gap-2'
                }`}>
                  {availableSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size={isMobile ? "sm" : "default"}
                      onClick={() => setSelectedTime(time)}
                      className={`${
                        selectedTime === time
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                          : 'bg-slate-700/30 border-slate-600 text-white hover:bg-slate-600/50'
                      } ${isMobile ? 'h-10 text-sm' : ''}`}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSchedule}
              disabled={!selectedDate || !selectedTime}
              className={`w-full ${
                isMobile ? 'mt-4 h-12' : 'mt-6'
              } bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50`}
            >
              <Calendar className="mr-2" size={18} />
              Agendar Reunião
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Upcoming Meetings */}
      <motion.div variants={item}>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <h3 className={`${
              isMobile ? 'text-base' : 'text-lg'
            } font-semibold text-white mb-4`}>
              Reuniões Agendadas
            </h3>
            <div className={`space-y-${isMobile ? '2' : '3'}`}>
              {upcomingMeetings.map((meeting, index) => (
                <motion.div 
                  key={index} 
                  className={`flex ${
                    isMobile 
                      ? 'flex-col space-y-2 p-3' 
                      : 'items-center justify-between p-4'
                  } bg-slate-700/30 rounded-lg`}
                  whileHover={isMobile ? {} : { x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${
                      isMobile ? 'w-8 h-8' : 'w-10 h-10'
                    } bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center`}>
                      <Calendar className="text-white" size={isMobile ? 14 : 18} />
                    </div>
                    <div>
                      <p className={`text-white font-medium ${
                        isMobile ? 'text-sm' : ''
                      }`}>
                        {meeting.leadName}
                      </p>
                      <p className={`text-slate-400 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        {new Date(meeting.date).toLocaleDateString('pt-BR')} às {meeting.time}
                      </p>
                      <p className={`text-slate-500 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        {meeting.type === 'online' ? '🌐 Online' : '🏢 Presencial'}
                      </p>
                    </div>
                  </div>
                  <span className={`${
                    isMobile ? 'self-start ml-12' : ''
                  } px-3 py-1 rounded-full text-xs font-medium ${
                    meeting.status === 'confirmado' || meeting.status === 'agendado' 
                      ? 'bg-green-500/20 text-green-400' 
                      : meeting.status === 'realizado'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Google Calendar Integration */}
      <motion.div variants={item}>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <h3 className={`${
              isMobile ? 'text-base' : 'text-lg'
            } font-semibold text-white mb-4`}>
              Integração com Google Calendar
            </h3>
            <div className={`flex ${
              isMobile ? 'flex-col space-y-3' : 'items-center justify-between'
            }`}>
              <div>
                <p className={`text-slate-300 ${
                  isMobile ? 'text-sm' : ''
                }`}>
                  Conecte sua conta do Google para sincronização automática
                </p>
                <p className={`text-slate-400 ${
                  isMobile ? 'text-xs' : 'text-sm'
                } mt-1`}>
                  Status: Não conectado
                </p>
              </div>
              <Button 
                className={`${
                  isMobile ? 'w-full h-10' : ''
                } bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700`}
                size={isMobile ? "sm" : "default"}
              >
                Conectar Google Calendar
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
