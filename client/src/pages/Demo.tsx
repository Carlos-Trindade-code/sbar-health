import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Activity, 
  ArrowLeft,
  ArrowRight,
  BarChart3, 
  Bed,
  Bell,
  Brain, 
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock, 
  FileText, 
  Heart,
  Hospital, 
  Loader2,
  Mic, 
  MicOff,
  Plus,
  Save,
  Search,
  Settings,
  Shield, 
  Sparkles,
  Stethoscope, 
  TrendingDown,
  TrendingUp,
  User,
  Users, 
  Zap,
  Calendar as CalendarIcon
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import FABMaster from "@/components/FABMaster";
import TeamChat from "@/components/TeamChat";
import WorkSchedule from "@/components/WorkSchedule";
import PricingPlans, { UsageLimits, TrialBanner } from "@/components/PricingPlans";
import HospitalExecutiveDashboard from "@/components/HospitalExecutiveDashboard";
import HospitalSelector from "@/components/HospitalSelector";
import TeamManager from "@/components/TeamManager";
import RemindersSystem from "@/components/RemindersSystem";
import useOfflineSync from "@/hooks/useOfflineSync";
import OfflineIndicator from "@/components/OfflineIndicator";
import useGeolocation from "@/hooks/useGeolocation";
import LocationIndicator from "@/components/LocationIndicator";
import { HeaderLogo } from "@/components/MascotLogo";
import { PrivacyIndicator, PrivacyBanner } from "@/components/PrivacyIndicator";
import DRGSystem from "@/components/DRGSystem";
import RecoveryRoom from "@/components/RecoveryRoom";
import DRGPredictor from "@/components/DRGPredictor";
import UserMenu, { MascotMenu } from "@/components/UserMenu";
import ConfirmDialog, { ArchivePatientConfirm, DischargePatientConfirm, PatientSelectorDialog, ActionBar } from "@/components/ConfirmDialog";
import ExportData from "@/components/ExportData";
import TeamInviteSystem from "@/components/TeamInviteSystem";
import { TigerReactionProvider, useTigerReaction, TigerReactionDemo } from "@/components/TigerReaction";
import MorningBrief from "@/components/MorningBrief";

// Mock Data
const mockPatients = [
  { 
    id: 1, 
    name: "Maria Silva Santos", 
    bed: "UTI-01", 
    priority: "critical", 
    diagnosis: "Pneumonia grave + Sepse",
    age: 68,
    insurance: "SUS",
    admissionDate: "2026-01-28",
    daysAdmitted: 3,
    lastEvolution: "2h atrás",
    dischargeProbability: 15,
    estimatedStay: 7
  },
  { 
    id: 2, 
    name: "João Pedro Oliveira", 
    bed: "UTI-02", 
    priority: "high", 
    diagnosis: "IAM anterior extenso",
    age: 55,
    insurance: "Unimed",
    admissionDate: "2026-01-29",
    daysAdmitted: 2,
    lastEvolution: "4h atrás",
    dischargeProbability: 35,
    estimatedStay: 5
  },
  { 
    id: 3, 
    name: "Ana Costa Ferreira", 
    bed: "ENF-12", 
    priority: "medium", 
    diagnosis: "Diabetes descompensada",
    age: 45,
    insurance: "Bradesco",
    admissionDate: "2026-01-30",
    daysAdmitted: 1,
    lastEvolution: "1h atrás",
    dischargeProbability: 70,
    estimatedStay: 2
  },
  { 
    id: 4, 
    name: "Carlos Eduardo Lima", 
    bed: "ENF-08", 
    priority: "low", 
    diagnosis: "Pós-operatório colecistectomia",
    age: 38,
    insurance: "Particular",
    admissionDate: "2026-01-31",
    daysAdmitted: 0,
    lastEvolution: "30min atrás",
    dischargeProbability: 90,
    estimatedStay: 1
  },
  { 
    id: 5, 
    name: "Fernanda Rodrigues", 
    bed: "UTI-03", 
    priority: "critical", 
    diagnosis: "AVC isquêmico extenso",
    age: 72,
    insurance: "SUS",
    admissionDate: "2026-01-27",
    daysAdmitted: 4,
    lastEvolution: "6h atrás",
    dischargeProbability: 10,
    estimatedStay: 14
  },
];

