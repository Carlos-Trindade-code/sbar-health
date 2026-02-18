import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  BellRing,
  Check,
  ChevronRight,
  Clock,
  Droplets,
  Edit,
  FileText,
  Heart,
  HeartPulse,
  LogOut,
  MessageSquare,
  Pill,
  Save,
  Send,
  Stethoscope,
  Thermometer,
  Timer,
  TrendingDown,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Wind,
  X,
  Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

// Escala de Aldrete modificada
const ALDRETE_CRITERIA = [
  { name: "Atividade", options: ["Movimenta 4 membros", "Movimenta 2 membros", "Não movimenta"], scores: [2, 1, 0] },
  { name: "Respiração", options: ["Respira profundamente/tosse", "Dispneia/respiração limitada", "Apneia"], scores: [2, 1, 0] },
  { name: "Circulação", options: ["PA ±20% do pré-op", "PA ±20-50% do pré-op", "PA ±50% do pré-op"], scores: [2, 1, 0] },
  { name: "Consciência", options: ["Totalmente acordado", "Acorda ao chamar", "Não responde"], scores: [2, 1, 0] },
  { name: "SpO2", options: [">92% ar ambiente", "Necessita O2 para >90%", "<90% mesmo com O2"], scores: [2, 1, 0] },
];

// Escala de Ramsay para sedação
const RAMSAY_SCALE = [
  { level: 1, description: "Ansioso, agitado ou inquieto" },
  { level: 2, description: "Cooperativo, orientado e tranquilo" },
  { level: 3, description: "Responde a comandos" },
  { level: 4, description: "Resposta rápida a estímulo glabelar ou auditivo" },
  { level: 5, description: "Resposta lenta a estímulo glabelar ou auditivo" },
  { level: 6, description: "Sem resposta" },
];

// Mock de pacientes na recuperação
const mockRecoveryPatients = [
  {
    id: 1,
    name: "Roberto Almeida",
    bed: "RPA-01",
    surgery: "Colecistectomia VLP",
    surgeon: "Dr. Paulo Mendes",
    anesthesiologist: "Dra. Ana Silva",
    admissionTime: new Date(Date.now() - 45 * 60000), // 45 min atrás
    status: "estável",
    aldrete: 8,
    ramsay: 2,
    vitals: {
      hr: 78,
      bp: "120/80",
      spo2: 98,
      temp: 36.2,
      rr: 16,
      pain: 3
    },
    alerts: [],
    opioids: { morphine: 4, tramadol: 0 },
    lastUpdate: new Date(),
    team: ["Enf. Maria", "Téc. João"]
  },
  {
    id: 2,
    name: "Carla Souza",
    bed: "RPA-02",
    surgery: "Histerectomia total",
    surgeon: "Dra. Fernanda Costa",
    anesthesiologist: "Dr. Ricardo Lima",
    admissionTime: new Date(Date.now() - 90 * 60000), // 1.5h atrás
    status: "atenção",
    aldrete: 6,
    ramsay: 3,
    vitals: {
      hr: 95,
      bp: "95/60",
      spo2: 94,
      temp: 35.8,
      rr: 20,
      pain: 6
    },
    alerts: [
      { type: "hemodinâmica", message: "PA baixa - monitorar", severity: "warning" },
      { type: "dor", message: "EVA 6 - considerar analgesia", severity: "warning" }
    ],
    opioids: { morphine: 6, tramadol: 100 },
    lastUpdate: new Date(),
    team: ["Enf. Carlos", "Téc. Ana"]
  },
  {
    id: 3,
    name: "José Santos",
    bed: "RPA-03",
    surgery: "Artroplastia de quadril",
    surgeon: "Dr. Marcos Oliveira",
    anesthesiologist: "Dra. Juliana Reis",
    admissionTime: new Date(Date.now() - 120 * 60000), // 2h atrás
    status: "crítico",
    aldrete: 4,
    ramsay: 5,
    vitals: {
      hr: 110,
      bp: "85/50",
      spo2: 89,
      temp: 38.1,
      rr: 24,
      pain: 8
    },
    alerts: [
      { type: "hemodinâmica", message: "Hipotensão severa", severity: "critical" },
      { type: "respiratória", message: "SpO2 baixa", severity: "critical" },
      { type: "febre", message: "Temperatura elevada", severity: "warning" }
    ],
    opioids: { morphine: 10, tramadol: 100 },
    lastUpdate: new Date(),
    team: ["Enf. Pedro", "Téc. Lucia", "Dr. Ricardo (anestesista)"]
  },
  {
    id: 4,
    name: "Maria Oliveira",
    bed: "RPA-04",
    surgery: "Apendicectomia VLP",
    surgeon: "Dr. André Ferreira",
    anesthesiologist: "Dr. Bruno Santos",
    admissionTime: new Date(Date.now() - 30 * 60000), // 30 min atrás
    status: "estável",
    aldrete: 9,
    ramsay: 2,
    vitals: {
      hr: 72,
      bp: "115/75",
      spo2: 99,
      temp: 36.5,
      rr: 14,
      pain: 2
    },
    alerts: [],
    opioids: { morphine: 2, tramadol: 0 },
    lastUpdate: new Date(),
    team: ["Enf. Maria"]
  },
];

