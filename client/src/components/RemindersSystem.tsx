import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Bell,
  Plus,
  Clock,
  Calendar,
  User,
  Pill,
  Stethoscope,
  FileText,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit,
  Repeat,
  BellRing,
  BellOff
} from "lucide-react";

// Tipos de lembrete
const reminderTypes = [
  { id: 'followup', name: 'Retorno', icon: Calendar, color: 'bg-blue-500', description: 'Agendar retorno do paciente' },
  { id: 'exam', name: 'Exame', icon: FileText, color: 'bg-purple-500', description: 'Solicitar ou verificar exame' },
  { id: 'medication', name: 'Medicação', icon: Pill, color: 'bg-green-500', description: 'Ajustar ou renovar receita' },
  { id: 'call', name: 'Ligar', icon: Phone, color: 'bg-amber-500', description: 'Ligar para o paciente' },
  { id: 'evolution', name: 'Evolução', icon: Stethoscope, color: 'bg-red-500', description: 'Fazer evolução pendente' },
  { id: 'custom', name: 'Personalizado', icon: Bell, color: 'bg-gray-500', description: 'Lembrete personalizado' },
];

// Frequências de repetição
const repeatOptions = [
  { id: 'none', name: 'Não repetir' },
  { id: 'daily', name: 'Diariamente' },
  { id: 'weekly', name: 'Semanalmente' },
  { id: 'biweekly', name: 'Quinzenalmente' },
  { id: 'monthly', name: 'Mensalmente' },
  { id: 'quarterly', name: 'Trimestralmente' },
];

interface Reminder {
  id: number;
  type: string;
  title: string;
  description?: string;
  patientId?: number;
  patientName?: string;
  dueDate: string;
  dueTime?: string;
  repeat: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifyWhatsapp: boolean;
  createdAt: string;
}

interface RemindersSystemProps {
  isDemo?: boolean;
  patientId?: number;
  patientName?: string;
}

