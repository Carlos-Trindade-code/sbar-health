import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { AlertTriangle, Archive, Trash2, UserMinus, CheckCircle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'default',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <CheckCircle className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Pre-built confirmation dialogs for common actions
interface ActionConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  patientName?: string;
  itemName?: string;
}

export function ArchivePatientConfirm({ open, onOpenChange, onConfirm, patientName }: ActionConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Arquivar Paciente"
      description={`Tem certeza que deseja arquivar ${patientName || 'este paciente'}? O paciente será movido para a lista de arquivados e poderá ser restaurado a qualquer momento.`}
      confirmText="Arquivar"
      variant="warning"
      onConfirm={onConfirm}
    />
  );
}

export function DischargePatientConfirm({ open, onOpenChange, onConfirm, patientName }: ActionConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Dar Alta ao Paciente"
      description={`Confirma a alta de ${patientName || 'este paciente'}? Esta ação registrará a alta no sistema e o paciente será movido para o histórico.`}
      confirmText="Confirmar Alta"
      variant="default"
      onConfirm={onConfirm}
    />
  );
}

export function DeleteEvolutionConfirm({ open, onOpenChange, onConfirm }: ActionConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir Evolução"
      description="Tem certeza que deseja excluir esta evolução? Esta ação não pode ser desfeita."
      confirmText="Excluir"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}

export function ArchiveTeamConfirm({ open, onOpenChange, onConfirm, itemName }: ActionConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Arquivar Equipe"
      description={`Tem certeza que deseja arquivar a equipe "${itemName || 'esta equipe'}"? Todos os administradores serão notificados. A equipe poderá ser restaurada por qualquer administrador.`}
      confirmText="Arquivar Equipe"
      variant="warning"
      onConfirm={onConfirm}
    />
  );
}

export function RemoveMemberConfirm({ open, onOpenChange, onConfirm, itemName }: ActionConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Remover Membro"
      description={`Tem certeza que deseja remover ${itemName || 'este membro'} da equipe? Ele perderá acesso aos pacientes compartilhados.`}
      confirmText="Remover"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}

// Patient Selector Dialog for Evolution
interface PatientSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Array<{ id: number; name: string; bed: string; diagnosis: string }>;
  onSelect: (patient: { id: number; name: string; bed: string; diagnosis: string }) => void;
}

export function PatientSelectorDialog({ open, onOpenChange, patients, onSelect }: PatientSelectorProps) {
  const [search, setSearch] = useState("");
  
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.bed.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Paciente</DialogTitle>
          <DialogDescription>
            Escolha o paciente para criar uma nova evolução
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Buscar por nome ou leito..."
            className="w-full px-3 py-2 border rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredPatients.map(patient => (
              <button
                key={patient.id}
                className="w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors"
                onClick={() => {
                  onSelect(patient);
                  onOpenChange(false);
                }}
              >
                <div className="font-medium">{patient.name}</div>
                <div className="text-sm text-muted-foreground flex gap-2">
                  <span>Leito: {patient.bed}</span>
                  <span>•</span>
                  <span>{patient.diagnosis}</span>
                </div>
              </button>
            ))}
            {filteredPatients.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhum paciente encontrado
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Save/Edit/Cancel Action Bar
interface ActionBarProps {
  onSave: () => void;
  onCancel: () => void;
  onEdit?: () => void;
  isSaving?: boolean;
  isEditing?: boolean;
  showEdit?: boolean;
  saveText?: string;
  editText?: string;
  cancelText?: string;
}

export function ActionBar({
  onSave,
  onCancel,
  onEdit,
  isSaving = false,
  isEditing = false,
  showEdit = false,
  saveText = "Salvar",
  editText = "Editar",
  cancelText = "Cancelar"
}: ActionBarProps) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4 border-t">
      <Button variant="outline" onClick={onCancel} disabled={isSaving}>
        {cancelText}
      </Button>
      {showEdit && !isEditing && (
        <Button variant="secondary" onClick={onEdit}>
          {editText}
        </Button>
      )}
      <Button onClick={onSave} disabled={isSaving}>
        {isSaving ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Salvando...
          </>
        ) : (
          saveText
        )}
      </Button>
    </div>
  );
}