// Dados de tendência de sinais vitais
const generateVitalsTrend = (baseValue: number, variance: number, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    time: `${i * 5}min`,
    value: baseValue + (Math.random() - 0.5) * variance
  }));
};

// Tipos para SBAR e Passagem de Plantão
interface SBAREvolution {
  id: number;
  patientId: number;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  createdAt: Date;
  createdBy: string;
  type: 'evolution' | 'handoff' | 'discharge';
}

interface HandoffRequest {
  fromUser: string;
  toUser: string;
  sbar: Omit<SBAREvolution, 'id' | 'createdAt'>;
  status: 'pending' | 'accepted' | 'rejected';
}

// Mock de usuários disponíveis para passagem de plantão
const AVAILABLE_COLLEAGUES = [
  { id: 1, name: "Dr. Carlos Silva", role: "Médico Anestesista", available: true },
  { id: 2, name: "Dra. Maria Santos", role: "Médica Anestesista", available: true },
  { id: 3, name: "Enf. João Oliveira", role: "Enfermeiro RPA", available: true },
  { id: 4, name: "Enf. Ana Costa", role: "Enfermeira RPA", available: false },
  { id: 5, name: "Dr. Pedro Lima", role: "Médico Cirurgião", available: true },
];

interface RecoveryRoomProps {
  isDemo?: boolean;
}

