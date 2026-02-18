import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  Settings, 
  LogOut, 
  HelpCircle, 
  FileText,
  Bell,
  Shield,
  ChevronDown,
  Copy,
  Mail,
  Users,
  Building2,
  Plus,
  Link2,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { isFeatureEnabled } from "@/hooks/useFeatureFlag";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UserMenuProps {
  userName?: string;
  userEmail?: string;
  userRole?: string;
  isDemo?: boolean;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
}

export default function UserMenu({ 
  userName = "Dr. Carlos Mendes",
  userEmail = "carlos.mendes@hospital.com",
  userRole = "Médico",
  isDemo = false,
  onNavigate,
  onLogout
}: UserMenuProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const handleLogout = () => {
    if (isDemo) {
      toast.info("No modo demo, você será redirecionado para a página inicial");
      window.location.href = "/";
    } else {
      onLogout?.();
    }
    setShowLogoutConfirm(false);
  };

  const generateInviteLink = () => {
    const link = `${window.location.origin}/join/${Math.random().toString(36).substring(7)}`;
    setInviteLink(link);
    setShowInviteDialog(true);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    toast.success("Link copiado para a área de transferência!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const sendInviteByEmail = () => {
    if (!inviteEmail) {
      toast.error("Digite um email válido");
      return;
    }
    toast.success(`Convite enviado para ${inviteEmail}`);
    setInviteEmail("");
  };

  const handleCreateTeam = () => {
    if (!newTeamName) {
      toast.error("Digite um nome para a equipe");
      return;
    }
    toast.success(`Equipe "${newTeamName}" criada com sucesso!`);
    setNewTeamName("");
    setShowCreateTeamDialog(false);
    // Generate invite link for the new team
    generateInviteLink();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-auto py-1.5 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium">{userName}</span>
              <span className="text-xs text-muted-foreground">{userRole}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Quick Actions */}
          <DropdownMenuItem onClick={() => setShowCreateTeamDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Criar Nova Equipe</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={generateInviteLink}>
            <Users className="mr-2 h-4 w-4" />
            <span>Convidar para Equipe</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onNavigate?.('hospitals')}>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Adicionar Hospital</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Navigation */}
          <DropdownMenuItem onClick={() => onNavigate?.('settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onNavigate?.('reminders')}>
            <Bell className="mr-2 h-4 w-4" />
            <span>Lembretes</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("Abrindo documentação...")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Documentação</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("Abrindo suporte...")}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Ajuda & Suporte</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Privacy Info */}
          <DropdownMenuItem disabled className="opacity-70">
            <Shield className="mr-2 h-4 w-4 text-green-600" />
            <span className="text-xs">Seus dados estão protegidos</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Logout */}
          <DropdownMenuItem 
            onClick={() => setShowLogoutConfirm(true)}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Saída</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja sair do sistema? 
              {!isDemo && " Suas evoluções não salvas serão perdidas."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Convidar para Equipe
            </DialogTitle>
            <DialogDescription>
              Compartilhe o link abaixo para convidar membros para sua equipe.
              Apenas pessoas com o link poderão acessar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Copy Link */}
            <div className="space-y-2">
              <Label>Link de Convite</Label>
              <div className="flex gap-2">
                <Input 
                  value={inviteLink} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copyInviteLink}
                >
                  {linkCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Este link expira em 7 dias
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou envie por email
                </span>
              </div>
            </div>

            {/* Send by Email */}
            <div className="space-y-2">
              <Label>Email do Convidado</Label>
              <div className="flex gap-2">
                <Input 
                  type="email"
                  placeholder="colega@hospital.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button onClick={sendInviteByEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Criar Nova Equipe
            </DialogTitle>
            <DialogDescription>
              Crie uma equipe para organizar seus pacientes e colaborar com colegas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Equipe</Label>
              <Input 
                placeholder="Ex: Cardiologia - Hospital São Lucas"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Após criar a equipe, você poderá convidar membros através de um link.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCreateTeamDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTeam}>
              Criar Equipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Mascot Menu Component
interface MascotMenuProps {
  onNavigate?: (view: string) => void;
}

export function MascotMenu({ onNavigate }: MascotMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <img 
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030272605/ubKvZkApcgNYgZfg.png" 
            alt="SBAR Health" 
            className="w-10 h-10 rounded-full object-cover hover:scale-110 transition-transform cursor-pointer"
            onError={(e) => {
              // Fallback to emoji if image fails
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden text-2xl">🐯</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <span className="text-lg">🐯</span>
            <span>Menu Rápido</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onNavigate?.('dashboard')}>
          <span className="mr-2">🏠</span>
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onNavigate?.('new-patient')}>
          <span className="mr-2">➕</span>
          <span>Novo Paciente</span>
        </DropdownMenuItem>
        {isFeatureEnabled('analytics') && (
          <DropdownMenuItem onClick={() => onNavigate?.('analytics')}>
            <span className="mr-2">📊</span>
            <span>Analytics</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onNavigate?.('teams')}>
          <span className="mr-2">👥</span>
          <span>Minhas Equipes</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onNavigate?.('hospitals')}>
          <span className="mr-2">🏥</span>
          <span>Hospitais</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {isFeatureEnabled('drg') && (
          <DropdownMenuItem onClick={() => onNavigate?.('drg')}>
            <span className="mr-2">📋</span>
            <span>Sistema DRG</span>
          </DropdownMenuItem>
        )}
        {isFeatureEnabled('drgPredictor') && (
          <DropdownMenuItem onClick={() => onNavigate?.('drg-predictor')}>
            <span className="mr-2">🤖</span>
            <span>IA Preditor DRG</span>
          </DropdownMenuItem>
        )}
        {isFeatureEnabled('recoveryRoom') && (
          <DropdownMenuItem onClick={() => onNavigate?.('recovery')}>
            <span className="mr-2">🩺</span>
            <span>Sala de Recuperação</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onNavigate?.('settings')}>
          <span className="mr-2">⚙️</span>
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info("Abrindo tutorial...")}>
          <span className="mr-2">📚</span>
          <span>Tutorial</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
