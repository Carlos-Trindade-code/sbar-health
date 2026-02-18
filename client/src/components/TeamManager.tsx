import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Users,
  Plus,
  Trash2,
  UserPlus,
  GraduationCap,
  Briefcase,
  Stethoscope,
  Building2,
  Clock,
  Shield,
  Crown,
  Mail,
  Copy,
  Edit,
  Loader2,
  Check,
  X
} from "lucide-react";

// Tipos de equipe
const teamTypes = [
  { id: 'clinical', name: 'Equipe Clínica', description: 'Equipe de atendimento hospitalar', icon: Stethoscope, color: 'bg-blue-500' },
  { id: 'surgical', name: 'Equipe Cirúrgica', description: 'Equipe de cirurgia e procedimentos', icon: Users, color: 'bg-purple-500' },
  { id: 'teaching', name: 'Equipe de Ensino', description: 'Residência, internato ou estágio', icon: GraduationCap, color: 'bg-green-500' },
  { id: 'office', name: 'Consultório', description: 'Atendimento ambulatorial privado', icon: Briefcase, color: 'bg-amber-500' },
  { id: 'oncall', name: 'Plantão', description: 'Equipe de plantão rotativo', icon: Clock, color: 'bg-red-500' },
];

// Papéis na equipe
const teamRoles = [
  { id: 'owner', name: 'Proprietário', description: 'Controle total da equipe', permissions: ['all'] },
  { id: 'admin', name: 'Administrador', description: 'Gerenciar membros e configurações', permissions: ['manage_members', 'edit_settings', 'view_analytics'] },
  { id: 'doctor', name: 'Médico', description: 'Evoluir pacientes e visualizar dados', permissions: ['evolve', 'view_patients', 'view_analytics'] },
  { id: 'resident', name: 'Residente', description: 'Evoluir pacientes com supervisão', permissions: ['evolve_supervised', 'view_patients'] },
  { id: 'intern', name: 'Interno', description: 'Visualizar e aprender', permissions: ['view_patients'] },
  { id: 'nurse', name: 'Enfermeiro(a)', description: 'Visualizar e adicionar notas', permissions: ['view_patients', 'add_notes'] },
];

interface TeamManagerProps {
  isDemo?: boolean;
}