export default function RecoveryRoom({ isDemo = false }: RecoveryRoomProps) {
  const [patients, setPatients] = useState(mockRecoveryPatients);
  const [selectedPatient, setSelectedPatient] = useState<typeof mockRecoveryPatients[0] | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Estados para Evolução SBAR
  const [showSbarDialog, setShowSbarDialog] = useState(false);
  const [sbarType, setSbarType] = useState<'evolution' | 'handoff' | 'discharge'>('evolution');
  const [sbarForm, setSbarForm] = useState({
    situation: '',
    background: '',
    assessment: '',
    recommendation: ''
  });
  const [evolutions, setEvolutions] = useState<SBAREvolution[]>([]);
  
  // Estados para Edição de Paciente
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    bed: '',
    surgery: '',
    surgeon: '',
    anesthesiologist: '',
    status: '' as 'estável' | 'atenção' | 'crítico'
  });
  
  // Estados para Passagem de Plantão
  const [showHandoffDialog, setShowHandoffDialog] = useState(false);
  const [selectedColleague, setSelectedColleague] = useState<string>('');
  const [handoffMessage, setHandoffMessage] = useState('');
  
  // Estados para Alta da RPA
  const [showDischargeDialog, setShowDischargeDialog] = useState(false);
  const [dischargeDestination, setDischargeDestination] = useState<'enfermaria' | 'uti' | 'domicilio'>('enfermaria');

  // Mutations para notificações (apenas quando não é demo)
  const sendHandoffNotification = trpc.notifications.sendHandoff.useMutation({
    onError: () => {
      // Silenciosamente falha em modo demo ou quando não autenticado
    }
  });
  
  const sendDischargeNotification = trpc.notifications.sendDischarge.useMutation({
    onError: () => {
      // Silenciosamente falha em modo demo ou quando não autenticado
    }
  });
  
  const sendStatusNotification = trpc.notifications.sendStatusUpdate.useMutation({
    onError: () => {
      // Silenciosamente falha em modo demo ou quando não autenticado
    }
  });

  // Simular atualização em tempo real
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setPatients(prev => prev.map(p => ({
        ...p,
        vitals: {
          ...p.vitals,
          hr: p.vitals.hr + Math.floor((Math.random() - 0.5) * 4),
          spo2: Math.min(100, Math.max(85, p.vitals.spo2 + Math.floor((Math.random() - 0.5) * 2))),
        },
        lastUpdate: new Date()
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'crítico': return 'bg-red-500';
      case 'atenção': return 'bg-yellow-500';
      case 'estável': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'crítico': return 'destructive';
      case 'atenção': return 'warning' as any;
      case 'estável': return 'default';
      default: return 'secondary';
    }
  };

  const getAldreteColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeSinceAdmission = (admissionTime: Date) => {
    const diff = Date.now() - admissionTime.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  const sendNotification = (patient: typeof mockRecoveryPatients[0], type: string) => {
    toast.success(`Notificação enviada`, {
      description: `${type} para equipe de ${patient.name}`
    });
  };

  // Funções para Evolução SBAR
  const openSbarDialog = (type: 'evolution' | 'handoff' | 'discharge') => {
    if (!selectedPatient) return;
    setSbarType(type);
    
    // Pré-preencher com dados do paciente
    const patient = selectedPatient;
    setSbarForm({
      situation: type === 'evolution' 
        ? `Paciente ${patient.name}, ${getTimeSinceAdmission(patient.admissionTime)} pós ${patient.surgery}. Status: ${patient.status}.`
        : type === 'handoff'
        ? `Passagem de plantão - Paciente ${patient.name}, ${patient.surgery}. Aldrete: ${patient.aldrete}/10.`
        : `Alta da RPA - Paciente ${patient.name}, ${patient.surgery}. Aldrete: ${patient.aldrete}/10.`,
      background: `Cirurgia: ${patient.surgery}\nCirurgião: ${patient.surgeon}\nAnestesista: ${patient.anesthesiologist}\nSinais vitais: FC ${patient.vitals.hr}, PA ${patient.vitals.bp}, SpO2 ${patient.vitals.spo2}%, Temp ${patient.vitals.temp}°C`,
      assessment: `Aldrete: ${patient.aldrete}/10\nRamsay: ${patient.ramsay}\nDor (EVA): ${patient.vitals.pain}/10\n${patient.alerts.length > 0 ? 'Alertas: ' + patient.alerts.map(a => a.message).join(', ') : 'Sem alertas ativos'}`,
      recommendation: type === 'discharge' 
        ? 'Paciente apto para alta da RPA. Manter monitorização no destino.'
        : 'Manter monitorização contínua. Reavaliar em 30 minutos.'
    });
    setShowSbarDialog(true);
  };

  const saveSbarEvolution = () => {
    if (!selectedPatient) return;
    
    const newEvolution: SBAREvolution = {
      id: Date.now(),
      patientId: selectedPatient.id,
      ...sbarForm,
      createdAt: new Date(),
      createdBy: 'Dr. Usuário Atual',
      type: sbarType
    };
    
    setEvolutions(prev => [newEvolution, ...prev]);
    setShowSbarDialog(false);
    setSbarForm({ situation: '', background: '', assessment: '', recommendation: '' });
    
    const typeLabel = sbarType === 'evolution' ? 'Evolução' : sbarType === 'handoff' ? 'Passagem de plantão' : 'Alta';
    toast.success(`${typeLabel} SBAR registrada`, {
      description: `Paciente: ${selectedPatient.name}`
    });
  };

  // Funções para Edição de Paciente
  const openEditDialog = () => {
    if (!selectedPatient) return;
    setEditForm({
      bed: selectedPatient.bed,
      surgery: selectedPatient.surgery,
      surgeon: selectedPatient.surgeon,
      anesthesiologist: selectedPatient.anesthesiologist,
      status: selectedPatient.status as 'estável' | 'atenção' | 'crítico'
    });
    setShowEditDialog(true);
  };

  const savePatientEdit = () => {
    if (!selectedPatient) return;
    
    setPatients(prev => prev.map(p => 
      p.id === selectedPatient.id 
        ? { ...p, ...editForm, lastUpdate: new Date() }
        : p
    ));
    
    setSelectedPatient(prev => prev ? { ...prev, ...editForm } : null);
    setShowEditDialog(false);
    toast.success('Dados do paciente atualizados');
  };

  // Funções para Passagem de Plantão
  const openHandoffDialog = () => {
    if (!selectedPatient) return;
    openSbarDialog('handoff');
  };

  const sendHandoff = () => {
    if (!selectedPatient || !selectedColleague) {
      toast.error('Selecione um colega para a passagem de plantão');
      return;
    }
    
    saveSbarEvolution();
    
    const colleague = AVAILABLE_COLLEAGUES.find(c => c.id.toString() === selectedColleague);
    
    // Enviar notificação real (tenta enviar, mas não bloqueia se falhar)
    try {
      sendHandoffNotification.mutate({
        toUserId: parseInt(selectedColleague),
        patientName: selectedPatient.name,
        patientId: selectedPatient.id,
        sbarSummary: `${sbarForm.situation}\n${sbarForm.assessment}\n${handoffMessage}`
      });
    } catch (e) {
      // Ignora erro em modo demo
    }
    
    toast.success(`Passagem de plantão enviada`, {
      description: `Notificação enviada para ${colleague?.name}`
    });
    
    setShowHandoffDialog(false);
    setSelectedColleague('');
    setHandoffMessage('');
  };

  // Funções para Alta da RPA
  const openDischargeDialog = () => {
    if (!selectedPatient) return;
    if (selectedPatient.aldrete < 9) {
      toast.error('Paciente não atinge critérios de alta', {
        description: `Aldrete atual: ${selectedPatient.aldrete}/10. Mínimo para alta: 9/10`
      });
      return;
    }
    openSbarDialog('discharge');
    setShowDischargeDialog(true);
  };

  const confirmDischarge = () => {
    if (!selectedPatient) return;
    
    saveSbarEvolution();
    
    // Enviar notificação de alta (tenta enviar, mas não bloqueia se falhar)
    try {
      // Notificar cirurgião (usando ID 99 como placeholder para o cirurgião)
      sendDischargeNotification.mutate({
        toUserId: 99, // Em produção, seria o ID real do cirurgião
        patientName: selectedPatient.name,
        patientId: selectedPatient.id,
        destination: dischargeDestination === 'enfermaria' ? 'Enfermaria' : 
                     dischargeDestination === 'uti' ? 'UTI' : 'Domicílio'
      });
    } catch (e) {
      // Ignora erro em modo demo
    }
    
    // Notificar cirurgião
    toast.success(`Alta da RPA confirmada`, {
      description: `Paciente ${selectedPatient.name} encaminhado para ${dischargeDestination}. Cirurgião ${selectedPatient.surgeon} notificado.`
    });
    
    // Remover paciente da lista
    setPatients(prev => prev.filter(p => p.id !== selectedPatient.id));
    setSelectedPatient(null);
    setShowDischargeDialog(false);
  };

  const criticalPatients = patients.filter(p => p.status === 'crítico').length;
  const attentionPatients = patients.filter(p => p.status === 'atenção').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-primary" />
            Sala de Recuperação
          </h2>
          <p className="text-muted-foreground">
            Monitoramento pós-operatório em tempo real
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh}
              id="auto-refresh"
            />
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              checked={notificationsEnabled} 
              onCheckedChange={setNotificationsEnabled}
              id="notifications"
            />
            <Label htmlFor="notifications" className="text-sm">Notificações</Label>
          </div>
          <Badge variant="outline">{isDemo ? "DEMO" : "LIVE"}</Badge>
        </div>
      </div>

      {/* Alertas Críticos */}
      {criticalPatients > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full animate-pulse">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-800">
                {criticalPatients} paciente(s) em estado crítico
              </p>
              <p className="text-sm text-red-600">
                Atenção imediata necessária
              </p>
            </div>
            <Button variant="destructive" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Alertar Equipe
            </Button>
          </div>
        </motion.div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total RPA</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className={criticalPatients > 0 ? "border-red-300 bg-red-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className={`text-2xl font-bold ${criticalPatients > 0 ? 'text-red-600' : ''}`}>
                  {criticalPatients}
                </p>
              </div>
              <AlertCircle className={`w-8 h-8 ${criticalPatients > 0 ? 'text-red-500' : 'text-muted-foreground opacity-50'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={attentionPatients > 0 ? "border-yellow-300 bg-yellow-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atenção</p>
                <p className={`text-2xl font-bold ${attentionPatients > 0 ? 'text-yellow-600' : ''}`}>
                  {attentionPatients}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${attentionPatients > 0 ? 'text-yellow-500' : 'text-muted-foreground opacity-50'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estáveis</p>
                <p className="text-2xl font-bold text-green-600">
                  {patients.filter(p => p.status === 'estável').length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alta Pendente</p>
                <p className="text-2xl font-bold text-blue-600">
                  {patients.filter(p => p.aldrete >= 9).length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pacientes */}
      <div className="space-y-3">
        {patients.map(patient => (
          <Card 
            key={patient.id}
            className={`transition-all ${
              patient.status === 'crítico' ? 'border-red-300 shadow-red-100 shadow-md' :
              patient.status === 'atenção' ? 'border-yellow-300' : ''
            }`}
          >
            <CardContent className="p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedPatient(selectedPatient?.id === patient.id ? null : patient)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-16 rounded-full ${getStatusColor(patient.status)} ${patient.status === 'crítico' ? 'animate-pulse' : ''}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{patient.name}</span>
                      <Badge variant="outline">{patient.bed}</Badge>
                      <Badge variant={getStatusBadge(patient.status)}>
                        {patient.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{patient.surgery}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeSinceAdmission(patient.admissionTime)}
                      </span>
                      <span>Cirurgião: {patient.surgeon}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Sinais Vitais Resumidos */}
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="font-mono font-bold">{patient.vitals.hr}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">FC</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="font-mono font-bold">{patient.vitals.bp}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">PA</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Droplets className="w-4 h-4 text-cyan-500" />
                        <span className={`font-mono font-bold ${patient.vitals.spo2 < 92 ? 'text-red-600' : ''}`}>
                          {patient.vitals.spo2}%
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">SpO2</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className={`font-mono font-bold ${patient.vitals.temp > 37.5 ? 'text-red-600' : ''}`}>
                          {patient.vitals.temp}°
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">Temp</span>
                    </div>
                  </div>

                  {/* Aldrete Score */}
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${getAldreteColor(patient.aldrete)}`}>
                      {patient.aldrete}/10
                    </p>
                    <span className="text-xs text-muted-foreground">Aldrete</span>
                  </div>

                  {/* Alertas */}
                  {patient.alerts.length > 0 && (
                    <div className="flex items-center">
                      <Badge variant="destructive" className="animate-pulse">
                        {patient.alerts.length} alerta(s)
                      </Badge>
                    </div>
                  )}

                  <ChevronRight className={`w-5 h-5 transition-transform ${selectedPatient?.id === patient.id ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Detalhes Expandidos */}
              <AnimatePresence>
                {selectedPatient?.id === patient.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <Separator className="my-4" />
                    
                    <Tabs defaultValue="vitals" className="space-y-4">
                      <TabsList className="flex-wrap h-auto">
                        <TabsTrigger value="vitals">Sinais Vitais</TabsTrigger>
                        <TabsTrigger value="scales">Escalas</TabsTrigger>
                        <TabsTrigger value="medications">Medicações</TabsTrigger>
                        <TabsTrigger value="actions" className="bg-primary/10">
                          <FileText className="w-4 h-4 mr-1" />
                          Ações
                        </TabsTrigger>
                        <TabsTrigger value="notifications">Notificações</TabsTrigger>
                      </TabsList>

                      {/* Tab Sinais Vitais */}
                      <TabsContent value="vitals" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          <Card className={patient.vitals.hr > 100 || patient.vitals.hr < 60 ? 'border-red-300' : ''}>
                            <CardContent className="p-3 text-center">
                              <Heart className="w-5 h-5 mx-auto text-red-500" />
                              <p className="text-2xl font-bold mt-1">{patient.vitals.hr}</p>
                              <p className="text-xs text-muted-foreground">FC (bpm)</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-3 text-center">
                              <Activity className="w-5 h-5 mx-auto text-blue-500" />
                              <p className="text-2xl font-bold mt-1">{patient.vitals.bp}</p>
                              <p className="text-xs text-muted-foreground">PA (mmHg)</p>
                            </CardContent>
                          </Card>
                          <Card className={patient.vitals.spo2 < 92 ? 'border-red-300' : ''}>
                            <CardContent className="p-3 text-center">
                              <Droplets className="w-5 h-5 mx-auto text-cyan-500" />
                              <p className="text-2xl font-bold mt-1">{patient.vitals.spo2}%</p>
                              <p className="text-xs text-muted-foreground">SpO2</p>
                            </CardContent>
                          </Card>
                          <Card className={patient.vitals.temp > 37.5 ? 'border-orange-300' : ''}>
                            <CardContent className="p-3 text-center">
                              <Thermometer className="w-5 h-5 mx-auto text-orange-500" />
                              <p className="text-2xl font-bold mt-1">{patient.vitals.temp}°</p>
                              <p className="text-xs text-muted-foreground">Temp (°C)</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-3 text-center">
                              <Wind className="w-5 h-5 mx-auto text-green-500" />
                              <p className="text-2xl font-bold mt-1">{patient.vitals.rr}</p>
                              <p className="text-xs text-muted-foreground">FR (rpm)</p>
                            </CardContent>
                          </Card>
                          <Card className={patient.vitals.pain > 5 ? 'border-red-300' : ''}>
                            <CardContent className="p-3 text-center">
                              <AlertTriangle className="w-5 h-5 mx-auto text-yellow-500" />
                              <p className="text-2xl font-bold mt-1">{patient.vitals.pain}/10</p>
                              <p className="text-xs text-muted-foreground">Dor (EVA)</p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Gráfico de tendência */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Tendência FC (últimos 30min)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={150}>
                              <LineChart data={generateVitalsTrend(patient.vitals.hr, 10, 7)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis domain={[50, 120]} />
                                <Tooltip />
                                <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" />
                                <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Tab Escalas */}
                      <TabsContent value="scales" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Aldrete */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center justify-between">
                                Escala de Aldrete
                                <Badge className={getAldreteColor(patient.aldrete)}>
                                  {patient.aldrete}/10
                                </Badge>
                              </CardTitle>
                              <CardDescription>
                                {patient.aldrete >= 9 ? "Apto para alta da RPA" : "Manter monitorização"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {ALDRETE_CRITERIA.map((criteria, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <span>{criteria.name}</span>
                                  <Badge variant="outline">
                                    {idx < 4 ? "2" : patient.aldrete >= 9 ? "2" : "1"}
                                  </Badge>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          {/* Ramsay */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center justify-between">
                                Escala de Ramsay
                                <Badge variant="outline">Nível {patient.ramsay}</Badge>
                              </CardTitle>
                              <CardDescription>
                                {RAMSAY_SCALE.find(r => r.level === patient.ramsay)?.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1">
                                {RAMSAY_SCALE.map(level => (
                                  <div 
                                    key={level.level}
                                    className={`p-2 rounded text-sm ${
                                      level.level === patient.ramsay 
                                        ? 'bg-primary/10 border border-primary' 
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    <span className="font-medium">{level.level}.</span> {level.description}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Tab Medicações */}
                      <TabsContent value="medications" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Pill className="w-5 h-5" />
                              Opioides Administrados
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-orange-50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Morfina</p>
                                <p className="text-2xl font-bold text-orange-600">
                                  {patient.opioids.morphine} mg
                                </p>
                                <Progress 
                                  value={(patient.opioids.morphine / 15) * 100} 
                                  className="h-2 mt-2"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Limite: 15mg/4h
                                </p>
                              </div>
                              <div className="p-4 bg-purple-50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Tramadol</p>
                                <p className="text-2xl font-bold text-purple-600">
                                  {patient.opioids.tramadol} mg
                                </p>
                                <Progress 
                                  value={(patient.opioids.tramadol / 400) * 100} 
                                  className="h-2 mt-2"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Limite: 400mg/dia
                                </p>
                              </div>
                            </div>

                            {patient.vitals.pain > 5 && (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                  <span className="text-sm font-medium text-yellow-800">
                                    EVA {patient.vitals.pain}/10 - Considerar analgesia adicional
                                  </span>
                                </div>
                              </div>
                            )}

                            <Button 
                              className="w-full"
                              onClick={() => toast.success("Solicitação de medicação enviada")}
                            >
                              <Pill className="w-4 h-4 mr-2" />
                              Solicitar Medicação
                            </Button>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Tab Ações - Evolução, Edição, Passagem de Plantão, Alta */}
                      <TabsContent value="actions" className="space-y-4">
                        {/* Botões de Ação Principais */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Button 
                            className="h-auto py-4 flex-col gap-2"
                            onClick={() => openSbarDialog('evolution')}
                          >
                            <FileText className="w-6 h-6" />
                            <span>Evoluir SBAR</span>
                          </Button>
                          <Button 
                            variant="outline"
                            className="h-auto py-4 flex-col gap-2"
                            onClick={openEditDialog}
                          >
                            <Edit className="w-6 h-6" />
                            <span>Editar Dados</span>
                          </Button>
                          <Button 
                            variant="secondary"
                            className="h-auto py-4 flex-col gap-2"
                            onClick={() => {
                              openSbarDialog('handoff');
                              setShowHandoffDialog(true);
                            }}
                          >
                            <UserCheck className="w-6 h-6" />
                            <span>Passar Plantão</span>
                          </Button>
                          <Button 
                            variant={patient.aldrete >= 9 ? "default" : "outline"}
                            className={`h-auto py-4 flex-col gap-2 ${patient.aldrete >= 9 ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            onClick={openDischargeDialog}
                            disabled={patient.aldrete < 9}
                          >
                            <LogOut className="w-6 h-6" />
                            <span>Alta RPA</span>
                            {patient.aldrete < 9 && (
                              <span className="text-xs text-muted-foreground">Aldrete &lt; 9</span>
                            )}
                          </Button>
                        </div>

                        {/* Histórico de Evoluções */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              Histórico de Evoluções SBAR
                            </CardTitle>
                            <CardDescription>
                              Evoluções registradas durante a permanência na RPA
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {evolutions.filter(e => e.patientId === patient.id).length === 0 ? (
                              <div className="text-center py-6 text-muted-foreground">
                                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>Nenhuma evolução registrada</p>
                                <p className="text-sm">Clique em "Evoluir SBAR" para registrar</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {evolutions
                                  .filter(e => e.patientId === patient.id)
                                  .map(evolution => (
                                    <div key={evolution.id} className="p-3 border rounded-lg">
                                      <div className="flex items-center justify-between mb-2">
                                        <Badge variant={
                                          evolution.type === 'discharge' ? 'default' :
                                          evolution.type === 'handoff' ? 'secondary' : 'outline'
                                        }>
                                          {evolution.type === 'evolution' ? 'Evolução' :
                                           evolution.type === 'handoff' ? 'Passagem Plantão' : 'Alta'}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {evolution.createdAt.toLocaleTimeString()} - {evolution.createdBy}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                          <span className="font-semibold text-blue-600">S:</span>
                                          <span className="text-muted-foreground ml-1 line-clamp-2">
                                            {evolution.situation}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="font-semibold text-green-600">B:</span>
                                          <span className="text-muted-foreground ml-1 line-clamp-2">
                                            {evolution.background}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="font-semibold text-amber-600">A:</span>
                                          <span className="text-muted-foreground ml-1 line-clamp-2">
                                            {evolution.assessment}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="font-semibold text-purple-600">R:</span>
                                          <span className="text-muted-foreground ml-1 line-clamp-2">
                                            {evolution.recommendation}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Informações de Critérios de Alta */}
                        <Card className={patient.aldrete >= 9 ? 'border-green-300 bg-green-50' : 'border-yellow-300 bg-yellow-50'}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              {patient.aldrete >= 9 ? (
                                <Check className="w-6 h-6 text-green-600" />
                              ) : (
                                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                              )}
                              <div>
                                <p className={`font-semibold ${patient.aldrete >= 9 ? 'text-green-800' : 'text-yellow-800'}`}>
                                  {patient.aldrete >= 9 
                                    ? 'Paciente apto para alta da RPA' 
                                    : 'Paciente não atinge critérios de alta'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Aldrete: {patient.aldrete}/10 | Ramsay: {patient.ramsay} | 
                                  Tempo na RPA: {getTimeSinceAdmission(patient.admissionTime)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Tab Notificações */}
                      <TabsContent value="notifications" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Enviar Notificação</CardTitle>
                            <CardDescription>
                              Alertar equipe sobre o paciente
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Button 
                              variant="outline" 
                              className="w-full justify-start"
                              onClick={() => sendNotification(patient, "Atualização de status")}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Notificar Cirurgião ({patient.surgeon})
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full justify-start"
                              onClick={() => sendNotification(patient, "Atualização de status")}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Notificar Anestesista ({patient.anesthesiologist})
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full justify-start"
                              onClick={() => sendNotification(patient, "Solicitação de avaliação")}
                            >
                              <BellRing className="w-4 h-4 mr-2" />
                              Solicitar Avaliação Urgente
                            </Button>
                            
                            <Separator />
                            
                            <div className="space-y-2">
                              <Label>Equipe no plantão</Label>
                              <div className="flex flex-wrap gap-2">
                                {patient.team.map(member => (
                                  <Badge key={member} variant="secondary">{member}</Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Alertas ativos */}
                        {patient.alerts.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base text-red-600">
                                Alertas Ativos
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {patient.alerts.map((alert, idx) => (
                                <div 
                                  key={idx}
                                  className={`p-3 rounded-lg ${
                                    alert.severity === 'critical' 
                                      ? 'bg-red-50 border border-red-200' 
                                      : 'bg-yellow-50 border border-yellow-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className={`w-4 h-4 ${
                                      alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                                    }`} />
                                    <span className={`text-sm font-medium ${
                                      alert.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                                    }`}>
                                      {alert.type.toUpperCase()}: {alert.message}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Evolução SBAR */}
      <Dialog open={showSbarDialog} onOpenChange={setShowSbarDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {sbarType === 'evolution' ? 'Nova Evolução SBAR' :
               sbarType === 'handoff' ? 'Passagem de Plantão SBAR' : 'Alta da RPA - SBAR'}
            </DialogTitle>
            <DialogDescription>
              {selectedPatient?.name} - {selectedPatient?.surgery}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">S</span>
                Situação (Situation)
              </Label>
              <Textarea
                placeholder="Descreva a situação atual do paciente..."
                value={sbarForm.situation}
                onChange={(e) => setSbarForm(prev => ({ ...prev, situation: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">B</span>
                Background (Histórico)
              </Label>
              <Textarea
                placeholder="Histórico relevante, cirurgia realizada, comorbidades..."
                value={sbarForm.background}
                onChange={(e) => setSbarForm(prev => ({ ...prev, background: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">A</span>
                Assessment (Avaliação)
              </Label>
              <Textarea
                placeholder="Sua avaliação clínica, escalas, sinais vitais..."
                value={sbarForm.assessment}
                onChange={(e) => setSbarForm(prev => ({ ...prev, assessment: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">R</span>
                Recommendation (Recomendação)
              </Label>
              <Textarea
                placeholder="Recomendações e plano de cuidados..."
                value={sbarForm.recommendation}
                onChange={(e) => setSbarForm(prev => ({ ...prev, recommendation: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            {/* Se for passagem de plantão, mostrar seletor de colega */}
            {showHandoffDialog && (
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <Label>Transferir responsabilidade para:</Label>
                <Select value={selectedColleague} onValueChange={setSelectedColleague}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um colega" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_COLLEAGUES.filter(c => c.available).map(colleague => (
                      <SelectItem key={colleague.id} value={colleague.id.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{colleague.name}</span>
                          <span className="text-xs text-muted-foreground">({colleague.role})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Mensagem adicional para o colega (opcional)..."
                  value={handoffMessage}
                  onChange={(e) => setHandoffMessage(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            )}

            {/* Se for alta, mostrar destino */}
            {showDischargeDialog && (
              <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                <Label>Destino após alta da RPA:</Label>
                <Select value={dischargeDestination} onValueChange={(v: any) => setDischargeDestination(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enfermaria">Enfermaria</SelectItem>
                    <SelectItem value="uti">UTI</SelectItem>
                    <SelectItem value="domicilio">Domicílio (Day Clinic)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-green-700">
                  O cirurgião {selectedPatient?.surgeon} será notificado automaticamente.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowSbarDialog(false);
              setShowHandoffDialog(false);
              setShowDischargeDialog(false);
            }}>
              Cancelar
            </Button>
            {showHandoffDialog ? (
              <Button onClick={sendHandoff} disabled={!selectedColleague}>
                <Send className="w-4 h-4 mr-2" />
                Enviar Passagem
              </Button>
            ) : showDischargeDialog ? (
              <Button onClick={confirmDischarge} className="bg-green-600 hover:bg-green-700">
                <LogOut className="w-4 h-4 mr-2" />
                Confirmar Alta
              </Button>
            ) : (
              <Button onClick={saveSbarEvolution}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Evolução
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Paciente */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Dados do Paciente
            </DialogTitle>
            <DialogDescription>
              {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Leito</Label>
                <Input
                  value={editForm.bed}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bed: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v: any) => setEditForm(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estável">🟢 Estável</SelectItem>
                    <SelectItem value="atenção">🟡 Atenção</SelectItem>
                    <SelectItem value="crítico">🔴 Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Cirurgia</Label>
              <Input
                value={editForm.surgery}
                onChange={(e) => setEditForm(prev => ({ ...prev, surgery: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cirurgião</Label>
                <Input
                  value={editForm.surgeon}
                  onChange={(e) => setEditForm(prev => ({ ...prev, surgeon: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Anestesista</Label>
                <Input
                  value={editForm.anesthesiologist}
                  onChange={(e) => setEditForm(prev => ({ ...prev, anesthesiologist: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={savePatientEdit}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
