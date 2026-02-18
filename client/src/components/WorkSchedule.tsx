import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  Medal,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sunrise,
  ArrowUpRight,
  Flame,
  Target,
  Award
} from "lucide-react";

// Mock data for schedule
const mockSchedule = {
  '2026-01-27': [
    { id: 1, name: 'Dr. Carlos', shift: 'morning', color: 'bg-blue-500' },
    { id: 2, name: 'Dra. Ana', shift: 'afternoon', color: 'bg-purple-500' },
    { id: 3, name: 'Dr. Roberto', shift: 'night', color: 'bg-green-500' },
  ],
  '2026-01-28': [
    { id: 2, name: 'Dra. Ana', shift: 'morning', color: 'bg-purple-500' },
    { id: 4, name: 'Dra. Fernanda', shift: 'afternoon', color: 'bg-amber-500' },
    { id: 1, name: 'Dr. Carlos', shift: 'night', color: 'bg-blue-500' },
  ],
  '2026-01-29': [
    { id: 3, name: 'Dr. Roberto', shift: 'morning', color: 'bg-green-500' },
    { id: 1, name: 'Dr. Carlos', shift: 'afternoon', color: 'bg-blue-500' },
    { id: 2, name: 'Dra. Ana', shift: 'night', color: 'bg-purple-500' },
  ],
  '2026-01-30': [
    { id: 4, name: 'Dra. Fernanda', shift: 'morning', color: 'bg-amber-500' },
    { id: 3, name: 'Dr. Roberto', shift: 'afternoon', color: 'bg-green-500' },
    { id: 5, name: 'Dr. João', shift: 'night', color: 'bg-red-500' },
  ],
  '2026-01-31': [
    { id: 1, name: 'Dr. Carlos', shift: 'morning', color: 'bg-blue-500' },
    { id: 5, name: 'Dr. João', shift: 'afternoon', color: 'bg-red-500' },
    { id: 4, name: 'Dra. Fernanda', shift: 'night', color: 'bg-amber-500' },
  ],
  '2026-02-01': [
    { id: 2, name: 'Dra. Ana', shift: 'morning', color: 'bg-purple-500' },
    { id: 4, name: 'Dra. Fernanda', shift: 'afternoon', color: 'bg-amber-500' },
    { id: 3, name: 'Dr. Roberto', shift: 'night', color: 'bg-green-500' },
  ],
  '2026-02-02': [
    { id: 5, name: 'Dr. João', shift: 'morning', color: 'bg-red-500' },
    { id: 1, name: 'Dr. Carlos', shift: 'afternoon', color: 'bg-blue-500' },
    { id: 2, name: 'Dra. Ana', shift: 'night', color: 'bg-purple-500' },
  ],
};

// Gamification data
const leaderboard = [
  { 
    id: 1, 
    name: 'Dr. Carlos Mendes', 
    initials: 'CM', 
    color: 'bg-blue-500',
    evolutions: 156,
    patients: 42,
    avgTime: '4.2 dias',
    points: 2850,
    streak: 12,
    badges: ['🏆', '⭐', '🔥']
  },
  { 
    id: 2, 
    name: 'Dra. Ana Paula', 
    initials: 'AP', 
    color: 'bg-purple-500',
    evolutions: 134,
    patients: 38,
    avgTime: '3.8 dias',
    points: 2640,
    streak: 8,
    badges: ['⭐', '💪']
  },
  { 
    id: 3, 
    name: 'Dr. Roberto Lima', 
    initials: 'RL', 
    color: 'bg-green-500',
    evolutions: 128,
    patients: 35,
    avgTime: '4.5 dias',
    points: 2420,
    streak: 5,
    badges: ['🎯']
  },
  { 
    id: 4, 
    name: 'Dra. Fernanda Costa', 
    initials: 'FC', 
    color: 'bg-amber-500',
    evolutions: 112,
    patients: 31,
    avgTime: '5.1 dias',
    points: 2180,
    streak: 3,
    badges: []
  },
  { 
    id: 5, 
    name: 'Dr. João Pedro', 
    initials: 'JP', 
    color: 'bg-red-500',
    evolutions: 98,
    patients: 28,
    avgTime: '4.8 dias',
    points: 1950,
    streak: 7,
    badges: ['🔥']
  },
];

