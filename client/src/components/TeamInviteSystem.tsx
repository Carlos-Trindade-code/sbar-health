import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  Check, 
  Link, 
  Mail, 
  Users, 
  Plus, 
  Shield, 
  UserPlus,
  Archive,
  ArchiveRestore,
  Settings,
  Crown,
  User,
  Eye,
  Edit3,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// Tipos de papel na equipe
type TeamRole = 'admin' | 'editor' | 'reader' | 'data_user';

// Status do convite
type InviteStatus = 'pending' | 'approved' | 'rejected';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: TeamRole;
  joinedAt: string;
  invitedBy: string;
  isCreator: boolean; // O criador original da equipe
}

interface PendingInvite {
  id: number;
  email: string;
  name?: string;
  requestedRole: TeamRole;
  status: InviteStatus;
  invitedBy: string;
  invitedAt: string;
  code: string;
}

interface Team {
  id: number;
  name: string;
  type: 'clinical' | 'surgical' | 'teaching' | 'office' | 'shift';
  hospital?: string;
  members: TeamMember[];
  pendingInvites: PendingInvite[];
  inviteCode: string;
  isArchived: boolean;
  createdAt: string;
  createdBy: string;
}

interface TeamInviteSystemProps {
  isDemo?: boolean;
  currentUserId?: number;
  currentUserName?: string;
}

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