const mockEvolutions = [
  {
    id: 1,
    date: "31/01/2026 08:30",
    author: "Dr. Carlos Mendes",
    situation: "Paciente em ventilação mecânica, sedada, hemodinamicamente estável com noradrenalina 0.1mcg/kg/min.",
    background: "Internada há 3 dias por pneumonia comunitária grave evoluindo com sepse. Culturas pendentes.",
    assessment: "Melhora do padrão respiratório nas últimas 24h. Leucócitos em queda. Mantém febre baixa.",
    recommendation: "Manter antibioticoterapia. Tentar desmame de sedação amanhã. Solicitar procalcitonina de controle."
  },
  {
    id: 2,
    date: "30/01/2026 14:00",
    author: "Dra. Ana Paula",
    situation: "Paciente intubada, sedada, instável hemodinamicamente.",
    background: "D2 de internação. Pneumonia grave bilateral. Iniciado Meropenem + Vancomicina.",
    assessment: "Piora do quadro respiratório. Necessitou aumento de parâmetros ventilatórios.",
    recommendation: "Aumentar suporte. Considerar pronação se não houver melhora em 6h."
  }
];

const weeklyData = [
  { day: 'Seg', evolutions: 12, admissions: 3 },
  { day: 'Ter', evolutions: 19, admissions: 5 },
  { day: 'Qua', evolutions: 15, admissions: 2 },
  { day: 'Qui', evolutions: 22, admissions: 4 },
  { day: 'Sex', evolutions: 18, admissions: 3 },
  { day: 'Sáb', evolutions: 8, admissions: 1 },
  { day: 'Dom', evolutions: 5, admissions: 1 },
];

const insuranceData = [
  { name: 'SUS', value: 45, color: '#0d9488' },
  { name: 'Unimed', value: 25, color: '#f59e0b' },
  { name: 'Bradesco', value: 15, color: '#3b82f6' },
  { name: 'Particular', value: 10, color: '#8b5cf6' },
  { name: 'Outros', value: 5, color: '#6b7280' },
];

const outcomeData = [
  { name: 'Alta melhorada', value: 65, color: '#10b981' },
  { name: 'Alta curada', value: 20, color: '#0d9488' },
  { name: 'Transferência', value: 10, color: '#f59e0b' },
  { name: 'Óbito', value: 5, color: '#ef4444' },
];

const dailyTrend = [
  { date: '25/01', admissions: 12, discharges: 10 },
  { date: '26/01', admissions: 15, discharges: 13 },
  { date: '27/01', admissions: 8, discharges: 14 },
  { date: '28/01', admissions: 18, discharges: 12 },
  { date: '29/01', admissions: 14, discharges: 16 },
  { date: '30/01', admissions: 11, discharges: 15 },
  { date: '31/01', admissions: 9, discharges: 11 },
];

const teamPerformance = [
  { team: 'Cardiologia', avgStay: 4.2, dischargeRate: 92, evolutions: 156 },
  { team: 'Pneumologia', avgStay: 5.8, dischargeRate: 88, evolutions: 134 },
  { team: 'Clínica Médica', avgStay: 6.1, dischargeRate: 85, evolutions: 189 },
  { team: 'Cirurgia', avgStay: 3.5, dischargeRate: 95, evolutions: 98 },
];

type DemoView = 'dashboard' | 'patient' | 'evolution' | 'new-patient' | 'analytics' | 'hospital' | 'settings' | 'chat' | 'schedule' | 'pricing' | 'hospitals' | 'teams' | 'reminders' | 'drg' | 'recovery' | 'drg-predictor' | 'team-invites';