export default function TeamManager({ isDemo = false }: TeamManagerProps) {
  const utils = trpc.useUtils();
  
  // Fetch real teams from database
  const { data: teams = [], isLoading } = trpc.teams.list.useQuery();
  const { data: hospitals = [] } = trpc.hospitals.list.useQuery();
  
  const createTeam = trpc.teams.create.useMutation({
    onSuccess: () => {
      toast.success("Equipe criada com sucesso!");
      utils.teams.list.invalidate();
      setIsCreateDialogOpen(false);
      setNewTeam({ name: "", type: "clinical", hospitalId: 0 });
    },
    onError: (error) => {
      toast.error("Erro ao criar equipe: " + error.message);
    }
  });
  
  const updateTeam = trpc.teams.update.useMutation({
    onSuccess: () => {
      toast.success("Equipe atualizada!");
      utils.teams.list.invalidate();
      setEditingTeamId(null);
      setEditName("");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    }
  });
  
  const deleteTeam = trpc.teams.delete.useMutation({
    onSuccess: () => {
      toast.success("Equipe excluída!");
      utils.teams.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + error.message);
    }
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const [newTeam, setNewTeam] = useState({
    name: "",
    type: "clinical",
    hospitalId: 0
  });

  const [newInvite, setNewInvite] = useState({
    email: "",
    role: "doctor"
  });

  const getTeamType = (specialty?: string | null) => {
    return teamTypes.find(t => t.id === specialty) || teamTypes[0];
  };

  const getRoleInfo = (roleId: string) => {
    return teamRoles.find(r => r.id === roleId) || teamRoles[2];
  };

  const handleCreateTeam = () => {
    if (!newTeam.name) {
      toast.error("Preencha o nome da equipe");
      return;
    }
    createTeam.mutate({
      name: newTeam.name,
      hospitalId: newTeam.hospitalId > 0 ? newTeam.hospitalId : undefined,
      specialty: newTeam.type,
    });
  };

  const handleStartEdit = (team: any) => {
    setEditingTeamId(team.id);
    setEditName(team.name);
  };

  const handleSaveEdit = (teamId: number) => {
    if (!editName.trim()) {
      toast.error("Nome não pode ser vazio");
      return;
    }
    updateTeam.mutate({ id: teamId, name: editName });
  };

  const handleDelete = (teamId: number) => {
    deleteTeam.mutate({ id: teamId });
    setConfirmDeleteId(null);
  };

  const handleInviteMember = () => {
    if (!newInvite.email) {
      toast.error("Preencha o email");
      return;
    }
    // For now, show toast since invite system needs email service
    toast.success("Convite enviado!", {
      description: `Convite enviado para ${newInvite.email} (funcionalidade de email será ativada na Fase 2)`
    });
    setIsInviteDialogOpen(false);
    setNewInvite({ email: "", role: "doctor" });
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Minhas Equipes
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie suas equipes e convide membros
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Equipe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Equipe</DialogTitle>
              <DialogDescription>Crie uma equipe para colaborar com outros profissionais</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Equipe</Label>
                <div className="grid grid-cols-2 gap-2">
                  {teamTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          newTeam.type === type.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setNewTeam({...newTeam, type: type.id})}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${type.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{type.name}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Nome da Equipe *</Label>
                <Input 
                  placeholder="Ex: Cardiologia - Hospital São Lucas"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Hospital</Label>
                {hospitals.length > 0 ? (
                  <Select 
                    value={newTeam.hospitalId > 0 ? newTeam.hospitalId.toString() : "none"} 
                    onValueChange={(v) => setNewTeam({...newTeam, hospitalId: v === "none" ? 0 : parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum (criar depois)</SelectItem>
                      {hospitals.map((h: any) => (
                        <SelectItem key={h.id} value={h.id.toString()}>
                          {h.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum hospital cadastrado. Cadastre um hospital primeiro no onboarding.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTeam} disabled={createTeam.isPending}>
                {createTeam.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Criar Equipe
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {teams.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhuma equipe cadastrada</p>
            <p className="text-sm text-muted-foreground mb-4">Crie sua primeira equipe para começar</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeira Equipe
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Teams List */}
      <div className="grid gap-4">
        {teams.map((team: any) => {
          const teamType = getTeamType(team.specialty);
          const Icon = teamType.icon;
          const isEditing = editingTeamId === team.id;
          const isConfirmingDelete = confirmDeleteId === team.id;
          
          return (
            <Card key={team.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl ${teamType.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 w-48"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(team.id);
                              if (e.key === 'Escape') setEditingTeamId(null);
                            }}
                          />
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSaveEdit(team.id)}>
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingTeamId(null)}>
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                      )}
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Building2 className="w-3 h-3" />
                        {team.hospitalName || "Sem hospital vinculado"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">{teamType.name}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleStartEdit(team)} title="Editar equipe">
                      <Edit className="w-4 h-4" />
                    </Button>
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(team.id)}>
                          Confirmar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteId(team.id)} title="Excluir equipe">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Members */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Membros</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => {
                        setSelectedTeamId(team.id);
                        setIsInviteDialogOpen(true);
                      }}
                    >
                      <UserPlus className="w-3 h-3" />
                      Convidar
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          <Crown className="w-4 h-4 text-amber-500" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">Você</span>
                          <Crown className="w-3 h-3 text-amber-500" />
                        </div>
                        <span className="text-xs text-muted-foreground">Proprietário</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Membro</DialogTitle>
            <DialogDescription>Envie um convite para adicionar um novo membro à equipe</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input 
                type="email"
                placeholder="email@exemplo.com"
                value={newInvite.email}
                onChange={(e) => setNewInvite({...newInvite, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Papel na Equipe</Label>
              <Select 
                value={newInvite.role} 
                onValueChange={(v) => setNewInvite({...newInvite, role: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamRoles.filter(r => r.id !== 'owner').map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInviteMember} className="gap-2">
              <Mail className="w-4 h-4" />
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