export default function TeamInviteSystem({ 
  isDemo = false, 
  currentUserId = 1,
  currentUserName = "Dr. Carlos Mendes"
}: TeamInviteSystemProps) {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: 1,
      name: "Equipe Clínica HC",
      type: 'clinical',
      hospital: "HC-FMUSP",
      members: [
        { id: 1, name: "Dr. Carlos Mendes", email: "carlos@hc.fm.usp.br", role: 'admin', joinedAt: "2024-01-15", invitedBy: "-", isCreator: true },
        { id: 2, name: "Dra. Ana Silva", email: "ana@hc.fm.usp.br", role: 'admin', joinedAt: "2024-02-01", invitedBy: "Dr. Carlos Mendes", isCreator: false },
        { id: 3, name: "Dr. Pedro Santos", email: "pedro@hc.fm.usp.br", role: 'editor', joinedAt: "2024-03-10", invitedBy: "Dra. Ana Silva", isCreator: false },
        { id: 4, name: "Enf. Maria Costa", email: "maria@hc.fm.usp.br", role: 'reader', joinedAt: "2024-04-05", invitedBy: "Dr. Carlos Mendes", isCreator: false },
        { id: 5, name: "Sec. Julia Lima", email: "julia@hc.fm.usp.br", role: 'data_user', joinedAt: "2024-05-20", invitedBy: "Dra. Ana Silva", isCreator: false },
      ],
      pendingInvites: [
        { id: 101, email: "novo.medico@hospital.com", name: "Dr. João Ferreira", requestedRole: 'editor', status: 'pending', invitedBy: "Dr. Pedro Santos", invitedAt: "2024-06-01", code: "INV-001" },
        { id: 102, email: "residente@hospital.com", requestedRole: 'reader', status: 'pending', invitedBy: "Dra. Ana Silva", invitedAt: "2024-06-02", code: "INV-002" },
      ],
      inviteCode: "SBAR-HC-2024-XKCD",
      isArchived: false,
      createdAt: "2024-01-15",
      createdBy: "Dr. Carlos Mendes"
    }
  ]);

  const [archivedTeams, setArchivedTeams] = useState<Team[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showMemberSettings, setShowMemberSettings] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("editor");
  const [activeTab, setActiveTab] = useState<'teams' | 'archived'>('teams');
  const [teamViewTab, setTeamViewTab] = useState<'members' | 'pending'>('members');

  const [newTeam, setNewTeam] = useState({
    name: "",
    type: "clinical" as Team['type'],
    hospital: ""
  });

  // Verificar se o usuário atual é admin da equipe
  const isAdmin = (team: Team) => {
    const member = team.members.find(m => m.id === currentUserId);
    return member?.role === 'admin';
  };

  // Verificar se o usuário atual é o criador da equipe
  const isCreator = (team: Team) => {
    const member = team.members.find(m => m.id === currentUserId);
    return member?.isCreator === true;
  };

  // Verificar se pode convidar (admin ou editor)
  const canInvite = (team: Team) => {
    const member = team.members.find(m => m.id === currentUserId);
    return member?.role === 'admin' || member?.role === 'editor';
  };

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SBAR-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const generateInviteLink = (team: Team) => {
    return `${window.location.origin}/join/${team.inviteCode}`;
  };

  const handleCopyLink = (team: Team) => {
    const link = generateInviteLink(team);
    navigator.clipboard.writeText(link);
    setCopiedCode(team.inviteCode);
    toast.success("Link copiado!", {
      description: "Envie para convidar membros. Convites precisam de aprovação de um admin."
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Código copiado!");
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleSendEmailInvite = () => {
    if (!selectedTeam || !inviteEmail) return;
    
    const link = generateInviteLink(selectedTeam);
    const isAdminSender = isAdmin(selectedTeam);
    
    const subject = encodeURIComponent(`Convite para equipe ${selectedTeam.name} - SBAR Health`);
    const body = encodeURIComponent(
      `Olá!\n\n` +
      `Você foi convidado para participar da equipe "${selectedTeam.name}" no SBAR Health.\n\n` +
      `Função sugerida: ${roleConfig[inviteRole].label}\n` +
      `${roleConfig[inviteRole].description}\n\n` +
      `Clique no link abaixo para aceitar o convite:\n${link}\n\n` +
      `Ou use o código: ${selectedTeam.inviteCode}\n\n` +
      (isAdminSender ? 
        `Seu acesso será ativado imediatamente após aceitar.\n\n` : 
        `Nota: Seu acesso precisará ser aprovado por um administrador da equipe.\n\n`) +
      `Atenciosamente,\n${currentUserName}`
    );
    
    window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`);
    
    // Se não for admin, adicionar à lista de pendentes
    if (!isAdminSender) {
      const newPendingInvite: PendingInvite = {
        id: Date.now(),
        email: inviteEmail,
        requestedRole: inviteRole,
        status: 'pending',
        invitedBy: currentUserName,
        invitedAt: new Date().toISOString().split('T')[0],
        code: `INV-${Date.now()}`
      };
      
      setTeams(prev => prev.map(t => 
        t.id === selectedTeam.id 
          ? { ...t, pendingInvites: [...t.pendingInvites, newPendingInvite] }
          : t
      ));
      
      toast.success("Convite enviado!", {
        description: `Aguardando aprovação de um administrador`
      });
    } else {
      toast.success("Convite enviado!", {
        description: `${inviteEmail} receberá acesso como ${roleConfig[inviteRole].label}`
      });
    }
    
    setInviteEmail("");
    setShowInviteDialog(false);
  };

  const handleApproveInvite = (team: Team, invite: PendingInvite) => {
    // Adicionar como membro
    const newMember: TeamMember = {
      id: Date.now(),
      name: invite.name || invite.email.split('@')[0],
      email: invite.email,
      role: invite.requestedRole,
      joinedAt: new Date().toISOString().split('T')[0],
      invitedBy: invite.invitedBy,
      isCreator: false
    };
    
    setTeams(prev => prev.map(t => 
      t.id === team.id 
        ? { 
            ...t, 
            members: [...t.members, newMember],
            pendingInvites: t.pendingInvites.filter(i => i.id !== invite.id)
          }
        : t
    ));
    
    toast.success("Membro aprovado!", {
      description: `${invite.email} agora é ${roleConfig[invite.requestedRole].label}`
    });
  };

  const handleRejectInvite = (team: Team, invite: PendingInvite) => {
    setTeams(prev => prev.map(t => 
      t.id === team.id 
        ? { ...t, pendingInvites: t.pendingInvites.filter(i => i.id !== invite.id) }
        : t
    ));
    
    toast.info("Convite rejeitado", {
      description: `O convite para ${invite.email} foi removido`
    });
  };

  const handleChangeMemberRole = (team: Team, member: TeamMember, newRole: TeamRole) => {
    // Não permitir rebaixar o criador
    if (member.isCreator && newRole !== 'admin') {
      toast.error("Não é possível alterar o papel do criador da equipe");
      return;
    }
    
    setTeams(prev => prev.map(t => 
      t.id === team.id 
        ? { 
            ...t, 
            members: t.members.map(m => 
              m.id === member.id ? { ...m, role: newRole } : m
            )
          }
        : t
    ));
    
    toast.success("Papel alterado!", {
      description: `${member.name} agora é ${roleConfig[newRole].label}`
    });
    
    setShowMemberSettings(false);
  };

  const handleRemoveMember = (team: Team, member: TeamMember) => {
    if (member.isCreator) {
      toast.error("Não é possível remover o criador da equipe");
      return;
    }
    
    setTeams(prev => prev.map(t => 
      t.id === team.id 
        ? { ...t, members: t.members.filter(m => m.id !== member.id) }
        : t
    ));
    
    toast.success("Membro removido", {
      description: `${member.name} foi removido da equipe`
    });
    
    setShowMemberSettings(false);
  };

  const handleCreateTeam = () => {
    if (!newTeam.name) {
      toast.error("Nome da equipe é obrigatório");
      return;
    }

    const team: Team = {
      id: Date.now(),
      name: newTeam.name,
      type: newTeam.type,
      hospital: newTeam.hospital || undefined,
      members: [
        { 
          id: currentUserId, 
          name: currentUserName, 
          email: "carlos@email.com", 
          role: 'admin', 
          joinedAt: new Date().toISOString().split('T')[0], 
          invitedBy: "-",
          isCreator: true
        }
      ],
      pendingInvites: [],
      inviteCode: generateInviteCode(),
      isArchived: false,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUserName
    };

    setTeams(prev => [...prev, team]);
    setNewTeam({ name: "", type: "clinical", hospital: "" });
    setShowCreateTeam(false);
    
    toast.success("Equipe criada!", {
      description: `Você é o administrador de ${team.name}`
    });
  };

  const handleArchiveTeam = () => {
    if (!selectedTeam) return;

    const admins = selectedTeam.members.filter(m => m.role === 'admin');
    
    setTeams(prev => prev.filter(t => t.id !== selectedTeam.id));
    setArchivedTeams(prev => [...prev, { ...selectedTeam, isArchived: true }]);
    
    toast.success("Equipe arquivada!", {
      description: `${admins.length} administrador(es) foram notificados`
    });
    
    setShowArchiveConfirm(false);
    setSelectedTeam(null);
  };

  const handleRestoreTeam = (team: Team) => {
    setArchivedTeams(prev => prev.filter(t => t.id !== team.id));
    setTeams(prev => [...prev, { ...team, isArchived: false }]);
    
    toast.success("Equipe restaurada!", {
      description: `${team.name} está ativa novamente`
    });
  };

  const getPendingCount = (team: Team) => {
    return team.pendingInvites.filter(i => i.status === 'pending').length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Minhas Equipes
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie equipes, permissões e convites
          </p>
        </div>
        <Button onClick={() => setShowCreateTeam(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Equipe
        </Button>
      </div>

      {/* Tabs: Ativas / Arquivadas */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'teams' | 'archived')}>
        <TabsList>
          <TabsTrigger value="teams">
            Equipes Ativas ({teams.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="w-4 h-4 mr-2" />
            Arquivadas ({archivedTeams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="mt-4">
          <div className="grid gap-4">
            {teams.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Nenhuma equipe ainda</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crie sua primeira equipe para começar a colaborar
                  </p>
                  <Button onClick={() => setShowCreateTeam(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Equipe
                  </Button>
                </CardContent>
              </Card>
            ) : (
              teams.map(team => (
                <Card key={team.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {team.name}
                          {isCreator(team) && (
                            <Crown className="w-4 h-4 text-amber-500" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          {team.hospital && `${team.hospital} • `}
                          {team.members.length} membro(s)
                          {getPendingCount(team) > 0 && (
                            <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700">
                              {getPendingCount(team)} pendente(s)
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {team.type === 'clinical' && 'Clínica'}
                        {team.type === 'surgical' && 'Cirúrgica'}
                        {team.type === 'teaching' && 'Ensino'}
                        {team.type === 'office' && 'Consultório'}
                        {team.type === 'shift' && 'Plantão'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Invite Section */}
                    {canInvite(team) && (
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium">Link de Convite</span>
                            {!isAdmin(team) && (
                              <p className="text-xs text-muted-foreground">
                                Convites precisam de aprovação de um admin
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {team.inviteCode}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleCopyLink(team)}
                          >
                            {copiedCode === team.inviteCode ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Link className="w-4 h-4 mr-2" />
                                Copiar Link
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowInviteDialog(true);
                            }}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar Email
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Tabs: Membros / Pendentes */}
                    <Tabs value={teamViewTab} onValueChange={(v) => setTeamViewTab(v as 'members' | 'pending')}>
                      <TabsList className="w-full">
                        <TabsTrigger value="members" className="flex-1">
                          <Users className="w-4 h-4 mr-2" />
                          Membros ({team.members.length})
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="flex-1">
                          <Clock className="w-4 h-4 mr-2" />
                          Pendentes ({getPendingCount(team)})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="members" className="mt-3">
                        <div className="space-y-2">
                          {team.members.map(member => (
                            <div 
                              key={member.id} 
                              className="flex items-center justify-between py-2 px-3 bg-background rounded border hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full ${roleConfig[member.role].color} flex items-center justify-center text-white`}>
                                  {roleConfig[member.role].icon}
                                </div>
                                <div>
                                  <p className="text-sm font-medium flex items-center gap-2">
                                    {member.name}
                                    {member.isCreator && (
                                      <Crown className="w-3 h-3 text-amber-500" />
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  {roleConfig[member.role].label}
                                </Badge>
                                {isAdmin(team) && member.id !== currentUserId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setSelectedTeam(team);
                                      setSelectedMember(member);
                                      setShowMemberSettings(true);
                                    }}
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="pending" className="mt-3">
                        {team.pendingInvites.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum convite pendente</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {team.pendingInvites.map(invite => (
                              <div 
                                key={invite.id} 
                                className="flex items-center justify-between py-3 px-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{invite.name || invite.email}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Convidado por {invite.invitedBy} • {roleConfig[invite.requestedRole].label}
                                    </p>
                                  </div>
                                </div>
                                {isAdmin(team) ? (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 border-green-600 hover:bg-green-50"
                                      onClick={() => handleApproveInvite(team, invite)}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Aprovar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                      onClick={() => handleRejectInvite(team, invite)}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Rejeitar
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge variant="secondary">
                                    Aguardando admin
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    {/* Role Legend */}
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs font-medium mb-2">Níveis de Acesso:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(roleConfig).map(([key, config]) => (
                          <div key={key} className="flex items-center gap-2 text-xs">
                            <div className={`w-5 h-5 rounded ${config.color} flex items-center justify-center text-white`}>
                              {config.icon}
                            </div>
                            <span className="text-muted-foreground">{config.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {isAdmin(team) && (
                      <>
                        <Separator />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Configurações
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowArchiveConfirm(true);
                            }}
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Arquivar
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          {archivedTeams.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Archive className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Nenhuma equipe arquivada
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {archivedTeams.map(team => (
                <Card key={team.id} className="opacity-75">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{team.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Arquivada • {team.members.length} membros
                        </p>
                      </div>
                      {isAdmin(team) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRestoreTeam(team)}
                        >
                          <ArchiveRestore className="w-4 h-4 mr-2" />
                          Restaurar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Equipe</DialogTitle>
            <DialogDescription>
              Você será o administrador principal desta equipe
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Equipe *</Label>
              <Input 
                placeholder="Ex: Equipe Clínica UTI"
                value={newTeam.name}
                onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Equipe</Label>
              <Select 
                value={newTeam.type} 
                onValueChange={(v) => setNewTeam(prev => ({ ...prev, type: v as Team['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinical">Clínica</SelectItem>
                  <SelectItem value="surgical">Cirúrgica</SelectItem>
                  <SelectItem value="teaching">Ensino</SelectItem>
                  <SelectItem value="office">Consultório</SelectItem>
                  <SelectItem value="shift">Plantão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Hospital (opcional)</Label>
              <Input 
                placeholder="Ex: HC-FMUSP"
                value={newTeam.hospital}
                onChange={(e) => setNewTeam(prev => ({ ...prev, hospital: e.target.value }))}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">Como administrador você poderá:</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Aprovar novos membros</li>
                <li>• Definir permissões (Admin, Editor, Leitor, Usuário de Dados)</li>
                <li>• Promover outros membros a administrador</li>
                <li>• Arquivar a equipe</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTeam}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Equipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite by Email Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar para {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              {selectedTeam && isAdmin(selectedTeam) 
                ? "O membro terá acesso imediato após aceitar o convite"
                : "O convite precisará ser aprovado por um administrador"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email do Convidado</Label>
              <Input 
                type="email"
                placeholder="email@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Nível de Acesso</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded ${config.color} flex items-center justify-center text-white`}>
                          {config.icon}
                        </div>
                        <div>
                          <span className="font-medium">{config.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {config.description}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Ou compartilhe o código: <span className="font-mono font-medium">{selectedTeam?.inviteCode}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 h-6"
                  onClick={() => handleCopyCode(selectedTeam?.inviteCode || '')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </p>
            </div>

            {selectedTeam && !isAdmin(selectedTeam) && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Este convite precisará ser aprovado por um administrador
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
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

      {/* Member Settings Dialog */}
      <Dialog open={showMemberSettings} onOpenChange={setShowMemberSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Membro</DialogTitle>
            <DialogDescription>
              {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMember && selectedTeam && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Alterar Nível de Acesso</Label>
                <Select 
                  value={selectedMember.role} 
                  onValueChange={(v) => handleChangeMemberRole(selectedTeam, selectedMember, v as TeamRole)}
                  disabled={selectedMember.isCreator}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {config.icon}
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedMember.isCreator && (
                  <p className="text-xs text-muted-foreground">
                    O criador da equipe não pode ter seu papel alterado
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-destructive">Zona de Perigo</Label>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={selectedMember.isCreator}
                  onClick={() => handleRemoveMember(selectedTeam, selectedMember)}
                >
                  Remover da Equipe
                </Button>
                {selectedMember.isCreator && (
                  <p className="text-xs text-muted-foreground">
                    O criador da equipe não pode ser removido
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMemberSettings(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation */}
      <AlertDialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar Equipe?</AlertDialogTitle>
            <AlertDialogDescription>
              A equipe "{selectedTeam?.name}" será arquivada e todos os administradores serão notificados.
              <br /><br />
              Você poderá restaurá-la depois na aba "Arquivadas".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveTeam}>
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
