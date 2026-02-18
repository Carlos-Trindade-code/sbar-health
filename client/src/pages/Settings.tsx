import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  Building2, 
  CreditCard, 
  LogOut, 
  Plus, 
  Settings as SettingsIcon, 
  Shield, 
  User, 
  Users,
  Activity,
  Brain,
  Loader2,
  CheckCircle,
  UserPlus,
  Copy,
  Check,
  Mail,
  Crown,
  Eye,
  Edit3,
  Trash2,
  X,
  Database,
  Archive,
  ArchiveRestore,
  Clock,
  XCircle,
  AlertCircle,
  Smartphone
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { InstallAppTab } from "@/components/InstallAppTab";
import { HospitalSearch } from "@/components/HospitalSearch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WhatsAppBot from "@/components/WhatsAppBot";
import { ComingSoonBadge, ComingSoonWrapper } from "@/components/ComingSoonBadge";
import ComplianceBadges from "@/components/ComplianceBadges";
import PushNotificationManager from "@/components/PushNotificationManager";
import { CurrencySelector, useCurrency, type CurrencyCode } from "@/components/MultiCurrency";
import { MessageCircle, Globe, ShieldCheck, Bell } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/i18n";
import { isFeatureEnabled } from "@/hooks/useFeatureFlag";

// Tipos de papel na equipe
type TeamRole = 'admin' | 'editor' | 'reader' | 'data_user';

// Labels e descrições dos papéis
const roleConfig: Record<TeamRole, { label: string; description: string; icon: React.ReactNode; color: string }> = {
  admin: {
    label: 'Administrador',
    description: 'Gerencia equipe, aprova membros, define permissões',
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-amber-500'
  },
  editor: {
    label: 'Editor',
    description: 'Cria e edita evoluções próprias, convida colegas',
    icon: <Edit3 className="w-4 h-4" />,
    color: 'bg-blue-500'
  },
  reader: {
    label: 'Leitor',
    description: 'Visualiza evoluções e dados clínicos (somente leitura)',
    icon: <Eye className="w-4 h-4" />,
    color: 'bg-green-500'
  },
  data_user: {
    label: 'Usuário de Dados',
    description: 'Secretárias/gestores - apenas dados não-sensíveis',
    icon: <Database className="w-4 h-4" />,
    color: 'bg-purple-500'
  }
};

