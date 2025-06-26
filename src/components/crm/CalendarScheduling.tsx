
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export const CalendarScheduling = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const availableSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const upcomingMeetings = [
    { client: 'Maria Silva', date: '2024-01-15', time: '10:00', status: 'Confirmado' },
    { client: 'João Santos', date: '2024-01-15', time: '14:00', status: 'Pendente' },
    { client: 'Ana Costa', date: '2024-01-16', time: '09:00', status: 'Confirmado' },
  ];

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      console.log('Agendamento:', { date: selectedDate, time: selectedTime });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h2 className="text-2xl font-semibold text-white mb-6">Agendamento de Reuniões</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Selecionar Data</h3>
            <div className="bg-slate-700/30 p-4 rounded-lg">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-700/50 border-slate-600 text-white rounded-lg p-2"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Horários Disponíveis</h3>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                  className={`${
                    selectedTime === time
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                      : 'bg-slate-700/30 border-slate-600 text-white hover:bg-slate-600/50'
                  }`}
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
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
        >
          <Calendar className="mr-2" size={18} />
          Agendar Reunião
        </Button>
      </Card>

      {/* Upcoming Meetings */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Reuniões Agendadas</h3>
        <div className="space-y-3">
          {upcomingMeetings.map((meeting, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="text-white" size={18} />
                </div>
                <div>
                  <p className="text-white font-medium">{meeting.client}</p>
                  <p className="text-slate-400 text-sm">
                    {new Date(meeting.date).toLocaleDateString('pt-BR')} às {meeting.time}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                meeting.status === 'Confirmado' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {meeting.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Google Calendar Integration */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Integração com Google Calendar</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300">
              Conecte sua conta do Google para sincronização automática
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Status: Não conectado
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Conectar Google Calendar
          </Button>
        </div>
      </Card>
    </div>
  );
};
