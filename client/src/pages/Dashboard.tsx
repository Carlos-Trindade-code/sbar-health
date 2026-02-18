import { useAuth } from "@/_core/hooks/useAuth";
import { DiagnosisDisplay } from "@/components/DiagnosisTranslator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { 
  Activity, 
  Bell, 
  Brain, 
  Clock, 
  FileText, 
  LogOut, 
  Plus, 
  Search, 
  Settings, 
  Users,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingUp,
  Sun,
  Moon,
  Sunrise,
  Sparkles,
  ArrowRight,
  X,
  Zap,
  CheckCircle2,
  Mic,
  Camera,
  Keyboard,
  UserPlus,
  Archive,
  History,
  Stethoscope,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Save,
  XCircle,
  AlertTriangle,
  Copy,
  Printer
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { TigerReactionProvider, useTigerReaction } from "@/components/TigerReaction";
import { HeaderLogo, MascotLogo } from "@/components/MascotLogo";
import UserMenu from "@/components/UserMenu";
import FABMaster from "@/components/FABMaster";
import CommandPalette from "@/components/CommandPalette";
import OnboardingTour from "@/components/OnboardingTour";
import useOfflineSync from "@/hooks/useOfflineSync";
import OfflineIndicator from "@/components/OfflineIndicator";
import useGeolocation from "@/hooks/useGeolocation";
import LocationIndicator from "@/components/LocationIndicator";
import { PrivacyIndicator } from "@/components/PrivacyIndicator";
import RemindersSystem from "@/components/RemindersSystem";
import TeamChat from "@/components/TeamChat";
import { isFeatureEnabled } from "@/hooks/useFeatureFlag";

type Priority = "critical" | "high" | "medium" | "low";

interface AdmissionWithPatient {
  id: number;
  patientId: number;
  bed: string;
  priority: Priority;
  mainDiagnosis: string | null;
  admissionDate: Date;
  hospitalId: number;
  patient?: {
    id: number;
    name: string;
  };
  team?: {
    id: number;
    name: string;
    color: string | null;
  };
  hospital?: {
    id: number;
    name: string;
  };
}

// Gera texto de relatório de turno para todos os pacientes visíveis
function generateTurnReport(
  admissions: AdmissionWithPatient[],
  latestEvoMap: Map<number, any>,
  hospitalName: string,
  doctorName: string
): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const priorityLabel = (p: string) => {
    if (p === 'critical') return 'CRITICO';
    if (p === 'high') return 'Alto';
    if (p === 'medium') return 'Medio';
    return 'Baixo';
  };

  const daysSince = (date: Date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 'Admitido hoje' : `${diff} dia${diff !== 1 ? 's' : ''}`;
  };

  const lines: string[] = [
    '===================================================',
    '       RELATORIO DE TURNO - SBAR Health',
    '===================================================',
    `Hospital  : ${hospitalName}`,
    `Data/Hora : ${dateStr}`,
    `Medico    : ${doctorName}`,
    `Pacientes : ${admissions.length}`,
    '===================================================',
    '',
  ];

  admissions.forEach((a, i) => {
    const name = a.patient?.name || '—';
    const priority = priorityLabel(a.priority);
    const days = daysSince(a.admissionDate);
    const diagnosis = a.mainDiagnosis || '—';
    const evo = latestEvoMap.get(a.id);

    lines.push(`[${i + 1}] ${name}`);
    lines.push(`    Leito: ${a.bed || '—'}  |  Prioridade: ${priority}  |  ${days}`);
    lines.push(`    Diagnostico: ${diagnosis}`);
    if (evo) {
      if (evo.situation) lines.push(`    S: ${evo.situation}`);
      if (evo.assessment) lines.push(`    A: ${evo.assessment}`);
      if (evo.recommendation) lines.push(`    R: ${evo.recommendation}`);
    } else {
      lines.push(`    (sem evolucao hoje)`);
    }
    lines.push('   ---------------------------------------------------');
    lines.push('');
  });

  lines.push(`Gerado por SBAR Health em ${dateStr}`);
  return lines.join('\n');
}

