import { useState } from "react";
import { useLocation } from "wouter";
import {
  ClipboardPaste,
  FileUp,
  PenLine,
  ArrowRight,
  Loader2,
  Stethoscope,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TextPasteAnalyzer } from "@/components/TextPasteAnalyzer";
import { DocumentImporter } from "@/components/DocumentImporter";
import { SetupWizard } from "@/components/SetupWizard";

type Phase = "options" | "paste" | "upload" | "manual" | "setup" | "saving";

interface ExtractedPatient {
  name: string;
  age: string;
  diagnosis: string;
  diagnosisCode: string;
  bed: string;
  insurance: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  confidence: number;
  priority: string;
  selected: boolean;
  expanded: boolean;
}

interface DetectedPatient {
  id: string;
  name: string;
  age?: string;
  diagnosis?: string;
  diagnosisCode?: string;
  bed?: string;
  insurance?: string;
  situation?: string;
  background?: string;
  confidence: number;
  selected: boolean;
  editing: boolean;
}

function detectedToExtracted(p: DetectedPatient): ExtractedPatient {
  return {
    name: p.name,
    age: p.age ?? "",
    diagnosis: p.diagnosis ?? "",
    diagnosisCode: p.diagnosisCode ?? "",
    bed: p.bed ?? "",
    insurance: p.insurance ?? "",
    situation: p.situation ?? "",
    background: p.background ?? "",
    assessment: "",
    recommendation: "",
    confidence: p.confidence,
    priority: "medium",
    selected: p.selected,
    expanded: false,
  };
}

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<Phase>("options");
  const [pendingPatients, setPendingPatients] = useState<ExtractedPatient[]>([]);
  const [showDocumentImporter, setShowDocumentImporter] = useState(false);
  const [savingCount, setSavingCount] = useState(0);

  // Manual form state
  const [manualName, setManualName] = useState("");
  const [manualBed, setManualBed] = useState("");
  const [manualDiagnosis, setManualDiagnosis] = useState("");
  const [manualPriority, setManualPriority] = useState("medium");

  const { data: hospitals = [] } = trpc.hospitals.list.useQuery();
  const { data: teams = [] } = trpc.teams.list.useQuery();
  const utils = trpc.useUtils();

  const createPatient = trpc.patients.create.useMutation();
  const createAdmission = trpc.admissions.create.useMutation();
  const saveDraft = trpc.evolutions.saveDraft.useMutation();
  const completeOnboarding = trpc.profile.completeOnboarding.useMutation();

  const hasHospitalAndTeam = hospitals.length > 0 && teams.length > 0;

  const savePatientsWithHospitalTeam = async (
    patients: ExtractedPatient[],
    hospitalId: number,
    teamId: number
  ) => {
    setPhase("saving");
    const toSave = patients.filter((p) => p.selected !== false);
    setSavingCount(toSave.length);

    let successCount = 0;
    let errorCount = 0;

    for (const p of toSave) {
      try {
        const patientResult = await createPatient.mutateAsync({ name: p.name });

        let mainDiagnosis = "";
        if (p.diagnosisCode && p.diagnosis) {
          mainDiagnosis = `${p.diagnosisCode} - ${p.diagnosis}`;
        } else if (p.diagnosis) {
          mainDiagnosis = p.diagnosis;
        } else if (p.diagnosisCode) {
          mainDiagnosis = p.diagnosisCode;
        }

        const admResult = await createAdmission.mutateAsync({
          patientId: patientResult.id,
          hospitalId,
          teamId,
          bed: p.bed || `LEITO-${successCount + 1}`,
          mainDiagnosis: mainDiagnosis || undefined,
          priority: (["critical", "high", "medium", "low"].includes(p.priority)
            ? p.priority
            : "medium") as "critical" | "high" | "medium" | "low",
          insuranceProvider: p.insurance || undefined,
        });

        if ((p.situation || p.background) && admResult.id) {
          try {
            await saveDraft.mutateAsync({
              admissionId: admResult.id,
              situation: p.situation || "",
              background: p.background || "",
              assessment: p.assessment || "",
              recommendation: p.recommendation || "",
            });
          } catch {
            // draft failure is non-critical
          }
        }

        successCount++;
      } catch (error: any) {
        console.error(`Erro ao salvar ${p.name}:`, error);
        errorCount++;
      }
    }

    try {
      await completeOnboarding.mutateAsync();
    } catch {
      // non-critical
    }

    await utils.admissions.byHospital.invalidate();

    if (successCount > 0) {
      toast.success(
        `${successCount} paciente(s) cadastrado(s) com sucesso!` +
          (errorCount > 0 ? ` (${errorCount} com erro)` : "")
      );
    } else {
      toast.error("Nenhum paciente pôde ser cadastrado. Verifique os dados.");
    }

    window.location.href = "/dashboard";
  };

  const handleTextConfirmed = (patients: ExtractedPatient[]) => {
    const selected = patients.filter((p) => p.selected !== false);
    if (selected.length === 0) {
      toast.error("Selecione ao menos um paciente.");
      return;
    }
    setPendingPatients(selected);
    if (hasHospitalAndTeam) {
      savePatientsWithHospitalTeam(selected, hospitals[0].id, teams[0].id);
    } else {
      setPhase("setup");
    }
  };

  const handleDocumentImported = (
    patients: DetectedPatient[],
    hospitalId?: number,
    teamId?: number
  ) => {
    setShowDocumentImporter(false);
    const extracted = patients.filter((p) => p.selected).map(detectedToExtracted);
    if (extracted.length === 0) {
      setPhase("options");
      return;
    }
    if (hospitalId && teamId) {
      savePatientsWithHospitalTeam(extracted, hospitalId, teamId);
    } else {
      setPendingPatients(extracted);
      if (hasHospitalAndTeam) {
        savePatientsWithHospitalTeam(extracted, hospitals[0].id, teams[0].id);
      } else {
        setPhase("setup");
      }
    }
  };

  const handleManualConfirm = () => {
    if (!manualName.trim()) {
      toast.error("Informe o nome do paciente.");
      return;
    }
    const patient: ExtractedPatient = {
      name: manualName.trim(),
      age: "",
      diagnosis: manualDiagnosis.trim(),
      diagnosisCode: "",
      bed: manualBed.trim() || "A1",
      insurance: "",
      situation: "",
      background: "",
      assessment: "",
      recommendation: "",
      confidence: 100,
      priority: manualPriority,
      selected: true,
      expanded: false,
    };
    setPendingPatients([patient]);
    if (hasHospitalAndTeam) {
      savePatientsWithHospitalTeam([patient], hospitals[0].id, teams[0].id);
    } else {
      setPhase("setup");
    }
  };

  const handleSetupComplete = async () => {
    await utils.hospitals.list.invalidate();
    await utils.teams.list.invalidate();
    const freshHospitals = await utils.hospitals.list.fetch();
    const freshTeams = await utils.teams.list.fetch();
    if (freshHospitals && freshHospitals.length > 0 && freshTeams && freshTeams.length > 0) {
      await savePatientsWithHospitalTeam(
        pendingPatients,
        (freshHospitals[0] as any).id,
        (freshTeams[0] as any).id
      );
    } else {
      toast.error("Não foi possível recuperar hospital/equipe. Tente novamente.");
      setPhase("options");
    }
  };

  const handleSkipToPanel = async () => {
    try {
      await completeOnboarding.mutateAsync();
    } catch {
      // non-critical
    }
    window.location.href = "/dashboard";
  };

  const handleSetupSkip = async () => {
    try {
      await completeOnboarding.mutateAsync();
    } catch {
      // non-critical
    }
    window.location.href = "/dashboard";
  };

  // ─── Fase: saving ───────────────────────────────────────────────────────────
  if (phase === "saving") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-lg font-medium">Salvando {savingCount} paciente(s)...</p>
          <p className="text-sm text-muted-foreground">Já vai aparecer no painel!</p>
        </div>
      </div>
    );
  }

  // ─── Fase: setup ────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-primary" />
            <span className="font-bold text-lg text-primary">SBAR Health</span>
          </div>
          <button
            onClick={handleSetupSkip}
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
          >
            Pular e ir ao painel
          </button>
        </header>

        <main className="flex-1 container max-w-lg px-6 py-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Quase lá!</h1>
            <p className="text-muted-foreground">
              {pendingPatients.length} paciente(s) prontos. Agora informe onde você trabalha para
              vinculá-los.
            </p>
          </div>

          <SetupWizard
            missingStep="both"
            onComplete={handleSetupComplete}
            onSkip={handleSetupSkip}
          />
        </main>
      </div>
    );
  }

  // ─── Fase: paste ────────────────────────────────────────────────────────────
  if (phase === "paste") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col">
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-primary" />
            <span className="font-bold text-lg text-primary">SBAR Health</span>
          </div>
          <button
            onClick={() => setPhase("options")}
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
          >
            ← Voltar
          </button>
        </header>

        <main className="flex-1 container max-w-2xl px-6 py-4 overflow-y-auto">
          <TextPasteAnalyzer
            onPatientsConfirmed={handleTextConfirmed}
            onCancel={() => setPhase("options")}
          />
        </main>
      </div>
    );
  }

  // ─── Fase: manual ───────────────────────────────────────────────────────────
  if (phase === "manual") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col">
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-primary" />
            <span className="font-bold text-lg text-primary">SBAR Health</span>
          </div>
          <button
            onClick={() => setPhase("options")}
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
          >
            ← Voltar
          </button>
        </header>

        <main className="flex-1 container max-w-md px-6 py-8 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Novo paciente</h1>
            <p className="text-muted-foreground text-sm">Preencha os dados básicos. Você pode adicionar mais depois.</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="m-name">Nome do paciente *</Label>
                <Input
                  id="m-name"
                  placeholder="Ex: João Silva"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="m-bed">Leito *</Label>
                <Input
                  id="m-bed"
                  placeholder="Ex: UTI-01, Enf-12, A1"
                  value={manualBed}
                  onChange={(e) => setManualBed(e.target.value.toUpperCase())}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="m-diag">Diagnóstico principal</Label>
                <Input
                  id="m-diag"
                  placeholder="Ex: Pneumonia comunitária"
                  value={manualDiagnosis}
                  onChange={(e) => setManualDiagnosis(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={manualPriority} onValueChange={setManualPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">🔴 Crítico</SelectItem>
                    <SelectItem value="high">🟠 Alto</SelectItem>
                    <SelectItem value="medium">🟡 Médio</SelectItem>
                    <SelectItem value="low">🟢 Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full mt-2"
                size="lg"
                onClick={handleManualConfirm}
                disabled={!manualName.trim()}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmar paciente
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Você pode cadastrar mais pacientes depois no painel.
          </p>
        </main>
      </div>
    );
  }

  // ─── Fase: options (tela inicial) ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col">
      {/* DocumentImporter overlay (opened when user picks upload) */}
      {showDocumentImporter && (
        <DocumentImporter
          onPatientsImported={handleDocumentImported}
          onClose={() => setShowDocumentImporter(false)}
        />
      )}

      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-7 h-7 text-primary" />
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            SBAR Health
          </span>
        </div>
        <button
          onClick={handleSkipToPanel}
          disabled={completeOnboarding.isPending}
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          {completeOnboarding.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : null}
          Ir direto ao painel
          <ArrowRight className="w-3 h-3" />
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 container max-w-2xl px-6 py-8 flex flex-col justify-center">
        {/* Welcome text */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Bem-vindo ao SBAR Health!</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Como quer começar? Escolha a forma mais rápida para você.
          </p>
        </div>

        {/* 3 option cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Paste text */}
          <Card
            className={cn(
              "cursor-pointer border-2 transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-1 group"
            )}
            onClick={() => setPhase("paste")}
          >
            <CardContent className="pt-8 pb-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto group-hover:bg-blue-500/20 transition-colors">
                <ClipboardPaste className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-base mb-1">Colar texto</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cole qualquer texto clínico — o sistema extrai os dados automaticamente
                </p>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs font-medium text-blue-600">
                <span>Mais rápido</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Upload PDF/image */}
          <Card
            className="cursor-pointer border-2 transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-1 group"
            onClick={() => setShowDocumentImporter(true)}
          >
            <CardContent className="pt-8 pb-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto group-hover:bg-purple-500/20 transition-colors">
                <FileUp className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-base mb-1">Foto ou PDF</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Foto do censo, prontuário ou lista — a IA lê e preenche os campos
                </p>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs font-medium text-purple-600">
                <span>Com imagem</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Manual */}
          <Card
            className="cursor-pointer border-2 transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-1 group"
            onClick={() => setPhase("manual")}
          >
            <CardContent className="pt-8 pb-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto group-hover:bg-emerald-500/20 transition-colors">
                <PenLine className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-semibold text-base mb-1">Digitar manualmente</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Adicione um paciente por vez com os dados básicos
                </p>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs font-medium text-emerald-600">
                <span>Passo a passo</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer hint */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Pode adicionar mais pacientes, hospitais e equipes depois no painel.{" "}
          <button
            onClick={() => setLocation("/onboarding")}
            className="text-primary hover:underline"
          >
            Configuração avançada →
          </button>
        </p>
      </main>
    </div>
  );
}
