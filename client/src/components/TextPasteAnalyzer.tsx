import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  ClipboardPaste,
  Loader2,
  Brain,
  User,
  Bed,
  Stethoscope,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Trash2,
  Edit3,
  Sparkles,
  FileText,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

interface TextPasteAnalyzerProps {
  onPatientsConfirmed: (patients: ExtractedPatient[]) => void;
  onCancel: () => void;
}

const priorityConfig: Record<string, { label: string; color: string; icon: string }> = {
  critical: { label: "Crítico", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300", icon: "🔴" },
  high: { label: "Alto", color: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300", icon: "🟠" },
  medium: { label: "Médio", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300", icon: "🟡" },
  low: { label: "Baixo", color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300", icon: "🟢" },
};

const confidenceColor = (c: number) =>
  c >= 80 ? "text-green-600 dark:text-green-400" :
  c >= 50 ? "text-amber-600 dark:text-amber-400" :
  "text-red-600 dark:text-red-400";

const confidenceLabel = (c: number) =>
  c >= 80 ? "Alta" : c >= 50 ? "Média" : "Baixa";

type Phase = "input" | "processing" | "review";

export function TextPasteAnalyzer({ onPatientsConfirmed, onCancel }: TextPasteAnalyzerProps) {
  const [phase, setPhase] = useState<Phase>("input");
  const [text, setText] = useState("");
  const [patients, setPatients] = useState<ExtractedPatient[]>([]);
  const [summary, setSummary] = useState("");

  const analyzeText = trpc.patients.analyzeText.useMutation({
    onSuccess: (data) => {
      if (data.patients.length === 0) {
        toast.error("Nenhum paciente encontrado no texto. Tente novamente com mais detalhes.");
        setPhase("input");
        return;
      }
      setPatients(
        data.patients.map((p) => ({
          ...p,
          selected: true,
          expanded: data.patients.length === 1,
        }))
      );
      setSummary(data.summary);
      setPhase("review");
      toast.success(`${data.totalDetected} paciente(s) detectado(s)!`);
    },
    onError: (error) => {
      toast.error("Erro ao analisar texto: " + error.message);
      setPhase("input");
    },
  });

  const handleAnalyze = () => {
    if (text.trim().length < 10) {
      toast.error("Cole um texto com pelo menos 10 caracteres.");
      return;
    }
    setPhase("processing");
    analyzeText.mutate({ text: text.trim() });
  };

  const togglePatient = (idx: number) => {
    setPatients((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, selected: !p.selected } : p))
    );
  };

  const toggleExpand = (idx: number) => {
    setPatients((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, expanded: !p.expanded } : p))
    );
  };

  const removePatient = (idx: number) => {
    setPatients((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePatientField = (idx: number, field: keyof ExtractedPatient, value: string) => {
    setPatients((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  const selectedCount = patients.filter((p) => p.selected).length;

  const handleConfirm = () => {
    const selected = patients.filter((p) => p.selected);
    if (selected.length === 0) {
      toast.error("Selecione pelo menos um paciente.");
      return;
    }
    onPatientsConfirmed(selected);
  };

  // ─── Phase: Input ──────────────────────────────────────────────────
  if (phase === "input") {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardPaste className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Colar Texto Clínico</CardTitle>
              <CardDescription className="text-xs">
                Cole evoluções, passagens de plantão ou resumos — a IA detecta os pacientes automaticamente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={"Cole aqui o texto clínico...\n\nExemplos aceitos:\n• Evolução médica de um ou mais pacientes\n• Passagem de plantão\n• Lista de pacientes com leitos\n• Resumo de alta\n• Texto copiado de outro sistema/prontuário"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] text-sm font-mono"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {text.length > 0 ? `${text.length} caracteres • ${text.split(/\n/).length} linhas` : "Aguardando texto..."}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAnalyze}
                disabled={text.trim().length < 10}
                className="gap-2"
              >
                <Brain className="w-4 h-4" />
                Analisar com IA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Phase: Processing ─────────────────────────────────────────────
  if (phase === "processing") {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold">Analisando texto clínico...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Detectando pacientes e estruturando em SBAR
            </p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Phase: Review ─────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-3 h-3" />
                  {patients.length} paciente{patients.length !== 1 ? "s" : ""} detectado{patients.length !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {selectedCount} selecionado{selectedCount !== 1 ? "s" : ""}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      {patients.map((patient, idx) => {
        const prio = priorityConfig[patient.priority] || priorityConfig.medium;
        return (
          <Card
            key={idx}
            className={`transition-all ${
              patient.selected
                ? "border-primary/30 shadow-sm"
                : "border-muted opacity-60"
            }`}
          >
            {/* Patient Header */}
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => togglePatient(idx)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    patient.selected
                      ? "bg-primary border-primary text-white"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {patient.selected && <CheckCircle className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">{patient.name || "Paciente sem nome"}</span>
                    {patient.bed && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Bed className="w-3 h-3" /> {patient.bed}
                      </Badge>
                    )}
                    <Badge variant="outline" className={`text-xs ${prio.color}`}>
                      {prio.icon} {prio.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    {patient.diagnosis && (
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />
                        {patient.diagnosis}
                        {patient.diagnosisCode && ` (${patient.diagnosisCode})`}
                      </span>
                    )}
                    <span className={`font-medium ${confidenceColor(patient.confidence)}`}>
                      {confidenceLabel(patient.confidence)} ({patient.confidence}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removePatient(idx)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => toggleExpand(idx)}
                  >
                    {patient.expanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Expanded Details */}
            {patient.expanded && (
              <CardContent className="pt-0 space-y-3">
                <Separator />

                {/* Editable basic fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <User className="w-3 h-3" /> Nome
                    </Label>
                    <Input
                      value={patient.name}
                      onChange={(e) => updatePatientField(idx, "name", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Bed className="w-3 h-3" /> Leito
                    </Label>
                    <Input
                      value={patient.bed}
                      onChange={(e) => updatePatientField(idx, "bed", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Diagnóstico</Label>
                    <Input
                      value={patient.diagnosis}
                      onChange={(e) => updatePatientField(idx, "diagnosis", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CID-10</Label>
                    <Input
                      value={patient.diagnosisCode}
                      onChange={(e) => updatePatientField(idx, "diagnosisCode", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* SBAR Sections */}
                <div className="space-y-2">
                  <SBARField
                    letter="S"
                    title="Situação"
                    value={patient.situation}
                    onChange={(v) => updatePatientField(idx, "situation", v)}
                    color="text-primary"
                    borderColor="border-l-primary"
                  />
                  <SBARField
                    letter="B"
                    title="Background"
                    value={patient.background}
                    onChange={(v) => updatePatientField(idx, "background", v)}
                    color="text-blue-600 dark:text-blue-400"
                    borderColor="border-l-blue-400"
                  />
                  <SBARField
                    letter="A"
                    title="Avaliação"
                    value={patient.assessment}
                    onChange={(v) => updatePatientField(idx, "assessment", v)}
                    color="text-amber-600 dark:text-amber-400"
                    borderColor="border-l-amber-400"
                  />
                  <SBARField
                    letter="R"
                    title="Recomendação"
                    value={patient.recommendation}
                    onChange={(v) => updatePatientField(idx, "recommendation", v)}
                    color="text-green-600 dark:text-green-400"
                    borderColor="border-l-green-400"
                  />
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Low confidence warning */}
      {patients.some((p) => p.selected && p.confidence < 50) && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
              Alguns pacientes têm confiança baixa
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
              Revise os dados antes de confirmar. Clique no paciente para expandir e editar.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setPhase("input");
            setPatients([]);
            setSummary("");
          }}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Voltar ao Texto
        </Button>
        <Button
          className="flex-1"
          onClick={handleConfirm}
          disabled={selectedCount === 0}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirmar {selectedCount} Paciente{selectedCount !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}

// ─── Sub-component: Editable SBAR Field ──────────────────────────────

function SBARField({
  letter,
  title,
  value,
  onChange,
  color,
  borderColor,
}: {
  letter: string;
  title: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
  borderColor: string;
}) {
  return (
    <div className={`border-l-4 ${borderColor} pl-3`}>
      <p className={`text-xs font-bold ${color} mb-1`}>
        {letter} — {title}
      </p>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[60px] text-sm resize-none"
        placeholder={`${title} do paciente...`}
      />
    </div>
  );
}