// Abre janela de impressão com o relatório formatado
function printTurnReport(text: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');
  win.document.write(
    `<html><head><title>Relatorio de Turno - SBAR Health</title>` +
    `<style>body{font-family:monospace;font-size:12px;padding:24px;white-space:pre-wrap;}` +
    `@media print{body{font-size:11px;}}</style></head>` +
    `<body>${escaped}</body></html>`
  );
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 400);
}

// Função para obter saudação baseada no horário
function getGreeting(): { text: string; icon: React.ReactNode; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { text: 'Bom dia', icon: <Sunrise className="w-5 h-5 text-amber-500" />, emoji: '☀️' };
  } else if (hour >= 12 && hour < 18) {
    return { text: 'Boa tarde', icon: <Sun className="w-5 h-5 text-orange-500" />, emoji: '🌤️' };
  } else {
    return { text: 'Boa noite', icon: <Moon className="w-5 h-5 text-indigo-400" />, emoji: '🌙' };
  }
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const tiger = useTigerReaction();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedHospital, setSelectedHospital] = useState<string>("all");
  const [expandedPatientId, setExpandedPatientId] = useState<number | null>(null);
  const [showMorningBrief, setShowMorningBrief] = useState(true);
  const [morningBriefCollapsed, setMorningBriefCollapsed] = useState(false);
  const [showTigerInsight, setShowTigerInsight] = useState(true);
  const [showTeamChat, setShowTeamChat] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  
  // Estados para confirmações de ação (zero fricção com segurança)
  const [confirmDischarge, setConfirmDischarge] = useState<{open: boolean; patient: any; admission: any}>({open: false, patient: null, admission: null});
  const [confirmArchive, setConfirmArchive] = useState<{open: boolean; patient: any; admission: any}>({open: false, patient: null, admission: null});
  const [editingEvolution, setEditingEvolution] = useState<number | null>(null);
  const [editingPatient, setEditingPatient] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{name: string; bed: string; priority: string; mainDiagnosis: string; hospitalId: number | null}>({name: '', bed: '', priority: '', mainDiagnosis: '', hospitalId: null});

  // Exportar turno
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportText, setExportText] = useState("");

  // Hooks de funcionalidades
  const offlineSync = useOfflineSync();
  const geolocation = useGeolocation();

  const { data: teams = [] } = trpc.teams.list.useQuery();
  const { data: hospitals = [] } = trpc.hospitals.list.useQuery();
  
  const allHospitalIds = useMemo(() => hospitals.map(h => h.id), [hospitals]);
  const selectedHospitalId = selectedHospital !== "all" ? parseInt(selectedHospital) : 0;
  
  // Quando "Todos hospitais" está selecionado, busca de todos; senão, busca de um específico
  const { data: allHospitalAdmissions = [], isLoading: isLoadingAll } = trpc.admissions.byMultipleHospitals.useQuery(
    { hospitalIds: allHospitalIds },
    { enabled: selectedHospital === "all" && allHospitalIds.length > 0 }
  );
  const { data: singleHospitalAdmissions = [], isLoading: isLoadingSingle } = trpc.admissions.byHospital.useQuery(
    { hospitalId: selectedHospitalId },
    { enabled: selectedHospital !== "all" && selectedHospitalId > 0 }
  );
  
  const admissions = selectedHospital === "all" ? allHospitalAdmissions : singleHospitalAdmissions;
  const isLoading = selectedHospital === "all" ? isLoadingAll : isLoadingSingle;

  const { data: notifications = [] } = trpc.notifications.list.useQuery();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const { data: todayEvolutionData } = trpc.evolutions.todayCount.useQuery();

  // Query para buscar última evolução de cada paciente
  const admissionIds = useMemo(() => (admissions as AdmissionWithPatient[]).map(a => a.id), [admissions]);
  const { data: latestEvolutions = [] } = trpc.admissions.latestEvolutions.useQuery(
    { admissionIds },
    { enabled: admissionIds.length > 0 }
  );
  const latestEvoMap = useMemo(() => {
    const map = new Map<number, typeof latestEvolutions[0]>();
    for (const evo of latestEvolutions) {
      map.set(evo.admissionId, evo);
    }
    return map;
  }, [latestEvolutions]);

  // Mutations reais para alta e arquivar
  const utils = trpc.useUtils();
  const dischargeMutation = trpc.admissions.discharge.useMutation({
    onSuccess: () => {
      utils.admissions.byMultipleHospitals.invalidate();
      utils.admissions.byHospital.invalidate();
      utils.evolutions.todayCount.invalidate();
    }
  });
  const archiveMutation = trpc.admissions.archive.useMutation({
    onSuccess: () => {
      utils.admissions.byMultipleHospitals.invalidate();
      utils.admissions.byHospital.invalidate();
      utils.evolutions.todayCount.invalidate();
    }
  });
  const updatePatientMutation = trpc.patients.update.useMutation({
    onSuccess: () => {
      utils.admissions.byMultipleHospitals.invalidate();
      utils.admissions.byHospital.invalidate();
    }
  });
  const updateAdmissionMutation = trpc.admissions.update.useMutation({
    onSuccess: () => {
      utils.admissions.byMultipleHospitals.invalidate();
      utils.admissions.byHospital.invalidate();
    }
  });

  const greeting = getGreeting();

  const filteredAdmissions = useMemo(() => {
    let filtered = admissions as AdmissionWithPatient[];
    
    if (selectedTeam !== "all") {
      filtered = filtered.filter(a => a.team?.id === parseInt(selectedTeam));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.patient?.name.toLowerCase().includes(query) ||
        a.bed.toLowerCase().includes(query) ||
        a.mainDiagnosis?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [admissions, selectedTeam, searchQuery]);

  const stats = useMemo(() => {
    const all = admissions as AdmissionWithPatient[];
    const criticalWithoutEvolution = all.filter(a => {
      const hours = (Date.now() - new Date(a.admissionDate).getTime()) / (1000 * 60 * 60);
      return a.priority === "critical" && hours > 6;
    }).length;
    
    return {
      total: all.length,
      critical: all.filter(a => a.priority === "critical").length,
      high: all.filter(a => a.priority === "high").length,
      criticalWithoutEvolution,
      pendingEvolution: all.filter(a => {
        // Paciente sem evolução hoje = pendente
        return !latestEvoMap.has(a.id) || (() => {
          const evo = latestEvoMap.get(a.id);
          if (!evo || !evo.createdAt) return true;
          const evoDate = new Date(evo.createdAt);
          const today = new Date();
          return evoDate.toDateString() !== today.toDateString();
        })();
      }).length,
      pendingDischarges: all.filter(a => a.priority === "low").length, // Aproximação
      evolutionsToday: todayEvolutionData?.count ?? 0,
      evolutionsTarget: all.length
    };
  }, [admissions, todayEvolutionData, latestEvoMap]);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-green-500 text-white";
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case "critical": return "Crítico";
      case "high": return "Alto";
      case "medium": return "Médio";
      case "low": return "Baixo";
    }
  };

  const handleEvolveCritical = () => {
    const critical = filteredAdmissions.find(a => a.priority === "critical");
    if (critical) {
      tiger.showReaction('thinking', 'Preparando evolução...', critical.patient?.name || 'Paciente crítico');
      setLocation(`/evolution/${critical.id}`);
    } else {
      toast.info("Nenhum paciente crítico no momento");
    }
  };

  const evolutionProgress = stats.evolutionsTarget > 0 ? (stats.evolutionsToday / stats.evolutionsTarget) * 100 : 0;

  // Encontrar primeiro paciente crítico para insight
  const criticalPatient = filteredAdmissions.find(a => a.priority === "critical");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                {selectedHospital === "all" ? "SBAR Health" : (hospitals.find(h => h.id === selectedHospitalId)?.name || "SBAR Health")}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {user?.name || "Médico"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CommandPalette 
              patients={admissions.filter(a => a.patient).map(a => ({
                id: a.patient!.id,
                name: a.patient!.name,
                bed: a.bed || undefined,
                hospital: hospitals.find(h => h.id === a.hospitalId)?.name,
                status: a.priority === 'critical' ? 'critical' : 'normal'
              }))}
              onNewPatient={() => setLocation('/patient/new')}
              onNewEvolution={() => toast.info('Selecione um paciente primeiro')}
            />
            <Button variant="ghost" size="icon" className="relative" onClick={() => toast.info("Notificações em breve")}>
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            <UserMenu 
              userName={user?.name || "Médico"}
              userEmail={user?.email || ""}
              onNavigate={(view) => {
                if (view === 'settings') setLocation('/settings');
                else if (view === 'hospitals') setLocation('/settings');
              }}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Morning Brief */}
        {showMorningBrief && (
          <div className="mb-6 transition-all duration-500 ease-out">
            {/* Header com saudação */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {greeting.icon}
                  <h2 className="text-xl font-semibold text-foreground">
                    {greeting.text}, {user?.name?.split(' ')[0] || 'Doutor'}! {greeting.emoji}
                  </h2>
                </div>
                {stats.critical > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {stats.critical} críticos
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setMorningBriefCollapsed(!morningBriefCollapsed)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {morningBriefCollapsed ? 'Expandir' : 'Minimizar'}
                </Button>
              </div>
            </div>

            {!morningBriefCollapsed && (
              <>
                {/* Cards de Ação Prioritária */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Card Críticos */}
                  <Card 
                    className={`border-l-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
                      stats.criticalWithoutEvolution > 0 
                        ? "border-l-red-500 bg-red-50/50 dark:bg-red-950/30" 
                        : "border-l-green-500 bg-green-50/50 dark:bg-green-950/30"
                    }`}
                    onClick={handleEvolveCritical}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className={`w-4 h-4 ${
                              stats.criticalWithoutEvolution > 0 ? "text-red-500" : "text-green-500"
                            }`} />
                            <span className="text-sm font-medium text-muted-foreground">
                              Críticos sem evolução
                            </span>
                          </div>
                          <p className={`text-2xl font-bold ${
                            stats.criticalWithoutEvolution > 0 ? "text-red-600" : "text-green-600"
                          }`}>
                            {stats.criticalWithoutEvolution}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {stats.criticalWithoutEvolution > 0 
                              ? "há mais de 6h sem atualização"
                              : "todos atualizados ✓"
                            }
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card Altas Pendentes */}
                  <Card 
                    className="border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/30 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                    onClick={() => {
                      const lowPriority = filteredAdmissions.filter(a => a.priority === 'low');
                      if (lowPriority.length > 0) {
                        setExpandedPatientId(lowPriority[0].id);
                        toast.info(`${lowPriority.length} paciente(s) com prioridade baixa (possíveis altas)`);
                        // Scroll to the patient card
                        setTimeout(() => {
                          const el = document.getElementById(`patient-${lowPriority[0].id}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      } else {
                        toast.info('Nenhuma alta pendente no momento');
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Altas pendentes
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-amber-600">
                            {stats.pendingDischarges}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            pacientes prontos para alta
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card Evoluções do Dia */}
                  <Card 
                    className="border-l-4 border-l-primary bg-primary/5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                    onClick={() => {
                      // Find first patient without evolution today
                      const withoutEvo = filteredAdmissions.filter(a => !latestEvoMap.has(a.id));
                      if (withoutEvo.length > 0) {
                        setLocation(`/evolution/${withoutEvo[0].id}`);
                      } else if (filteredAdmissions.length > 0) {
                        toast.success(`Todas as ${stats.evolutionsTarget} evoluções do dia foram realizadas!`);
                      } else {
                        toast.info('Cadastre pacientes para começar a evoluir.');
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Evoluções hoje
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <p className="text-2xl font-bold text-primary">
                              {stats.evolutionsToday}
                            </p>
                            <span className="text-sm text-muted-foreground">
                              / {stats.evolutionsTarget}
                            </span>
                          </div>
                          <Progress value={evolutionProgress} className="h-1.5 mt-2" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Alerta Clínico */}
                {showTigerInsight && criticalPatient && (
                  <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 mb-4 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-semibold text-amber-700">
                              Alerta Clínico
                            </span>
                          </div>
                          <p className="text-sm text-amber-900">
                            <span className="font-semibold">{criticalPatient.patient?.name}</span>{' '}
                            está em estado crítico. Considere revisar o plano terapêutico.
                          </p>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <Button 
                              size="sm" 
                              className="bg-amber-500 hover:bg-amber-600 text-white"
                              onClick={() => setLocation(`/evolution/${criticalPatient.id}`)}
                            >
                              Ver paciente
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                              onClick={() => setShowTigerInsight(false)}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Lembrar depois
                            </Button>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-amber-400 hover:text-amber-600 hover:bg-amber-100"
                          onClick={() => setShowTigerInsight(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white hover:bg-primary hover:text-white transition-colors"
                    onClick={handleEvolveCritical}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Evoluir próximo crítico
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white hover:bg-primary hover:text-white transition-colors"
                    onClick={() => {
                      const pending = filteredAdmissions.filter(a => {
                        // Paciente sem evolução hoje = pendente
                        if (!latestEvoMap.has(a.id)) return true;
                        const evo = latestEvoMap.get(a.id);
                        if (!evo || !evo.createdAt) return true;
                        const evoDate = new Date(evo.createdAt);
                        const today = new Date();
                        return evoDate.toDateString() !== today.toDateString();
                      });
                      if (pending.length > 0) {
                        setExpandedPatientId(pending[0].id);
                        toast.info(`${pending.length} paciente(s) sem evolução hoje`);
                      } else {
                        toast.success('Todos os pacientes foram evoluídos hoje!');
                      }
                    }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Ver pendências
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white hover:bg-primary hover:text-white transition-colors"
                    onClick={() => {
                      if (filteredAdmissions.length > 0) {
                        // Sort by priority: critical > high > medium > low
                        const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                        const sorted = [...filteredAdmissions].sort((a, b) => 
                          (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
                        );
                        const roundIds = sorted.map(a => a.id).join(',');
                        tiger.showReaction('thinking', 'Iniciando ronda...', `${sorted.length} pacientes`);
                        setLocation(`/evolution/${sorted[0].id}?round=${roundIds}`);
                      } else {
                        toast.info('Cadastre pacientes para iniciar a ronda.');
                      }
                    }}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Iniciar ronda
                  </Button>
                  {isFeatureEnabled('analytics') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white hover:bg-primary hover:text-white transition-colors"
                      onClick={() => setLocation("/analytics")}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Ver analytics
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* Versão colapsada */}
            {morningBriefCollapsed && (
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant={stats.criticalWithoutEvolution > 0 ? "destructive" : "secondary"}>
                    {stats.criticalWithoutEvolution} críticos
                  </Badge>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {stats.pendingDischarges} altas
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {stats.evolutionsToday}/{stats.evolutionsTarget} evoluções
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleEvolveCritical}
                  className="ml-auto"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Ação rápida
                </Button>
              </div>
            )}
          </div>
        )}

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
          <Select value={selectedHospital} onValueChange={setSelectedHospital}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Hospital" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos hospitais</SelectItem>
              {hospitals.map(h => (
                <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas equipes</SelectItem>
              {teams.map(t => (
                <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="default"
            className="shrink-0"
            disabled={filteredAdmissions.length === 0}
            onClick={() => {
              const hospitalName = selectedHospital === "all"
                ? "Todos hospitais"
                : hospitals.find(h => h.id === parseInt(selectedHospital))?.name || "—";
              const text = generateTurnReport(
                filteredAdmissions,
                latestEvoMap,
                hospitalName,
                user?.name || "—"
              );
              setExportText(text);
              setExportDialogOpen(true);
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Patient List with Accordion */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                {(!hospitals.length || !teams.length) ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Settings className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium">Configure sua conta</p>
                    <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                      Para cadastrar pacientes, primeiro configure seu hospital e equipe. Leva menos de 1 minuto.
                    </p>
                    <Button onClick={() => setLocation("/patient/new")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Configurar e Cadastrar Paciente
                    </Button>
                  </>
                ) : (
                  <>
                    <Users className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Nenhum paciente encontrado</p>
                    <p className="text-sm text-muted-foreground mb-4">Adicione seu primeiro paciente</p>
                    <Button onClick={() => setLocation("/patient/new")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Paciente
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredAdmissions.map((admission) => (
              <Collapsible
                key={admission.id}
                open={expandedPatientId === admission.id}
                onOpenChange={(open) => setExpandedPatientId(open ? admission.id : null)}
              >
                <Card id={`patient-${admission.id}`} className="relative overflow-hidden transition-all hover:shadow-md">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    admission.priority === 'critical' ? 'bg-red-500' :
                    admission.priority === 'high' ? 'bg-orange-500' :
                    admission.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pl-6 pb-2 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base">{admission.patient?.name}</CardTitle>
                          <Badge className={getPriorityColor(admission.priority)}>
                            {admission.bed}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPriorityColor(admission.priority)}`}>
                            {getPriorityLabel(admission.priority)}
                          </span>
                          {expandedPatientId === admission.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <CardDescription>
                        {admission.mainDiagnosis ? (
                          <DiagnosisDisplay 
                            diagnosis={admission.mainDiagnosis} 
                            showTranslateButton={isFeatureEnabled('translation')}
                          />
                        ) : (
                          "Diagnóstico não informado"
                        )}
                      </CardDescription>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pl-6 pt-0 space-y-4">
                      {/* Informações do paciente */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Admissão</p>
                            <p className="text-sm font-medium">{new Date(admission.admissionDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Leito</p>
                            <p className="text-sm font-medium">{admission.bed}</p>
                          </div>
                        </div>
                        {admission.team && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Equipe</p>
                              <p className="text-sm font-medium">{admission.team.name}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Dias internado</p>
                            <p className="text-sm font-medium">
                              {Math.floor((Date.now() - new Date(admission.admissionDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Última Evolução SBAR (resumo) */}
                      {(() => {
                        const lastEvo = latestEvoMap.get(admission.id);
                        if (!lastEvo) {
                          return (
                            <div className="p-3 border rounded-lg bg-muted/30 border-dashed">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">Nenhuma evolução registrada</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Evolução" para registrar</p>
                            </div>
                          );
                        }
                        const timeAgo = (() => {
                          const diff = Date.now() - new Date(lastEvo.createdAt).getTime();
                          const mins = Math.floor(diff / 60000);
                          if (mins < 60) return `há ${mins}min`;
                          const hours = Math.floor(mins / 60);
                          if (hours < 24) return `há ${hours}h`;
                          return `há ${Math.floor(hours / 24)}d`;
                        })();
                        const truncate = (s: string | null, len: number) => {
                          if (!s) return 'Não informado';
                          return s.length > len ? s.slice(0, len) + '...' : s;
                        };
                        return (
                          <div className="p-3 border rounded-lg bg-card">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Última Evolução
                              </h4>
                              <span className="text-xs text-muted-foreground">{timeAgo}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-semibold text-blue-600">S:</span>
                                <span className="text-muted-foreground ml-1">{truncate(lastEvo.situation, 40)}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-green-600">B:</span>
                                <span className="text-muted-foreground ml-1">{truncate(lastEvo.background, 40)}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-amber-600">A:</span>
                                <span className="text-muted-foreground ml-1">{truncate(lastEvo.assessment, 40)}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-purple-600">R:</span>
                                <span className="text-muted-foreground ml-1">{truncate(lastEvo.recommendation, 40)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* Formulário de edição inline */}
                      {editingPatient === admission.id && (
                        <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Edit className="w-4 h-4 text-primary" />
                            Editar Paciente
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground">Nome</label>
                              <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm(f => ({...f, name: e.target.value}))}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Leito</label>
                              <Input
                                value={editForm.bed}
                                onChange={(e) => setEditForm(f => ({...f, bed: e.target.value}))}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Prioridade</label>
                              <Select value={editForm.priority} onValueChange={(v) => setEditForm(f => ({...f, priority: v}))}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="critical">Crítico</SelectItem>
                                  <SelectItem value="high">Alto</SelectItem>
                                  <SelectItem value="medium">Médio</SelectItem>
                                  <SelectItem value="low">Baixo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Diagnóstico</label>
                              <Input
                                value={editForm.mainDiagnosis}
                                onChange={(e) => setEditForm(f => ({...f, mainDiagnosis: e.target.value}))}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-muted-foreground">Hospital</label>
                              <Select 
                                value={editForm.hospitalId?.toString() || ''} 
                                onValueChange={(v) => setEditForm(f => ({...f, hospitalId: parseInt(v)}))}
                              >
                                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecione o hospital" /></SelectTrigger>
                                <SelectContent>
                                  {(hospitals as any[])?.map((h: any) => (
                                    <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => setEditingPatient(null)}>
                              <X className="w-4 h-4 mr-1" />Cancelar
                            </Button>
                            <Button 
                              size="sm"
                              disabled={updatePatientMutation.isPending || updateAdmissionMutation.isPending}
                              onClick={async () => {
                                try {
                                  await updatePatientMutation.mutateAsync({ id: admission.patientId, name: editForm.name });
                                  await updateAdmissionMutation.mutateAsync({
                                    id: admission.id,
                                    bed: editForm.bed,
                                    priority: editForm.priority as "critical" | "high" | "medium" | "low",
                                    mainDiagnosis: editForm.mainDiagnosis,
                                    ...(editForm.hospitalId ? { hospitalId: editForm.hospitalId } : {}),
                                  });
                                  toast.success('Paciente atualizado!');
                                  setEditingPatient(null);
                                } catch { toast.error('Erro ao atualizar'); }
                              }}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              {(updatePatientMutation.isPending || updateAdmissionMutation.isPending) ? 'Salvando...' : 'Salvar'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Ações do paciente com confirmações */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            tiger.showReaction('happy', 'Abrindo evolução...', admission.patient?.name || '');
                            setLocation(`/evolution/${admission.id}`);
                          }}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Nova Evolução
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            tiger.showReaction('thinking', 'Analisando dados...', 'IA em processamento');
                            setLocation(`/evolution/${admission.id}?tab=ai`);
                          }}
                        >
                          <Brain className="w-4 h-4 mr-1" />
                          Análise IA
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditForm({
                              name: admission.patient?.name || '',
                              bed: admission.bed,
                              priority: admission.priority,
                              mainDiagnosis: admission.mainDiagnosis || '',
                              hospitalId: admission.hospitalId || null,
                            });
                            setEditingPatient(editingPatient === admission.id ? null : admission.id);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setLocation(`/patient/${admission.patientId}`)}
                        >
                          <History className="w-4 h-4 mr-1" />
                          Histórico
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => setConfirmDischarge({open: true, patient: admission.patient, admission})}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Dar Alta
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          onClick={() => setConfirmArchive({open: true, patient: admission.patient, admission})}
                        >
                          <Archive className="w-4 h-4 mr-1" />
                          Arquivar
                        </Button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))
          )}
        </div>
      </main>

      {/* FAB Master */}
      <FABMaster 
        onNewPatient={() => setLocation("/patient/new")}
        onNewEvolution={() => {
          if (filteredAdmissions.length > 0) {
            setLocation(`/evolution/${filteredAdmissions[0].id}`);
          } else {
            toast.info("Cadastre um paciente primeiro");
          }
        }}
        onDischarge={() => toast.info("Selecione um paciente para dar alta")}
        onArchive={() => toast.info("Selecione um paciente para arquivar")}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isNewUser={!hospitals.length && !teams.length}
        hasHospital={hospitals.length > 0}
        hasTeam={teams.length > 0}
        hasPatient={admissions.length > 0}
        onCreateHospital={() => setLocation('/settings')}
        onCreateTeam={() => setLocation('/settings')}
        onCreatePatient={() => setLocation('/patient/new')}
      />

      {/* Offline Indicator */}
      <OfflineIndicator
        status={offlineSync.status}
        pendingOperations={offlineSync.pendingOperations}
        onForceSync={offlineSync.forceSync}
        onClearPending={offlineSync.clearPendingOperations}
      />

      {/* Location Indicator */}
      <LocationIndicator
        state={{
          ...geolocation,
          hasLocation: geolocation.latitude !== null,
          isSupported: 'geolocation' in navigator
        }}
        onRequestLocation={geolocation.getCurrentPosition}
      />

      {/* Team Chat Modal */}
      {isFeatureEnabled('teamChat') && showTeamChat && teams.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Chat da Equipe</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowTeamChat(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <TeamChat
              teamId={teams[0]?.id || 0}
            />
          </div>
        </div>
      )}

      {/* Reminders Modal */}
      {showReminders && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Lembretes</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowReminders(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <RemindersSystem />
            </div>
          </div>
        </div>
      )}

      {/* Dialog de Confirmação - Dar Alta */}
      <AlertDialog open={confirmDischarge.open} onOpenChange={(open) => setConfirmDischarge({...confirmDischarge, open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Confirmar Alta
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a dar alta para <strong>{confirmDischarge.patient?.name}</strong>.
              <br /><br />
              Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Registrar a alta no sistema</li>
                <li>Liberar o leito {confirmDischarge.admission?.bed}</li>
                <li>Mover o paciente para o histórico</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
              onClick={async () => {
                try {
                  await dischargeMutation.mutateAsync({
                    id: confirmDischarge.admission?.id,
                    dischargeType: "improved" as const,
                  });
                  tiger.showReaction('celebrating', 'Alta concedida!', confirmDischarge.patient?.name || '');
                  toast.success(`Alta de ${confirmDischarge.patient?.name} registrada com sucesso!`);
                } catch (err) {
                  toast.error('Erro ao registrar alta. Tente novamente.');
                }
                setConfirmDischarge({open: false, patient: null, admission: null});
              }}
            >
              <Save className="w-4 h-4" />
              Confirmar Alta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação - Arquivar */}
      <AlertDialog open={confirmArchive.open} onOpenChange={(open) => setConfirmArchive({...confirmArchive, open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-orange-600" />
              Arquivar Paciente
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a arquivar <strong>{confirmArchive.patient?.name}</strong>.
              <br /><br />
              O paciente será movido para a aba de arquivados e poderá ser restaurado a qualquer momento.
              <br /><br />
              <span className="text-amber-600 font-medium">Motivo do arquivamento:</span>
              <select className="w-full mt-2 p-2 border rounded-md text-sm">
                <option value="">Selecione um motivo (opcional)</option>
                <option value="transfer">Transferência para outro hospital</option>
                <option value="discharge">Alta a pedido</option>
                <option value="death">Óbito</option>
                <option value="other">Outro</option>
              </select>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-1"
              onClick={async () => {
                try {
                  await archiveMutation.mutateAsync({ id: confirmArchive.admission?.id });
                  tiger.showReaction('happy', 'Paciente arquivado', confirmArchive.patient?.name || '');
                  toast.success(`${confirmArchive.patient?.name} foi arquivado. Você pode restaurar a qualquer momento.`);
                } catch (err) {
                  toast.error('Erro ao arquivar paciente. Tente novamente.');
                }
                setConfirmArchive({open: false, patient: null, admission: null});
              }}
            >
              <Archive className="w-4 h-4" />
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Exportar Turno */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Relatório de Turno
            </DialogTitle>
            <DialogDescription>
              {filteredAdmissions.length} paciente{filteredAdmissions.length !== 1 ? 's' : ''} — copie o texto ou imprima em PDF
            </DialogDescription>
          </DialogHeader>
          <Textarea
            readOnly
            value={exportText}
            className="font-mono text-xs min-h-[280px] resize-none"
          />
          <DialogFooter className="flex gap-2 sm:flex-row flex-col">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                navigator.clipboard.writeText(exportText).then(() => {
                  toast.success("Texto copiado! Cole no WhatsApp ou email.");
                }).catch(() => {
                  toast.error("Não foi possível copiar. Selecione e copie manualmente.");
                });
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Texto
            </Button>
            <Button
              className="flex-1"
              onClick={() => printTurnReport(exportText)}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir / PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-40 safe-bottom">
        <div className="flex justify-around items-center h-16">
          <button 
            className="flex flex-col items-center gap-1 text-primary"
            onClick={() => setLocation("/dashboard")}
          >
            <Activity className="w-5 h-5" />
            <span className="text-xs font-medium">Início</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground"
            onClick={() => setLocation("/patient/new")}
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">Novo</span>
          </button>
          {isFeatureEnabled('analytics') && (
            <button 
              className="flex flex-col items-center gap-1 text-muted-foreground"
              onClick={() => setLocation("/analytics")}
            >
              <Brain className="w-5 h-5" />
              <span className="text-xs font-medium">Analytics</span>
            </button>
          )}
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground"
            onClick={() => setLocation("/settings")}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">Config</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function Dashboard() {
  return (
    <TigerReactionProvider>
      <DashboardContent />
    </TigerReactionProvider>
  );
}