export default function Settings() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const [name, setName] = useState(user?.name || "");
  const [specialty, setSpecialty] = useState(user?.specialty || "");
  const [crm, setCrm] = useState(user?.crm || "");
  
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalCode, setHospitalCode] = useState("");
  const [hospitalType, setHospitalType] = useState<"public" | "private" | "mixed">("private");
  
  // Hospital edit states
  const [editingHospitalId, setEditingHospitalId] = useState<number | null>(null);
  const [editHospitalName, setEditHospitalName] = useState("");
  const [editHospitalCode, setEditHospitalCode] = useState("");
  const [confirmDeleteHospitalId, setConfirmDeleteHospitalId] = useState<number | null>(null);
  const [showNewHospitalDialog, setShowNewHospitalDialog] = useState(false);
  
  const [teamName, setTeamName] = useState("");
  const [selectedHospitalIds, setSelectedHospitalIds] = useState<number[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  
  // Team invite states
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("editor");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [confirmDeleteTeamId, setConfirmDeleteTeamId] = useState<number | null>(null);

  const { data: hospitals = [] } = trpc.hospitals.list.useQuery();
  const { data: teams = [] } = trpc.teams.list.useQuery();

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado!");
      utils.auth.me.invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const createHospital = trpc.hospitals.create.useMutation({
    onSuccess: (data) => {
      // Auto-link the created hospital to the user
      linkHospital.mutate({ hospitalId: data.id });
      toast.success("Hospital criado e vinculado!");
      utils.hospitals.list.invalidate();
      setHospitalName("");
      setHospitalCode("");
    },
    onError: (error) => toast.error(error.message)
  });

  const updateHospital = trpc.hospitals.update.useMutation({
    onSuccess: () => {
      toast.success("Hospital atualizado!");
      utils.hospitals.list.invalidate();
      setEditingHospitalId(null);
    },
    onError: (error) => toast.error(error.message)
  });

  const deleteHospital = trpc.hospitals.delete.useMutation({
    onSuccess: () => {
      toast.success("Hospital removido!");
      utils.hospitals.list.invalidate();
      setConfirmDeleteHospitalId(null);
    },
    onError: (error) => toast.error(error.message)
  });

  const linkHospital = trpc.hospitals.linkToUser.useMutation({
    onSuccess: () => {
      toast.success("Hospital vinculado com sucesso!");
      utils.hospitals.list.invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const createTeam = trpc.teams.create.useMutation({
    onSuccess: () => {
      toast.success("Equipe criada!");
      utils.teams.list.invalidate();
      setTeamName("");
      setSelectedHospitalId(null);
    },
    onError: (error) => toast.error(error.message)
  });

  const updateTeam = trpc.teams.update.useMutation({
    onSuccess: () => {
      toast.success("Equipe atualizada!");
      utils.teams.list.invalidate();
      setEditingTeamId(null);
      setEditTeamName("");
    },
    onError: (error) => toast.error(error.message)
  });

  const deleteTeam = trpc.teams.delete.useMutation({
    onSuccess: () => {
      toast.success("Equipe excluída!");
      utils.teams.list.invalidate();
      setConfirmDeleteTeamId(null);
    },
    onError: (error) => toast.error(error.message)
  });

  const addHospitalToTeam = trpc.teams.addHospital.useMutation({
    onSuccess: () => {
      toast.success("Hospital vinculado à equipe!");
      utils.teams.list.invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const removeHospitalFromTeam = trpc.teams.removeHospital.useMutation({
    onSuccess: () => {
      toast.success("Hospital desvinculado da equipe!");
      utils.teams.list.invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "pro": return "bg-primary text-white";
      case "enterprise": return "bg-purple-600 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const createInviteMutation = trpc.teams.createInvite.useMutation();

  const handleCopyLink = async (teamId: number) => {
    try {
      const result = await createInviteMutation.mutateAsync({
        teamId,
        suggestedRole: inviteRole || "editor",
      });
      const link = `${window.location.origin}/join/${result.code}`;
      await navigator.clipboard.writeText(link);
      setCopiedCode(result.code);
      toast.success("Link copiado!", {
        description: "Envie para convidar membros. Válido por 7 dias."
      });
      setTimeout(() => setCopiedCode(null), 3000);
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar convite");
    }
  };

  const handleSendEmailInvite = async () => {
    if (!selectedTeamId || !inviteEmail) return;
    
    const team = teams.find(t => t.id === selectedTeamId);
    if (!team) return;
    
    try {
      const result = await createInviteMutation.mutateAsync({
        teamId: selectedTeamId,
        email: inviteEmail,
        suggestedRole: inviteRole,
      });
      const link = `${window.location.origin}/join/${result.code}`;
      
      const subject = encodeURIComponent(`Convite para equipe ${team.name} - SBAR Health`);
      const body = encodeURIComponent(
        `Olá!\n\n` +
        `Você foi convidado para participar da equipe "${team.name}" no SBAR Health.\n\n` +
        `Função: ${roleConfig[inviteRole].label}\n` +
        `${roleConfig[inviteRole].description}\n\n` +
        `Clique no link abaixo para aceitar o convite:\n${link}\n\n` +
        `Ou use o código: ${result.code}\n\n` +
        `Atenciosamente,\n${user?.name || "Equipe SBAR"}`
      );
      
      window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`);
      
      toast.success("Convite criado!", {
        description: `${inviteEmail} receberá acesso como ${roleConfig[inviteRole].label}. Válido por 7 dias.`
      });
      
      setInviteEmail("");
      setShowInviteDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar convite");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold">Configurações</h1>
            <p className="text-xs text-muted-foreground">Gerencie sua conta</p>
          </div>
        </div>
      </header>

      <main className="container py-6 max-w-2xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-4 px-4 mb-6 scrollbar-hide">
            <TabsList className="inline-flex w-max h-auto gap-1 p-1">
              <TabsTrigger value="profile" className="text-xs px-3 py-1.5">
                <User className="w-3.5 h-3.5 mr-1.5" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="hospitals" className="text-xs px-3 py-1.5">
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                Hospitais
              </TabsTrigger>
              <TabsTrigger value="teams" className="text-xs px-3 py-1.5">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Equipes
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs px-3 py-1.5">
                <Bell className="w-3.5 h-3.5 mr-1.5" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="relative text-xs px-3 py-1.5">
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                WhatsApp
                <ComingSoonBadge variant="coming-soon" size="sm" className="ml-1" />
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs px-3 py-1.5">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="plan" className="text-xs px-3 py-1.5">
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                Plano
              </TabsTrigger>
              <TabsTrigger value="install" className="text-xs px-3 py-1.5">
                <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                App
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Perfil</CardTitle>
                </div>
                <CardDescription>Suas informações pessoais e profissionais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Especialidade</Label>
                    <Input 
                      value={specialty} 
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="Ex: Cardiologia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Registro Profissional</Label>
                    <Input 
                      value={crm} 
                      onChange={(e) => setCrm(e.target.value)}
                      placeholder="Ex: CRM 123456-SP, COREN 12345"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => updateProfile.mutate({ name, specialty, crm })}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>

            {/* Verificação Profissional */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Verificação Profissional</CardTitle>
                </div>
                <CardDescription>Status da verificação do seu registro profissional</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const status = (user as any)?.verificationStatus || 'unverified';
                  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; description: string }> = {
                    unverified: {
                      label: 'Não verificado',
                      color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                      icon: <AlertCircle className="w-4 h-4" />,
                      description: 'Complete seu perfil profissional no onboarding ou atualize seus dados acima para iniciar a verificação.'
                    },
                    pending: {
                      label: 'Verificação pendente',
                      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                      icon: <Clock className="w-4 h-4" />,
                      description: 'Seus dados profissionais foram enviados e estão sendo verificados pela equipe SBAR Health. Isso pode levar até 48 horas.'
                    },
                    verified: {
                      label: 'Verificado',
                      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      icon: <CheckCircle className="w-4 h-4" />,
                      description: 'Seu registro profissional foi verificado com sucesso. Você tem acesso completo ao sistema.'
                    },
                    rejected: {
                      label: 'Verificação recusada',
                      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                      icon: <XCircle className="w-4 h-4" />,
                      description: 'A verificação do seu registro não foi aprovada. Entre em contato com o suporte para mais informações.'
                    }
                  };
                  const config = statusConfig[status] || statusConfig.unverified;
                  return (
                    <div className={`flex items-start gap-3 p-4 rounded-lg ${config.color}`}>
                      <div className="mt-0.5">{config.icon}</div>
                      <div>
                        <p className="font-medium text-sm">{config.label}</p>
                        <p className="text-xs mt-1 opacity-80">{config.description}</p>
                      </div>
                    </div>
                  );
                })()}
                <div className="text-xs text-muted-foreground">
                  <p>A verificação profissional garante a segurança e credibilidade do sistema. Profissionais verificados recebem um selo de confiança visível para colegas e instituições.</p>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Segurança</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleLogout} className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </Button>
              </CardContent>
            </Card>

            {/* Idioma */}
            {isFeatureEnabled('i18n') && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Idioma</CardTitle>
                  </div>
                  <CardDescription>Escolha o idioma do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <LanguageSelector variant="full" />
                </CardContent>
              </Card>
            )}


          </TabsContent>

          {/* Hospitals Tab */}
          <TabsContent value="hospitals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Hospitais</CardTitle>
                </div>
                <CardDescription>Hospitais vinculados à sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hospitals.length > 0 ? (
                  <div className="space-y-2">
                    {hospitals.map(h => (
                      <div key={h.id} className="border rounded-lg p-3 space-y-2">
                        {editingHospitalId === h.id ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={editHospitalName}
                                onChange={(e) => setEditHospitalName(e.target.value)}
                                placeholder="Nome do hospital"
                                className="h-8"
                                autoFocus
                              />
                              <Input
                                value={editHospitalCode}
                                onChange={(e) => setEditHospitalCode(e.target.value)}
                                placeholder="Código"
                                className="h-8"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="default" onClick={() => updateHospital.mutate({ id: h.id, name: editHospitalName, code: editHospitalCode })} disabled={!editHospitalName || updateHospital.isPending}>
                                <Check className="w-3 h-3 mr-1" /> Salvar
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingHospitalId(null)}>
                                <X className="w-3 h-3 mr-1" /> Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{h.name}</p>
                              <p className="text-xs text-muted-foreground">{h.code}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded mr-2">
                                {h.type === 'private' ? 'Privado' : h.type === 'public' ? 'Público' : 'Misto'}
                              </span>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingHospitalId(h.id); setEditHospitalName(h.name); setEditHospitalCode(h.code || ''); }} title="Editar hospital">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              {confirmDeleteHospitalId === h.id ? (
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="destructive" onClick={() => deleteHospital.mutate({ id: h.id })}>
                                    Confirmar
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteHospitalId(null)}>
                                    Cancelar
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setConfirmDeleteHospitalId(h.id)} title="Remover hospital">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum hospital cadastrado
                  </p>
                )}
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium">Buscar e adicionar hospital</p>
                  <p className="text-xs text-muted-foreground">Busque na base com 259+ hospitais brasileiros ou cadastre um novo.</p>
                  <HospitalSearch
                    onSelect={(hospital) => {
                      // Check if already in user's list
                      if (hospitals.some((h: any) => h.id === hospital.id)) {
                        toast.info(`"${hospital.name}" já está na sua lista.`);
                        return;
                      }
                      // Link existing hospital to user
                      linkHospital.mutate({ hospitalId: hospital.id });
                    }}
                    onCreateNew={(name) => {
                      setHospitalName(name);
                      setShowNewHospitalDialog(true);
                    }}
                    excludeIds={hospitals.map((h: any) => h.id)}
                    placeholder="Digite o nome do hospital (ex: Mater Dei, Albert Einstein...)"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            {/* Role Legend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Níveis de Permissão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <div className={`w-6 h-6 rounded-full ${config.color} flex items-center justify-center text-white`}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{config.label}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{config.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Teams List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Suas Equipes</CardTitle>
                  </div>
                  <Badge variant="secondary">{teams.length} equipes</Badge>
                </div>
                <CardDescription>Gerencie suas equipes médicas e convide membros</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {teams.length > 0 ? (
                  <div className="space-y-3">
                    {teams.map(team => (
                      <div key={team.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: team.color || '#0d9488' }}
                            />
                            <div>
                              {editingTeamId === team.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={editTeamName}
                                    onChange={(e) => setEditTeamName(e.target.value)}
                                    className="h-8 w-48"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') updateTeam.mutate({ id: team.id, name: editTeamName });
                                      if (e.key === 'Escape') setEditingTeamId(null);
                                    }}
                                  />
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateTeam.mutate({ id: team.id, name: editTeamName })}>
                                    <Check className="w-4 h-4 text-green-600" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingTeamId(null)}>
                                    <X className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              ) : (
                                <p className="font-medium">{team.name}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {(team as any).hospitals?.length > 0 ? (
                                  (team as any).hospitals.map((h: { id: number; name: string }) => (
                                    <Badge key={h.id} variant="outline" className="text-[10px] py-0">
                                      <Building2 className="w-2.5 h-2.5 mr-0.5" />
                                      {h.name}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground">{team.specialty || "Sem hospital vinculado"}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                            {editingTeamId !== team.id && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingTeamId(team.id); setEditTeamName(team.name); }} title="Editar equipe">
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                {confirmDeleteTeamId === team.id ? (
                                  <div className="flex items-center gap-1">
                                    <Button size="sm" variant="destructive" onClick={() => deleteTeam.mutate({ id: team.id })}>
                                      Confirmar
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteTeamId(null)}>
                                      Cancelar
                                    </Button>
                                  </div>
                                ) : (
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setConfirmDeleteTeamId(team.id)} title="Excluir equipe">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Add hospital to team */}
                        <div className="flex flex-wrap gap-2 items-center">
                          {hospitals.length === 0 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => setActiveTab("hospitals")}
                            >
                              <Building2 className="w-3.5 h-3.5 mr-1.5" />
                              Cadastrar hospital primeiro
                            </Button>
                          ) : (
                            <>
                              {hospitals.filter(h => !(team as any).hospitals?.some((th: any) => th.id === h.id)).length > 0 ? (
                                <Select
                                  value=""
                                  onValueChange={(v) => {
                                    if (v) {
                                      addHospitalToTeam.mutate({ teamId: team.id, hospitalId: parseInt(v) });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 w-48 text-xs">
                                    <SelectValue placeholder="+ Vincular hospital" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {hospitals
                                      .filter(h => !(team as any).hospitals?.some((th: any) => th.id === h.id))
                                      .map(h => (
                                        <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-xs text-muted-foreground">Todos os hospitais já vinculados</span>
                              )}
                            </>
                          )}
                          {(team as any).hospitals?.map((h: { id: number; name: string }) => (
                            <Button
                              key={h.id}
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] text-red-500 hover:text-red-700 px-1"
                              onClick={() => removeHospitalFromTeam.mutate({ teamId: team.id, hospitalId: h.id })}
                              title={`Desvincular ${h.name}`}
                            >
                              <X className="w-3 h-3 mr-0.5" />
                              {h.name}
                            </Button>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCopyLink(team.id)}
                          >
                            {copiedCode ? (
                              <Check className="w-4 h-4 mr-2 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 mr-2" />
                            )}
                            Copiar Link
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedTeamId(team.id);
                              setShowInviteDialog(true);
                            }}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar Email
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma equipe cadastrada
                  </p>
                )}
                
                <Separator />
                
                <div className="space-y-3">
                  <p className="text-sm font-medium">Criar nova equipe</p>
                  <div className="space-y-2">
                    <Input 
                      placeholder="Nome da equipe"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                    <div className="space-y-2">
                      <Label className="text-xs">Vincular a hospitais</Label>
                      {hospitals.length === 0 ? (
                        <div className="border border-dashed rounded-lg p-4 text-center space-y-2">
                          <Building2 className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Você ainda não cadastrou nenhum hospital.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveTab("hospitals")}
                          >
                            <Building2 className="w-4 h-4 mr-2" />
                            Cadastrar Hospital Primeiro
                          </Button>
                          <p className="text-[10px] text-muted-foreground">
                            Cadastre pelo menos um hospital para vincular à equipe.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {selectedHospitalIds.map(hId => {
                              const h = hospitals.find(x => x.id === hId);
                              return h ? (
                                <Badge key={hId} variant="secondary" className="text-xs gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {h.name}
                                  <button onClick={() => setSelectedHospitalIds(prev => prev.filter(id => id !== hId))} className="ml-1 hover:text-red-500">
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ) : null;
                            })}
                          </div>
                          <Select
                            value=""
                            onValueChange={(v) => {
                              if (v) {
                                const id = parseInt(v);
                                if (!selectedHospitalIds.includes(id)) {
                                  setSelectedHospitalIds(prev => [...prev, id]);
                                }
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um hospital para vincular" />
                            </SelectTrigger>
                            <SelectContent>
                              {hospitals
                                .filter(h => !selectedHospitalIds.includes(h.id))
                                .map(h => (
                                  <SelectItem key={h.id} value={h.id.toString()}>
                                    {h.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Uma equipe pode atender em vários hospitais simultaneamente. Selecione os hospitais desejados acima.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      createTeam.mutate({ 
                        name: teamName, 
                        hospitalIds: selectedHospitalIds.length > 0 ? selectedHospitalIds : undefined,
                        hospitalId: selectedHospitalIds[0] || undefined
                      }, {
                        onSuccess: () => setSelectedHospitalIds([])
                      });
                    }}
                    disabled={!teamName || createTeam.isPending}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Equipe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <PushNotificationManager />
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp" className="space-y-6">
            <WhatsAppBot isOnline={true} />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <ComplianceBadges variant="full" />
          </TabsContent>

          {/* Plan Tab */}
          <TabsContent value="plan" className="space-y-6">
            <PlanTab user={user} getPlanBadge={getPlanBadge} />
          </TabsContent>

          {/* Install App Tab */}
          <TabsContent value="install" className="space-y-6">
            <InstallAppTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Email Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Convidar por Email
            </DialogTitle>
            <DialogDescription>
              Envie um convite por email com o papel desejado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email do convidado</Label>
              <Input 
                type="email"
                placeholder="colega@hospital.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Papel na equipe</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${config.color} flex items-center justify-center text-white`}>
                          {config.icon}
                        </div>
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {roleConfig[inviteRole].description}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendEmailInvite} disabled={!inviteEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Hospital Dialog */}
      <Dialog open={showNewHospitalDialog} onOpenChange={setShowNewHospitalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Cadastrar Novo Hospital
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do hospital que não foi encontrado na busca.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome do Hospital *</Label>
              <Input
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="Ex: Hospital São Lucas"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cidade</Label>
                <Input
                  value={hospitalCode}
                  onChange={(e) => setHospitalCode(e.target.value)}
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={hospitalType} onValueChange={(v) => setHospitalType(v as "public" | "private" | "mixed")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Privado</SelectItem>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="mixed">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewHospitalDialog(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                createHospital.mutate({ name: hospitalName, type: hospitalType });
                setShowNewHospitalDialog(false);
              }}
              disabled={!hospitalName || createHospital.isPending}
            >
              {createHospital.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-40 safe-bottom">
        <div className="flex justify-around items-center h-16">
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground"
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
          <button 
            className="flex flex-col items-center gap-1 text-primary"
            onClick={() => setLocation("/settings")}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Config</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function PlanTab({ user, getPlanBadge }: { user: any; getPlanBadge: (plan: string) => string }) {
  const { data: planStats } = trpc.profile.planStats.useQuery();
  
  const formatLimit = (used: number, max: number) => {
    if (max === -1) return "Ilimitado";
    return `${used}/${max}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Plano</CardTitle>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadge(planStats?.plan || user?.plan || "free")}`}>
            {planStats?.isTrialActive ? "TRIAL" : (planStats?.plan || user?.plan || "free").toUpperCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {planStats?.isTrialActive && planStats.trialDaysLeft !== null && (
          <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm font-medium text-primary">
              🎉 Você está no período de teste gratuito!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {planStats.trialDaysLeft > 0 
                ? `Restam ${planStats.trialDaysLeft} dia(s) de uso ilimitado.`
                : "Seu período de teste expirou. Faça upgrade para continuar."}
            </p>
          </div>
        )}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pacientes ativos</span>
            <span className="font-medium">
              {planStats ? formatLimit(planStats.activePatients, planStats.maxPatients) : "..."}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Análises IA</span>
            <span className="font-medium">
              {planStats ? formatLimit(planStats.aiUsed, planStats.maxAi) : "..."}
            </span>
          </div>
          <Separator />
          <Button variant="outline" className="w-full" onClick={() => toast.info("Upgrade em breve!")}>
            Fazer Upgrade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