// Componente interno da Demo
function DemoContent() {
  // Reações do mascote desativadas - usando no-op
  const tiger = { error: () => {}, success: () => {}, thinking: () => {}, showReaction: () => {}, celebrate: () => {} };
  const [currentView, setCurrentView] = useState<DemoView>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  // Offline sync
  const {
    status: offlineStatus,
    pendingOperations,
    addPendingOperation,
    forceSync,
    clearPendingOperations,
    isOnline,
  } = useOfflineSync();
  
  // Geolocation
  const geoState = useGeolocation({ enableHighAccuracy: true });
  
  // Accordion/Collapsible states for inline expansion
  const [expandedPatientId, setExpandedPatientId] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Settings accordion state
  const [openSettingsSections, setOpenSettingsSections] = useState<string[]>(['perfil']);
  const [showEvolutionForm, setShowEvolutionForm] = useState(false);
  
  // SBAR Form state
  const [sbarForm, setSbarForm] = useState({
    situation: "",
    background: "",
    assessment: "",
    recommendation: ""
  });

  // New patient form
  const [newPatientForm, setNewPatientForm] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    gender: "",
    phone: "",
    bed: "",
    diagnosis: "",
    priority: "medium",
    registrationNumber: "",
    hospital: "",
    team: ""
  });

  // Confirmation dialogs state
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDischargeConfirm, setShowDischargeConfirm] = useState(false);
  const [showPatientSelector, setShowPatientSelector] = useState(false);
  const [patientToArchive, setPatientToArchive] = useState<typeof mockPatients[0] | null>(null);
  const [patientToDischarge, setPatientToDischarge] = useState<typeof mockPatients[0] | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return priority;
    }
  };

  const filteredPatients = mockPatients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.bed.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || p.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleVoiceInput = (field: keyof typeof sbarForm) => {
    setIsRecording(true);
    toast.info("🎤 Gravando... Fale agora!");
    
    // Simulate voice recording
    setTimeout(() => {
      setIsRecording(false);
      const mockTranscriptions: Record<string, string> = {
        situation: "Paciente consciente, orientado, afebril, eupneico em ar ambiente. Sinais vitais estáveis.",
        background: "Internado há 2 dias por pneumonia comunitária. Em uso de Ceftriaxona D3. Sem comorbidades.",
        assessment: "Boa evolução clínica. Melhora do padrão respiratório. Leucócitos em queda.",
        recommendation: "Manter antibioticoterapia. Programar alta para amanhã se mantiver estável."
      };
      setSbarForm(prev => ({ ...prev, [field]: mockTranscriptions[field] }));
      toast.success("✅ Transcrição concluída!");
    }, 2000);
  };

  const handleSaveEvolution = () => {
    setIsSaving(true);
    
    // Check if we have content to save
    if (!sbarForm.situation && !sbarForm.background && !sbarForm.assessment && !sbarForm.recommendation) {
      toast.error("Preencha pelo menos um campo da evolução SBAR");
      // tiger desativado
      setIsSaving(false);
      return;
    }
    
    // If offline, save to pending queue
    if (!isOnline) {
      addPendingOperation(
        'evolution',
        { ...sbarForm, patientId: selectedPatient.id, timestamp: Date.now() },
        selectedPatient.id,
        selectedPatient.name
      );
      setIsSaving(false);
      setSbarForm({ situation: "", background: "", assessment: "", recommendation: "" });
      setShowEvolutionForm(false);
      return;
    }
    
    // Online: simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("✅ Evolução salva com sucesso!");
      // tiger desativado
      setSbarForm({ situation: "", background: "", assessment: "", recommendation: "" });
      setShowEvolutionForm(false);
    }, 1500);
  };

  const handleAiAnalysis = () => {
    setIsAnalyzing(true);
    toast.info("🧠 Analisando dados do paciente...");
    // tiger desativado
    
    setTimeout(() => {
      setIsAnalyzing(false);
      // tiger desativado
      toast.success(
        <div className="space-y-2">
          <p className="font-semibold">Análise IA Concluída</p>
          <p>📊 Probabilidade de alta: {selectedPatient.dischargeProbability}%</p>
          <p>📅 Tempo estimado: {selectedPatient.estimatedStay} dias</p>
        </div>,
        { duration: 5000 }
      );
    }, 3000);
  };

  const handleCreatePatient = () => {
    if (!newPatientForm.name || !newPatientForm.bed) {
      toast.error("Preencha nome e leito do paciente");
      // tiger desativado
      return;
    }
    
    setIsSaving(true);
    
    // If offline, save to pending queue
    if (!isOnline) {
      addPendingOperation(
        'patient',
        { ...newPatientForm, timestamp: Date.now() },
        undefined,
        newPatientForm.name
      );
      setIsSaving(false);
      setCurrentView('dashboard');
      setNewPatientForm({
        name: "", cpf: "", birthDate: "", gender: "", phone: "", bed: "", diagnosis: "", priority: "medium", registrationNumber: "", hospital: "", team: ""
      });
      return;
    }
    
    // Online: simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("✅ Paciente cadastrado com sucesso!");
      // tiger desativado
      setCurrentView('dashboard');
      setNewPatientForm({
        name: "", cpf: "", birthDate: "", gender: "", phone: "", bed: "", diagnosis: "", priority: "medium", registrationNumber: "", hospital: "", team: ""
      });
    }, 1500);
  };

  // Render functions for each view
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Morning Brief - Resumo do Dia */}
      <MorningBrief 
        isDemo={true} 
        userName="Dr. Carlos"
        onNavigate={(view) => setCurrentView(view as DemoView)}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">{mockPatients.length}</p>
                <p className="text-xs text-muted-foreground">Pacientes ativos</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-500/10 to-red-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-red-600">2</p>
                <p className="text-xs text-muted-foreground">Críticos</p>
              </div>
              <Heart className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">3</p>
                <p className="text-xs text-muted-foreground">Alta hoje</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">12</p>
                <p className="text-xs text-muted-foreground">Evoluções hoje</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar paciente, leito ou diagnóstico..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="low">Baixo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patient List - Accordion Style */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Bed className="w-5 h-5" />
          Pacientes por Leito
          <span className="text-sm font-normal text-muted-foreground">(clique para expandir)</span>
        </h2>
        {filteredPatients.map(patient => (
          <Collapsible 
            key={patient.id}
            open={expandedPatientId === patient.id}
            onOpenChange={(open) => {
              setExpandedPatientId(open ? patient.id : null);
              if (open) {
                setSelectedPatient(patient);
                setShowEvolutionForm(false);
                setExpandedSection(null);
              }
            }}
          >
            <Card className="patient-card relative overflow-hidden" data-expanded={expandedPatientId === patient.id}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(patient.priority)}`} />
              <CollapsibleTrigger className="w-full text-left">
                <CardContent className="p-4 pl-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{patient.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {patient.bed}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.diagnosis}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {patient.lastEvolution}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          D{patient.daysAdmitted}
                        </span>
                        <span>{patient.insurance}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right space-y-1">
                        <Badge className={`${getPriorityColor(patient.priority)} text-white`}>
                          {getPriorityLabel(patient.priority)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs">
                          <Brain className="w-3 h-3 text-primary" />
                          <span className="text-primary font-medium">{patient.dischargeProbability}% alta</span>
                        </div>
                      </div>
                      {expandedPatientId === patient.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground accordion-chevron" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground accordion-chevron" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="collapsible-content">
                <div className="patient-card-content border-t bg-muted/30" data-state={expandedPatientId === patient.id ? 'open' : 'closed'}>
                  {/* Patient Details Inline */}
                  <div className="p-4 pl-5 space-y-4">
                    {/* Quick Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Idade</p>
                        <p className="font-semibold">{patient.age} anos</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Internação</p>
                        <p className="font-semibold">D{patient.daysAdmitted}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prob. Alta</p>
                        <p className="font-semibold text-primary">{patient.dischargeProbability}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tempo Est.</p>
                        <p className="font-semibold">{patient.estimatedStay} dias</p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEvolutionForm(!showEvolutionForm);
                        }}
                        className="gap-1 action-button"
                      >
                        <FileText className="w-4 h-4" />
                        {showEvolutionForm ? 'Fechar Evolução' : 'Nova Evolução SBAR'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAiAnalysis();
                        }}
                        disabled={isAnalyzing}
                        className="gap-1 action-button"
                      >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                        Análise IA
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedSection(expandedSection === 'history' ? null : 'history');
                        }}
                        className="gap-1 action-button"
                      >
                        <Clock className="w-4 h-4" />
                        Histórico
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success("Alta programada com sucesso!");
                        }}
                        className="gap-1 action-button text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Dar Alta
                      </Button>
                    </div>
                    
                    {/* Evolution Form Inline */}
                    {showEvolutionForm && (
                      <div className="border rounded-lg p-4 bg-white space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          Evolução SBAR
                        </h4>
                        <div className="grid gap-4">
                          {(['situation', 'background', 'assessment', 'recommendation'] as const).map((field) => (
                            <div key={field} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="capitalize font-medium">
                                  {field === 'situation' ? 'S - Situação' :
                                   field === 'background' ? 'B - Histórico' :
                                   field === 'assessment' ? 'A - Avaliação' :
                                   'R - Recomendação'}
                                </Label>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVoiceInput(field);
                                  }}
                                  disabled={isRecording}
                                  className="gap-1"
                                >
                                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                  Ditar
                                </Button>
                              </div>
                              <Textarea
                                value={sbarForm[field]}
                                onChange={(e) => setSbarForm(prev => ({ ...prev, [field]: e.target.value }))}
                                placeholder={`Digite ou dite ${field === 'situation' ? 'a situação atual' :
                                  field === 'background' ? 'o histórico' :
                                  field === 'assessment' ? 'sua avaliação' :
                                  'suas recomendações'}...`}
                                className="min-h-[80px]"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEvolution();
                            }} 
                            disabled={isSaving}
                            className="gap-1"
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Salvar Evolução
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowEvolutionForm(false);
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* History Section Inline */}
                    {expandedSection === 'history' && (
                      <div className="border rounded-lg p-4 bg-white space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          Histórico de Evoluções
                        </h4>
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">Dr. Carlos Mendes</span>
                                <span className="text-muted-foreground text-xs">
                                  {new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-muted-foreground">
                                Paciente evoluindo bem. Mantido tratamento atual. Programada reavaliação.
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );

  const renderPatientDetail = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      {/* Patient Header */}
      <Card className="relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${getPriorityColor(selectedPatient.priority)}`} />
        <CardHeader className="pl-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{selectedPatient.name}</CardTitle>
              <CardDescription className="text-base">{selectedPatient.diagnosis}</CardDescription>
            </div>
            <div className="text-right space-y-2">
              <Badge className={`${getPriorityColor(selectedPatient.priority)} text-white text-lg px-4 py-1`}>
                {selectedPatient.bed}
              </Badge>
              <p className="text-sm text-muted-foreground">{selectedPatient.insurance}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pl-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Idade</p>
              <p className="font-semibold">{selectedPatient.age} anos</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Internação</p>
              <p className="font-semibold">D{selectedPatient.daysAdmitted}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prob. Alta</p>
              <p className="font-semibold text-primary">{selectedPatient.dischargeProbability}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo Est.</p>
              <p className="font-semibold">{selectedPatient.estimatedStay} dias</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Prediction */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Análise Preditiva IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Probabilidade de Alta</p>
              <div className="flex items-center gap-3">
                <Progress value={selectedPatient.dischargeProbability} className="flex-1" />
                <span className="font-bold text-primary">{selectedPatient.dischargeProbability}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tempo Estimado de Internação</p>
              <p className="text-2xl font-bold">{selectedPatient.estimatedStay} dias</p>
            </div>
            <div className="flex items-center">
              <Button onClick={handleAiAnalysis} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Atualizar Análise
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => setCurrentView('evolution')} className="flex-1">
          <FileText className="w-4 h-4 mr-2" />
          Nova Evolução SBAR
        </Button>
        <Button variant="outline">
          <Clock className="w-4 h-4 mr-2" />
          Histórico
        </Button>
      </div>

      {/* Evolution History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Últimas Evoluções
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockEvolutions.map(evo => (
            <div key={evo.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{evo.author}</span>
                </div>
                <span className="text-sm text-muted-foreground">{evo.date}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-red-600 mb-1">S - Situação</p>
                  <p className="text-muted-foreground">{evo.situation}</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-600 mb-1">B - Background</p>
                  <p className="text-muted-foreground">{evo.background}</p>
                </div>
                <div>
                  <p className="font-semibold text-amber-600 mb-1">A - Avaliação</p>
                  <p className="text-muted-foreground">{evo.assessment}</p>
                </div>
                <div>
                  <p className="font-semibold text-green-600 mb-1">R - Recomendação</p>
                  <p className="text-muted-foreground">{evo.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderEvolution = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setCurrentView('patient')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para {selectedPatient.name}
      </Button>

      {/* Privacy Banner */}
      <PrivacyBanner level="team-only" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Nova Evolução SBAR
          </CardTitle>
          <CardDescription>
            {selectedPatient.name} - {selectedPatient.bed}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Situation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-red-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-sm">S</span>
                Situação
              </Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleVoiceInput('situation')}
                disabled={isRecording}
              >
                {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isRecording ? "Gravando..." : "Ditar"}
              </Button>
            </div>
            <Textarea 
              placeholder="Descreva a situação atual do paciente: estado geral, sinais vitais, queixas..."
              value={sbarForm.situation}
              onChange={(e) => setSbarForm(prev => ({ ...prev, situation: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Background */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-blue-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">B</span>
                Background
              </Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleVoiceInput('background')}
                disabled={isRecording}
              >
                {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isRecording ? "Gravando..." : "Ditar"}
              </Button>
            </div>
            <Textarea 
              placeholder="Histórico relevante: motivo da internação, comorbidades, medicações, exames..."
              value={sbarForm.background}
              onChange={(e) => setSbarForm(prev => ({ ...prev, background: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Assessment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-amber-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm">A</span>
                Avaliação
              </Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleVoiceInput('assessment')}
                disabled={isRecording}
              >
                {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isRecording ? "Gravando..." : "Ditar"}
              </Button>
            </div>
            <Textarea 
              placeholder="Sua avaliação clínica: impressão diagnóstica, evolução, prognóstico..."
              value={sbarForm.assessment}
              onChange={(e) => setSbarForm(prev => ({ ...prev, assessment: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Recommendation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-green-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">R</span>
                Recomendação
              </Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleVoiceInput('recommendation')}
                disabled={isRecording}
              >
                {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isRecording ? "Gravando..." : "Ditar"}
              </Button>
            </div>
            <Textarea 
              placeholder="Plano terapêutico: condutas, solicitações, previsão de alta..."
              value={sbarForm.recommendation}
              onChange={(e) => setSbarForm(prev => ({ ...prev, recommendation: e.target.value }))}
              rows={3}
            />
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button onClick={handleSaveEvolution} disabled={isSaving} className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Evolução
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleAiAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              Análise IA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNewPatient = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Paciente
          </CardTitle>
          <CardDescription>
            Cadastro ultrarrápido com detecção de duplicatas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input 
                placeholder="Nome do paciente"
                value={newPatientForm.name}
                onChange={(e) => setNewPatientForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input 
                placeholder="000.000.000-00"
                value={newPatientForm.cpf}
                onChange={(e) => setNewPatientForm(prev => ({ ...prev, cpf: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Input 
                type="date"
                value={newPatientForm.birthDate}
                onChange={(e) => setNewPatientForm(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select 
                value={newPatientForm.gender} 
                onValueChange={(v) => setNewPatientForm(prev => ({ ...prev, gender: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Leito *</Label>
              <Input 
                placeholder="Ex: UTI-01, ENF-12"
                value={newPatientForm.bed}
                onChange={(e) => setNewPatientForm(prev => ({ ...prev, bed: e.target.value.toUpperCase() }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select 
                value={newPatientForm.priority} 
                onValueChange={(v) => setNewPatientForm(prev => ({ ...prev, priority: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Diagnóstico Principal</Label>
            <Textarea 
              placeholder="Diagnóstico de admissão"
              value={newPatientForm.diagnosis}
              onChange={(e) => setNewPatientForm(prev => ({ ...prev, diagnosis: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Campos opcionais - não bloqueiam o cadastro */}
          <Separator />
          <p className="text-sm text-muted-foreground">Campos opcionais (pode preencher depois)</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nº Registro/Prontuário</Label>
              <Input 
                placeholder="Ex: 123456"
                value={newPatientForm.registrationNumber}
                onChange={(e) => setNewPatientForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Hospital</Label>
              <Select 
                value={newPatientForm.hospital} 
                onValueChange={(v) => setNewPatientForm(prev => ({ ...prev, hospital: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hc-fmusp">HC-FMUSP</SelectItem>
                  <SelectItem value="einstein">Hospital Albert Einstein</SelectItem>
                  <SelectItem value="sirio">Hospital Sírio-Libanês</SelectItem>
                  <SelectItem value="incor">InCor</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Equipe</Label>
              <Select 
                value={newPatientForm.team} 
                onValueChange={(v) => setNewPatientForm(prev => ({ ...prev, team: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinica">Equipe Clínica</SelectItem>
                  <SelectItem value="cirurgica">Equipe Cirúrgica</SelectItem>
                  <SelectItem value="uti">UTI</SelectItem>
                  <SelectItem value="pessoal">Uso Pessoal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCurrentView('dashboard')} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleCreatePatient} disabled={isSaving} className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Cadastrar Paciente
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground">Internações/mês</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">142</p>
                <p className="text-xs text-muted-foreground">Altas</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-muted-foreground">Dias médios</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">577</p>
                <p className="text-xs text-muted-foreground">Evoluções</p>
              </div>
              <FileText className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Atividade Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="evolutions" fill="#0d9488" name="Evoluções" radius={[4, 4, 0, 0]} />
                <Bar dataKey="admissions" fill="#f59e0b" name="Internações" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Convênios Atendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={insuranceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {insuranceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Médicos Mais Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Dr. Carlos Mendes", evolutions: 89 },
              { name: "Dra. Ana Paula", evolutions: 76 },
              { name: "Dr. Roberto Silva", evolutions: 65 },
              { name: "Dra. Fernanda Lima", evolutions: 58 },
              { name: "Dr. João Pedro", evolutions: 45 },
            ].map((doc, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{doc.name}</p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(doc.evolutions / 89) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium">{doc.evolutions} evoluções</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHospitalDashboard = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Hospital São Lucas</h1>
          <p className="text-muted-foreground">Dashboard Executivo</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">94%</p>
                <p className="text-xs text-muted-foreground">Taxa de alta positiva</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
            </div>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +2.3% vs mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">4.8</p>
                <p className="text-xs text-muted-foreground">Dias médios internação</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              -0.5 dias vs mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-amber-600">87%</p>
                <p className="text-xs text-muted-foreground">Ocupação</p>
              </div>
              <Activity className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              120 leitos totais
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">1.2k</p>
                <p className="text-xs text-muted-foreground">Evoluções/mês</p>
              </div>
              <FileText className="w-8 h-8 text-green-500 opacity-50" />
            </div>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +15% produtividade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fluxo de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="admissions" stroke="#0d9488" name="Internações" strokeWidth={2} />
                <Line type="monotone" dataKey="discharges" stroke="#10b981" name="Altas" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Desfechos Clínicos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance por Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Equipe</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Tempo Médio</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Taxa Alta</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Evoluções</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.map((team, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{team.team}</td>
                    <td className="text-center py-3 px-4">
                      <span className={team.avgStay < 5 ? 'text-green-600' : 'text-amber-600'}>
                        {team.avgStay} dias
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={team.dischargeRate >= 90 ? 'text-green-600' : 'text-amber-600'}>
                        {team.dischargeRate}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">{team.evolutions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => {
    const openSections = openSettingsSections;
    
    const toggleSection = (section: string) => {
      setOpenSettingsSections(prev => 
        prev.includes(section) 
          ? prev.filter(s => s !== section)
          : [...prev, section]
      );
    };
    
    return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Dashboard
      </Button>
      
      <p className="text-sm text-muted-foreground mb-4">Clique nas seções para expandir/colapsar</p>

      {/* Perfil - Collapsible */}
      <Collapsible open={openSections.includes('perfil')} onOpenChange={() => toggleSection('perfil')}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle>Perfil</CardTitle>
                </div>
                {openSections.includes('perfil') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input defaultValue="Dr. Carlos Mendes" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="carlos.mendes@hospital.com" />
                </div>
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input defaultValue="Cardiologia" />
                </div>
                <div className="space-y-2">
                  <Label>CRM</Label>
                  <Input defaultValue="123456-SP" />
                </div>
              </div>
              <Button onClick={() => toast.success("Perfil atualizado!")}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <CardTitle>Plano</CardTitle>
            </div>
            <Badge className="bg-primary">PRO</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pacientes ativos</span>
              <span className="font-medium">5/100</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Análises IA</span>
              <span className="font-medium">23/100</span>
            </div>
            <Separator />
            <Button variant="outline" className="w-full" onClick={() => toast.info("Upgrade em breve!")}>
              Fazer Upgrade para Enterprise
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle>Hospitais</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Hospital São Lucas</p>
                <p className="text-xs text-muted-foreground">HSL</p>
              </div>
              <Badge variant="outline">Privado</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Hospital Municipal</p>
                <p className="text-xs text-muted-foreground">HM</p>
              </div>
              <Badge variant="outline">Público</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access to New Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Funcionalidades</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setCurrentView('chat')}>
              <Users className="w-5 h-5" />
              <span>Chat da Equipe</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setCurrentView('schedule')}>
              <CalendarIcon className="w-5 h-5" />
              <span>Escala e Ranking</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setCurrentView('pricing')}>
              <Zap className="w-5 h-5" />
              <span>Planos e Preços</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setCurrentView('hospital')}>
              <Building2 className="w-5 h-5" />
              <span>Dashboard Hospital</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setCurrentView('hospitals')}>
              <Building2 className="w-5 h-5" />
              <span>Hospitais</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setCurrentView('teams')}>
              <Users className="w-5 h-5" />
              <span>Equipes</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-primary text-primary" onClick={() => setCurrentView('team-invites')}>
              <Users className="w-5 h-5" />
              <span>Convites</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setCurrentView('reminders')}>
              <Bell className="w-5 h-5" />
              <span>Lembretes</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setCurrentView('drg')}>
              <BarChart3 className="w-5 h-5" />
              <span>DRG</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-primary text-primary" onClick={() => setCurrentView('drg-predictor')}>
              <Brain className="w-5 h-5" />
              <span>IA Preditor</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setCurrentView('recovery')}>
              <Heart className="w-5 h-5" />
              <span>Recuperação</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-primary hidden sm:block">SBAR Global</span>
            <Badge variant="outline" className="text-xs">DEMO</Badge>
            <PrivacyIndicator level="team-only" showPopover size="sm" />
          </div>
          <div className="flex items-center gap-3">
            <LocationIndicator
              state={geoState}
              onRequestLocation={geoState.requestLocation}
            />
            <OfflineIndicator
              status={offlineStatus}
              pendingOperations={pendingOperations}
              onForceSync={forceSync}
              onClearPending={clearPendingOperations}
            />
            <UserMenu 
              isDemo={true} 
              onNavigate={(view) => setCurrentView(view as DemoView)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'patient' && renderPatientDetail()}
        {currentView === 'evolution' && renderEvolution()}
        {currentView === 'new-patient' && renderNewPatient()}
        {currentView === 'analytics' && renderAnalytics()}
        {currentView === 'hospital' && <HospitalExecutiveDashboard isDemo={true} />}
        {currentView === 'settings' && renderSettings()}
        {currentView === 'chat' && <TeamChat isDemo={true} />}
        {currentView === 'schedule' && <WorkSchedule isDemo={true} />}
        {currentView === 'pricing' && (
          <div className="space-y-6">
            <TrialBanner daysRemaining={23} onUpgrade={() => setCurrentView('pricing')} />
            <UsageLimits 
              plan="free" 
              usage={{ patients: 3, evolutions: 18, aiUses: 6, whatsappMessages: 0 }} 
            />
            <PricingPlans currentPlan="free" isDemo={true} />
          </div>
        )}
        {currentView === 'hospitals' && <HospitalSelector isDemo={true} />}
        {currentView === 'teams' && <TeamManager isDemo={true} />}
        {currentView === 'reminders' && <RemindersSystem isDemo={true} />}
        {currentView === 'drg' && <DRGSystem isDemo={true} />}
        {currentView === 'recovery' && <RecoveryRoom isDemo={true} />}
        {currentView === 'drg-predictor' && <DRGPredictor isDemo={true} />}
        {currentView === 'team-invites' && <TeamInviteSystem isDemo={true} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-40">
        <div className="flex justify-around items-center h-16">
          <button 
            className={`flex flex-col items-center gap-1 ${currentView === 'dashboard' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <Activity className="w-5 h-5" />
            <span className="text-xs font-medium">Início</span>
          </button>
          <button 
            className={`flex flex-col items-center gap-1 ${currentView === 'new-patient' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setCurrentView('new-patient')}
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">Novo</span>
          </button>
          <button 
            className={`flex flex-col items-center gap-1 ${currentView === 'settings' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setCurrentView('settings')}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">Config</span>
          </button>
        </div>
      </nav>

      {/* FAB Master - Botão Flutuante */}
      <FABMaster
        isDemo={true}
        onNewPatient={() => setCurrentView('new-patient')}
        onNewEvolution={() => {
          // Se não tem paciente selecionado, abre seletor
          if (!selectedPatient || !expandedPatientId) {
            setShowPatientSelector(true);
          } else {
            setSbarForm({
              situation: "",
              background: "",
              assessment: "",
              recommendation: ""
            });
            setShowEvolutionForm(true);
          }
        }}
        onDischarge={() => {
          if (selectedPatient) {
            setPatientToDischarge(selectedPatient);
            setShowDischargeConfirm(true);
          } else {
            toast.error("Selecione um paciente primeiro");
          }
        }}
        onArchive={() => {
          if (selectedPatient) {
            setPatientToArchive(selectedPatient);
            setShowArchiveConfirm(true);
          } else {
            toast.error("Selecione um paciente primeiro");
          }
        }}
        currentPatientId={selectedPatient?.id}
      />

      {/* Confirmation Dialogs */}
      <ArchivePatientConfirm
        open={showArchiveConfirm}
        onOpenChange={setShowArchiveConfirm}
        patientName={patientToArchive?.name}
        onConfirm={() => {
          toast.success("Paciente arquivado!", {
            description: `${patientToArchive?.name} foi arquivado com sucesso.`
          });
          // tiger desativado
          setPatientToArchive(null);
        }}
      />

      <DischargePatientConfirm
        open={showDischargeConfirm}
        onOpenChange={setShowDischargeConfirm}
        patientName={patientToDischarge?.name}
        onConfirm={() => {
          toast.success("Paciente recebeu alta!", {
            description: `${patientToDischarge?.name} foi movido para pacientes com alta.`
          });
          // tiger desativado
          setPatientToDischarge(null);
        }}
      />

      <PatientSelectorDialog
        open={showPatientSelector}
        onOpenChange={setShowPatientSelector}
        patients={mockPatients}
        onSelect={(patient) => {
          setSelectedPatient(patient as typeof mockPatients[0]);
          setExpandedPatientId(patient.id);
          setSbarForm({
            situation: "",
            background: "",
            assessment: "",
            recommendation: ""
          });
          setShowEvolutionForm(true);
          toast.info(`Evolução para ${patient.name}`);
        }}
      />
    </div>
  );
}


// Componente principal que envolve com TigerReactionProvider
export default function Demo() {
  return (
    <TigerReactionProvider>
      <DemoContent />
    </TigerReactionProvider>
  );
}
