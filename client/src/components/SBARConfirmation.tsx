import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  User,
  Bed,
  Building2,
  Users,
  Stethoscope,
  Shield,
  Activity,
  Thermometer,
  Heart,
  Wind,
  FileText,
  CheckCircle,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  CreditCard,
} from "lucide-react";

// ─── Patient Confirmation ────────────────────────────────────────────

interface PatientConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  data: {
    name: string;
    bed: string;
    hospital?: string;
    team?: string;
    diagnosis?: string;
    priority: "critical" | "high" | "medium" | "low";
    insurance?: string;
  };
}

const priorityConfig = {
  critical: { label: "Crítico", color: "bg-red-100 text-red-800 border-red-200", icon: "🔴" },
  high: { label: "Alto", color: "bg-orange-100 text-orange-800 border-orange-200", icon: "🟠" },
  medium: { label: "Médio", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🟡" },
  low: { label: "Baixo", color: "bg-green-100 text-green-800 border-green-200", icon: "🟢" },
};

export function PatientConfirmation({
  open,
  onClose,
  onConfirm,
  isLoading,
  data,
}: PatientConfirmationProps) {
  const priority = priorityConfig[data.priority];
  const missingFields: string[] = [];
  if (!data.diagnosis) missingFields.push("Diagnóstico");
  if (!data.insurance) missingFields.push("Convênio");

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="w-5 h-5 text-primary" />
            Confirmar Cadastro
          </AlertDialogTitle>
          <AlertDialogDescription>
            Revise os dados antes de cadastrar o paciente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          {/* Patient */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base truncate">{data.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className={priority.color}>
                    {priority.icon} {priority.label}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoRow icon={<Bed className="w-4 h-4" />} label="Leito" value={data.bed} />
              <InfoRow icon={<Building2 className="w-4 h-4" />} label="Hospital" value={data.hospital || "—"} />
              <InfoRow icon={<Users className="w-4 h-4" />} label="Equipe" value={data.team || "—"} />
              <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Convênio" value={data.insurance || "Não informado"} />
            </div>

            {data.diagnosis && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                <Stethoscope className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Diagnóstico</p>
                  <p className="text-sm font-medium">{data.diagnosis}</p>
                </div>
              </div>
            )}
          </div>

          {/* Warnings */}
          {missingFields.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Campos opcionais não preenchidos</p>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
                  {missingFields.join(", ")} — você pode adicionar depois.
                </p>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar e Editar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button className="flex-1" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Confirmar Cadastro
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Evolution Confirmation ──────────────────────────────────────────

interface VitalSigns {
  temperature?: string;
  heartRate?: string;
  bloodPressure?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
}

interface EvolutionConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  data: {
    patientName?: string;
    bed?: string;
    diagnosis?: string;
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
    vitalSigns?: VitalSigns;
  };
}

export function EvolutionConfirmation({
  open,
  onClose,
  onConfirm,
  isLoading,
  data,
}: EvolutionConfirmationProps) {
  const hasVitals = data.vitalSigns && Object.values(data.vitalSigns).some((v) => v);
  const missingFields: string[] = [];
  if (!data.background.trim()) missingFields.push("Background");
  if (!hasVitals) missingFields.push("Sinais Vitais");

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Confirmar Evolução SBAR
          </AlertDialogTitle>
          <AlertDialogDescription>
            {data.patientName && (
              <span className="font-medium text-foreground">{data.patientName}</span>
            )}
            {data.bed && (
              <span className="text-muted-foreground"> • Leito {data.bed}</span>
            )}
            {data.diagnosis && (
              <span className="text-muted-foreground"> • {data.diagnosis}</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-2">
          {/* Vital Signs Summary */}
          {hasVitals && (
            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-1 text-xs">
                <Activity className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">Sinais Vitais:</span>
              </div>
              {data.vitalSigns?.temperature && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Thermometer className="w-3 h-3" /> {data.vitalSigns.temperature}°C
                </Badge>
              )}
              {data.vitalSigns?.heartRate && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Heart className="w-3 h-3" /> {data.vitalSigns.heartRate} bpm
                </Badge>
              )}
              {data.vitalSigns?.bloodPressure && (
                <Badge variant="outline" className="text-xs">
                  PA {data.vitalSigns.bloodPressure}
                </Badge>
              )}
              {data.vitalSigns?.respiratoryRate && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Wind className="w-3 h-3" /> {data.vitalSigns.respiratoryRate} irpm
                </Badge>
              )}
              {data.vitalSigns?.oxygenSaturation && (
                <Badge variant="outline" className="text-xs">
                  SpO2 {data.vitalSigns.oxygenSaturation}%
                </Badge>
              )}
            </div>
          )}

          {/* SBAR Sections */}
          <SBARSection
            letter="S"
            title="Situação"
            content={data.situation}
            color="text-primary"
            bgColor="bg-primary/5 border-l-4 border-primary"
          />
          <SBARSection
            letter="B"
            title="Background"
            content={data.background}
            color="text-blue-600"
            bgColor="bg-blue-50 border-l-4 border-blue-400 dark:bg-blue-950/20"
            empty={!data.background.trim()}
          />
          <SBARSection
            letter="A"
            title="Avaliação"
            content={data.assessment}
            color="text-amber-600"
            bgColor="bg-amber-50 border-l-4 border-amber-400 dark:bg-amber-950/20"
          />
          <SBARSection
            letter="R"
            title="Recomendação"
            content={data.recommendation}
            color="text-green-600"
            bgColor="bg-green-50 border-l-4 border-green-400 dark:bg-green-950/20"
          />

          {/* Warnings */}
          {missingFields.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Campos não preenchidos</p>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
                  {missingFields.join(", ")} — a evolução será salva sem esses dados.
                </p>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar e Editar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button className="flex-1" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Finalizar Evolução
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Shared Sub-components ───────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function SBARSection({
  letter,
  title,
  content,
  color,
  bgColor,
  empty,
}: {
  letter: string;
  title: string;
  content: string;
  color: string;
  bgColor: string;
  empty?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg ${bgColor}`}>
      <p className={`text-sm font-bold ${color} mb-1`}>
        {letter} — {title}
      </p>
      {empty ? (
        <p className="text-xs text-muted-foreground italic">Não preenchido</p>
      ) : (
        <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">
          {content}
        </p>
      )}
    </div>
  );
}