const achievements = [
  { id: 1, name: 'Maratonista', description: '100 evoluções em um mês', icon: '🏃', unlocked: true },
  { id: 2, name: 'Velocista', description: 'Tempo médio de internação < 4 dias', icon: '⚡', unlocked: true },
  { id: 3, name: 'Dedicado', description: '30 dias consecutivos de atividade', icon: '🔥', unlocked: false, progress: 80 },
  { id: 4, name: 'Mentor', description: 'Ajudar 10 colegas com casos', icon: '🎓', unlocked: false, progress: 60 },
  { id: 5, name: 'Inovador', description: 'Usar todas as funcionalidades', icon: '💡', unlocked: false, progress: 45 },
];

interface WorkScheduleProps {
  isDemo?: boolean;
}

export default function WorkSchedule({ isDemo = false }: WorkScheduleProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date('2026-01-27'));
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeek);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getShiftIcon = (shift: string) => {
    switch (shift) {
      case 'morning': return <Sunrise className="w-3 h-3" />;
      case 'afternoon': return <Sun className="w-3 h-3" />;
      case 'night': return <Moon className="w-3 h-3" />;
      default: return null;
    }
  };

  const getShiftLabel = (shift: string) => {
    switch (shift) {
      case 'morning': return 'Manhã';
      case 'afternoon': return 'Tarde';
      case 'night': return 'Noite';
      default: return shift;
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const handleSwapShift = (date: string, doctorId: number) => {
    toast.success("Solicitação de troca enviada!", {
      description: "Os membros da equipe serão notificados."
    });
  };

  return (
    <Tabs defaultValue="schedule" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="schedule" className="gap-2">
          <Calendar className="w-4 h-4" />
          Escala
        </TabsTrigger>
        <TabsTrigger value="leaderboard" className="gap-2">
          <Trophy className="w-4 h-4" />
          Ranking
        </TabsTrigger>
        <TabsTrigger value="achievements" className="gap-2">
          <Award className="w-4 h-4" />
          Conquistas
        </TabsTrigger>
      </TabsList>

      {/* Schedule Tab */}
      <TabsContent value="schedule" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Escala de Trabalho</CardTitle>
                <CardDescription>
                  Semana de {weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} a {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dateStr = formatDate(day);
                const shifts = mockSchedule[dateStr as keyof typeof mockSchedule] || [];
                const isToday = dateStr === '2026-01-31';
                
                return (
                  <div 
                    key={dateStr}
                    className={`border rounded-lg p-2 ${isToday ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <div className="text-center mb-2">
                      <p className="text-xs text-muted-foreground">
                        {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </p>
                      <p className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                        {day.getDate()}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      {['morning', 'afternoon', 'night'].map(shift => {
                        const doctor = shifts.find(s => s.shift === shift);
                        return (
                          <div 
                            key={shift}
                            className={`p-1.5 rounded text-xs ${
                              doctor ? 'bg-muted' : 'bg-red-50 border border-dashed border-red-200'
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-1 text-muted-foreground">
                              {getShiftIcon(shift)}
                              <span>{getShiftLabel(shift)}</span>
                            </div>
                            {doctor ? (
                              <div className="flex items-center gap-1">
                                <div className={`w-4 h-4 rounded-full ${doctor.color} flex items-center justify-center`}>
                                  <span className="text-[8px] text-white font-bold">
                                    {doctor.name.split(' ').pop()?.charAt(0)}
                                  </span>
                                </div>
                                <span className="truncate">{doctor.name.split(' ').pop()}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-red-500">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Vago</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Sunrise className="w-4 h-4" />
                <span>Manhã (7h-13h)</span>
              </div>
              <div className="flex items-center gap-1">
                <Sun className="w-4 h-4" />
                <span>Tarde (13h-19h)</span>
              </div>
              <div className="flex items-center gap-1">
                <Moon className="w-4 h-4" />
                <span>Noite (19h-7h)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workload Balance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Balanceamento de Carga</CardTitle>
            <CardDescription>Distribuição de plantões este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.slice(0, 4).map((doctor, index) => {
                const shifts = 8 + Math.floor(Math.random() * 5);
                const avgShifts = 10;
                const balance = (shifts / avgShifts) * 100;
                
                return (
                  <div key={doctor.id} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={doctor.color}>
                        {doctor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{doctor.name}</span>
                        <span className="text-muted-foreground">{shifts} plantões</span>
                      </div>
                      <Progress value={balance} className={balance > 110 ? 'bg-red-100' : balance < 90 ? 'bg-amber-100' : ''} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Leaderboard Tab */}
      <TabsContent value="leaderboard" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Ranking da Equipe
                </CardTitle>
                <CardDescription>Janeiro 2026</CardDescription>
              </div>
              <Select defaultValue="month">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((doctor, index) => (
                <div 
                  key={doctor.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    index === 0 ? 'bg-amber-50 border border-amber-200' :
                    index === 1 ? 'bg-gray-50 border border-gray-200' :
                    index === 2 ? 'bg-orange-50 border border-orange-200' :
                    'bg-muted/30'
                  }`}
                >
                  <div className="w-8 text-center">
                    {index === 0 ? (
                      <span className="text-2xl">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-2xl">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-2xl">🥉</span>
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                  
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className={doctor.color}>
                      {doctor.initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{doctor.name}</span>
                      {doctor.badges.map((badge, i) => (
                        <span key={i} className="text-sm">{badge}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{doctor.evolutions} evoluções</span>
                      <span>{doctor.patients} pacientes</span>
                      <span>Média: {doctor.avgTime}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-600">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="font-bold">{doctor.points.toLocaleString()}</span>
                    </div>
                    {doctor.streak > 0 && (
                      <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                        <Flame className="w-3 h-3" />
                        <span>{doctor.streak} dias seguidos</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Points System Explanation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Como Ganhar Pontos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">+10</p>
                <p className="text-sm text-muted-foreground">Por evolução</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-green-600">+50</p>
                <p className="text-sm text-muted-foreground">Alta bem-sucedida</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">+25</p>
                <p className="text-sm text-muted-foreground">Plantão completo</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">x2</p>
                <p className="text-sm text-muted-foreground">Bônus de sequência</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Achievements Tab */}
      <TabsContent value="achievements" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Suas Conquistas
            </CardTitle>
            <CardDescription>Desbloqueie conquistas completando desafios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${
                    achievement.unlocked 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-muted/30 border-dashed'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      achievement.unlocked ? 'bg-green-100' : 'bg-muted'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{achievement.name}</h4>
                        {achievement.unlocked && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      
                      {!achievement.unlocked && achievement.progress && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progresso</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recompensas</CardTitle>
            <CardDescription>Benefícios por bom desempenho</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Top 3 do mês</p>
                  <p className="text-sm text-muted-foreground">Menos pacientes no próximo plantão</p>
                </div>
                <Badge className="bg-amber-500">Ativo</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">5.000 pontos</p>
                  <p className="text-sm text-muted-foreground">Escolha de plantão prioritária</p>
                </div>
                <Badge variant="outline">2.150 pts restantes</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Target className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Sequência de 30 dias</p>
                  <p className="text-sm text-muted-foreground">1 dia de folga extra</p>
                </div>
                <Badge variant="outline">18 dias restantes</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