export default function RemindersSystem({ isDemo = false, patientId, patientName }: RemindersSystemProps) {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: 1,
      type: 'followup',
      title: 'Retorno - Maria Silva',
      description: 'Verificar resultado do ecocardiograma',
      patientId: 1,
      patientName: 'Maria Silva Santos',
      dueDate: '2026-02-05',
      dueTime: '14:00',
      repeat: 'none',
      priority: 'high',
      completed: false,
      notifyEmail: true,
      notifyPush: true,
      notifyWhatsapp: false,
      createdAt: '2026-01-28'
    },
    {
      id: 2,
      type: 'medication',
      title: 'Renovar receita - João Pereira',
      description: 'Renovar receita de anti-hipertensivo',
      patientId: 2,
      patientName: 'João Pereira Lima',
      dueDate: '2026-02-01',
      dueTime: '09:00',
      repeat: 'monthly',
      priority: 'medium',
      completed: false,
      notifyEmail: true,
      notifyPush: true,
      notifyWhatsapp: true,
      createdAt: '2026-01-25'
    },
    {
      id: 3,
      type: 'exam',
      title: 'Verificar hemograma - Ana Costa',
      description: 'Resultado deve estar pronto',
      patientId: 3,
      patientName: 'Ana Costa Oliveira',
      dueDate: '2026-01-31',
      dueTime: '10:00',
      repeat: 'none',
      priority: 'high',
      completed: false,
      notifyEmail: true,
      notifyPush: true,
      notifyWhatsapp: false,
      createdAt: '2026-01-29'
    },
    {
      id: 4,
      type: 'call',
      title: 'Ligar para Carlos - Pós-operatório',
      patientId: 4,
      patientName: 'Carlos Roberto Santos',
      dueDate: '2026-01-30',
      dueTime: '16:00',
      repeat: 'none',
      priority: 'low',
      completed: true,
      notifyEmail: false,
      notifyPush: true,
      notifyWhatsapp: false,
      createdAt: '2026-01-28'
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'today'>('pending');
  
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    type: 'followup',
    title: '',
    description: '',
    patientId: patientId,
    patientName: patientName,
    dueDate: '',
    dueTime: '',
    repeat: 'none',
    priority: 'medium',
    notifyEmail: true,
    notifyPush: true,
    notifyWhatsapp: false
  });

  const today = new Date().toISOString().split('T')[0];

  const filteredReminders = reminders.filter(reminder => {
    switch (filter) {
      case 'pending':
        return !reminder.completed;
      case 'completed':
        return reminder.completed;
      case 'today':
        return reminder.dueDate === today;
      default:
        return true;
    }
  }).sort((a, b) => {
    // Ordenar por data, depois por prioridade
    if (a.dueDate !== b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const getReminderType = (typeId: string) => {
    return reminderTypes.find(t => t.id === typeId) || reminderTypes[5];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) {
      return 'Hoje';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Amanhã';
    } else if (date < today) {
      return 'Atrasado';
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const isOverdue = (dateStr: string) => {
    const date = new Date(dateStr + 'T23:59:59');
    return date < new Date();
  };

  const handleCreateReminder = () => {
    if (!newReminder.title || !newReminder.dueDate) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const reminder: Reminder = {
      id: reminders.length + 1,
      type: newReminder.type || 'custom',
      title: newReminder.title,
      description: newReminder.description,
      patientId: newReminder.patientId,
      patientName: newReminder.patientName,
      dueDate: newReminder.dueDate,
      dueTime: newReminder.dueTime,
      repeat: newReminder.repeat || 'none',
      priority: newReminder.priority as 'low' | 'medium' | 'high',
      completed: false,
      notifyEmail: newReminder.notifyEmail || false,
      notifyPush: newReminder.notifyPush || false,
      notifyWhatsapp: newReminder.notifyWhatsapp || false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setReminders([...reminders, reminder]);
    setIsCreateDialogOpen(false);
    setNewReminder({
      type: 'followup',
      title: '',
      description: '',
      patientId: patientId,
      patientName: patientName,
      dueDate: '',
      dueTime: '',
      repeat: 'none',
      priority: 'medium',
      notifyEmail: true,
      notifyPush: true,
      notifyWhatsapp: false
    });

    toast.success("Lembrete criado!", {
      description: reminder.title
    });
  };

  const handleToggleComplete = (reminderId: number) => {
    setReminders(reminders.map(r => 
      r.id === reminderId ? { ...r, completed: !r.completed } : r
    ));
    
    const reminder = reminders.find(r => r.id === reminderId);
    toast.success(
      reminder?.completed ? "Lembrete reaberto" : "Lembrete concluído!",
      { description: reminder?.title }
    );
  };

  const handleDeleteReminder = (reminderId: number) => {
    setReminders(reminders.filter(r => r.id !== reminderId));
    toast.success("Lembrete removido");
  };

  const pendingCount = reminders.filter(r => !r.completed).length;
  const overdueCount = reminders.filter(r => !r.completed && isOverdue(r.dueDate)).length;
  const todayCount = reminders.filter(r => r.dueDate === today && !r.completed).length;

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Lembretes
          </h2>
          <div className="flex items-center gap-3 mt-1 text-sm">
            <span className="text-muted-foreground">{pendingCount} pendentes</span>
            {overdueCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                {overdueCount} atrasados
              </Badge>
            )}
            {todayCount > 0 && (
              <Badge className="bg-blue-500 gap-1">
                <Clock className="w-3 h-3" />
                {todayCount} para hoje
              </Badge>
            )}
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Lembrete
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Lembrete</DialogTitle>
              <DialogDescription>Configure um lembrete para acompanhamento de paciente</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Tipo de Lembrete */}
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="grid grid-cols-3 gap-2">
                  {reminderTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors text-center ${
                          newReminder.type === type.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setNewReminder({...newReminder, type: type.id})}
                      >
                        <div className={`w-8 h-8 rounded-lg ${type.color} flex items-center justify-center mx-auto mb-1`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs">{type.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input 
                  placeholder="Ex: Retorno do paciente"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                />
              </div>

              {/* Paciente (opcional) */}
              <div className="space-y-2">
                <Label>Paciente (opcional)</Label>
                <Input 
                  placeholder="Nome do paciente"
                  value={newReminder.patientName || ''}
                  onChange={(e) => setNewReminder({...newReminder, patientName: e.target.value})}
                />
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input 
                    type="date"
                    value={newReminder.dueDate}
                    onChange={(e) => setNewReminder({...newReminder, dueDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input 
                    type="time"
                    value={newReminder.dueTime}
                    onChange={(e) => setNewReminder({...newReminder, dueTime: e.target.value})}
                  />
                </div>
              </div>

              {/* Prioridade e Repetição */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select 
                    value={newReminder.priority} 
                    onValueChange={(v) => setNewReminder({...newReminder, priority: v as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Repetir</Label>
                  <Select 
                    value={newReminder.repeat} 
                    onValueChange={(v) => setNewReminder({...newReminder, repeat: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {repeatOptions.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea 
                  placeholder="Detalhes adicionais..."
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                />
              </div>

              {/* Notificações */}
              <div className="space-y-3">
                <Label>Notificações</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email</span>
                  <Switch 
                    checked={newReminder.notifyEmail}
                    onCheckedChange={(v) => setNewReminder({...newReminder, notifyEmail: v})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push (App)</span>
                  <Switch 
                    checked={newReminder.notifyPush}
                    onCheckedChange={(v) => setNewReminder({...newReminder, notifyPush: v})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">WhatsApp</span>
                  <Switch 
                    checked={newReminder.notifyWhatsapp}
                    onCheckedChange={(v) => setNewReminder({...newReminder, notifyWhatsapp: v})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateReminder}>
                Criar Lembrete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="w-3 h-3" />
            Pendentes
          </TabsTrigger>
          <TabsTrigger value="today" className="gap-1">
            <Calendar className="w-3 h-3" />
            Hoje
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Concluídos
          </TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.map((reminder) => {
          const type = getReminderType(reminder.type);
          const Icon = type.icon;
          const overdue = !reminder.completed && isOverdue(reminder.dueDate);
          
          return (
            <Card 
              key={reminder.id}
              className={`${reminder.completed ? 'opacity-60' : ''} ${overdue ? 'border-red-300 bg-red-50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      reminder.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 hover:border-primary'
                    }`}
                    onClick={() => handleToggleComplete(reminder.id)}
                  >
                    {reminder.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`font-medium ${reminder.completed ? 'line-through' : ''}`}>
                          {reminder.title}
                        </h4>
                        {reminder.patientName && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3" />
                            {reminder.patientName}
                          </p>
                        )}
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteReminder(reminder.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge 
                        variant={overdue ? 'destructive' : 'outline'}
                        className="gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        {formatDate(reminder.dueDate)}
                        {reminder.dueTime && ` às ${reminder.dueTime}`}
                      </Badge>
                      
                      <Badge variant="outline" className={`${getPriorityColor(reminder.priority)} text-white border-0`}>
                        {getPriorityLabel(reminder.priority)}
                      </Badge>
                      
                      {reminder.repeat !== 'none' && (
                        <Badge variant="secondary" className="gap-1">
                          <Repeat className="w-3 h-3" />
                          {repeatOptions.find(o => o.id === reminder.repeat)?.name}
                        </Badge>
                      )}
                      
                      {/* Notification icons */}
                      <div className="flex items-center gap-1 ml-auto">
                        {reminder.notifyEmail && <Badge variant="outline" className="text-xs px-1">📧</Badge>}
                        {reminder.notifyPush && <Badge variant="outline" className="text-xs px-1">🔔</Badge>}
                        {reminder.notifyWhatsapp && <Badge variant="outline" className="text-xs px-1">💬</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredReminders.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BellOff className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhum lembrete encontrado</p>
              <Button 
                variant="outline" 
                className="mt-4 gap-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Criar Lembrete
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
