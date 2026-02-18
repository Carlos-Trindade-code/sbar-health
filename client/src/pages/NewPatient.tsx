import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Mic, 
  MicOff, 
  User, 
  Bed, 
  Stethoscope,
  CheckCircle,
  Loader2,
  FileText,
  Upload,
  ClipboardPaste,
  Plus
} from "lucide-react";
import { DiagnosisTranslator } from "@/components/DiagnosisTranslator";
import { CID10Search } from "@/components/CID10Search";
import { InsuranceSelector } from "@/components/InsuranceSelector";
import { DocumentImporter } from "@/components/DocumentImporter";
import { ImportTutorial, useImportTutorial } from "@/components/ImportTutorial";
import { PatientConfirmation } from "@/components/SBARConfirmation";
import { TextPasteAnalyzer } from "@/components/TextPasteAnalyzer";
import { VoicePatientInput } from "@/components/VoicePatientInput";
import { SetupWizard } from "@/components/SetupWizard";
import { useLocation } from "wouter";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export default function NewPatient() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  // Form state
  const [name, setName] = useState("");
  const [bed, setBed] = useState("");
  const [hospitalId, setHospitalId] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");
  const [mainDiagnosis, setMainDiagnosis] = useState("");
  const [priority, setPriority] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  
  // Voice recording state (inline per-field)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  
  // Full voice input modal
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  
  // Duplicate detection
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  
  // Document importer
  const [showDocumentImporter, setShowDocumentImporter] = useState(false);
  
  // Confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Text paste mode
  const [showTextPaste, setShowTextPaste] = useState(false);
  
  // Batch import state
  const [batchPatients, setBatchPatients] = useState<any[]>([]);
  const [isBatchSaving, setIsBatchSaving] = useState(false);
  
  // Setup wizard completed state (to force re-render after setup)
  const [setupJustCompleted, setSetupJustCompleted] = useState(false);
  
  // Import tutorial
  const { shouldShow: showImportTutorial, setShouldShow: setShowImportTutorial, completeTutorial } = useImportTutorial();
  
  const { data: hospitals = [], isLoading: hospitalsLoading } = trpc.hospitals.list.useQuery();
  const { data: teams = [], isLoading: teamsLoading } = trpc.teams.list.useQuery();
  
  const checkDuplicate = trpc.patients.checkDuplicate.useQuery(
    { name },
    { enabled: name.length >= 3 }
  );
  
  const createPatient = trpc.patients.create.useMutation();
  const createAdmission = trpc.admissions.create.useMutation();
  const saveDraftMutation = trpc.evolutions.saveDraft.useMutation();

  useEffect(() => {
    if (checkDuplicate.data && checkDuplicate.data.length > 0) {
      setDuplicates(checkDuplicate.data);
      setShowDuplicateWarning(true);
    } else {
      setDuplicates([]);
      setShowDuplicateWarning(false);
    }
  }, [checkDuplicate.data]);

  useEffect(() => {
    if (hospitals.length > 0 && !hospitalId) {
      setHospitalId(hospitals[0].id.toString());
    }
  }, [hospitals, hospitalId]);

  useEffect(() => {
    if (teams.length > 0 && !teamId) {
      setTeamId(teams[0].id.toString());
    }
  }, [teams, teamId]);

  const handleVoiceInput = useCallback((field: string) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Reconhecimento de voz não suportado neste navegador. Use Chrome ou Edge.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setRecordingField(field);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      
      switch (field) {
        case 'name':
          setName(transcript);
          break;
        case 'bed':
          setBed(transcript.toUpperCase().replace(/\s/g, '-'));
          break;
        case 'diagnosis':
          setMainDiagnosis(transcript);
          break;
      }
      
      toast.success(`Texto reconhecido: "${transcript}"`);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        toast.error("Permissão de microfone negada. Habilite nas configurações do navegador.");
      } else if (event.error === 'no-speech') {
        toast.info("Nenhuma fala detectada. Tente novamente.");
      } else {
        toast.error("Erro no reconhecimento de voz. Tente usar Chrome ou Edge.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setRecordingField(null);
    };

    recognition.start();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Nome do paciente é obrigatório");
      return;
    }
    
    if (!bed.trim()) {
      toast.error("Leito é obrigatório");
      return;
    }
    
    if (!hospitalId || !teamId) {
      toast.error("Selecione hospital e equipe");
      return;
    }

    // Show confirmation dialog instead of submitting directly
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    try {
      const patientResult = await createPatient.mutateAsync({ name });
      
      if (hospitalId && teamId) {
        const admissionResult = await createAdmission.mutateAsync({
          patientId: patientResult.id,
          hospitalId: parseInt(hospitalId),
          teamId: parseInt(teamId),
          bed,
          mainDiagnosis: mainDiagnosis || undefined,
          priority,
          insuranceProvider: insuranceProvider || undefined,
        });
        
        toast.success("Paciente cadastrado com sucesso!");
        utils.admissions.byHospital.invalidate();
        setLocation(`/evolution/${admissionResult.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar paciente");
      setShowConfirmation(false);
    }
  };

  // Handle batch save from import/paste
  const handleBatchSave = async (patients: any[], overrideHospitalId?: number, overrideTeamId?: number) => {
    const hId = overrideHospitalId ? String(overrideHospitalId) : hospitalId;
    const tId = overrideTeamId ? String(overrideTeamId) : teamId;
    
    if (!hId || !tId) {
      toast.error("Selecione hospital e equipe antes de importar pacientes");
      return;
    }

    setIsBatchSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const p of patients) {
      try {
        const patientResult = await createPatient.mutateAsync({ name: p.name });
        
        // Build mainDiagnosis: prefer "CID - Descrição" format
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
          hospitalId: parseInt(hId),
          teamId: parseInt(tId),
          bed: p.bed || `LEITO-${successCount + 1}`,
          mainDiagnosis: mainDiagnosis || undefined,
          priority: (p.priority && ['critical', 'high', 'medium', 'low'].includes(p.priority)) 
            ? p.priority 
            : "medium",
          insuranceProvider: p.insurance || undefined,
        });
        
        // If situation or background were extracted, create initial evolution draft
        if ((p.situation || p.background) && admResult.id) {
          try {
            await saveDraftMutation.mutateAsync({
              admissionId: admResult.id,
              situation: p.situation || "",
              background: p.background || "",
              assessment: p.assessment || "",
              recommendation: p.recommendation || "",
            });
          } catch (draftError) {
            console.warn(`Draft não salvo para ${p.name}:`, draftError);
          }
        }
        successCount++;
      } catch (error: any) {
        console.error(`Erro ao salvar ${p.name}:`, error);
        errorCount++;
      }
    }

    setIsBatchSaving(false);
    utils.admissions.byHospital.invalidate();

    if (successCount > 0) {
      toast.success(`${successCount} paciente(s) cadastrado(s) com sucesso!`);
      if (errorCount > 0) {
        toast.warning(`${errorCount} paciente(s) não puderam ser cadastrados.`);
      }
      setLocation("/dashboard");
    } else {
      toast.error("Nenhum paciente pôde ser cadastrado. Verifique os dados.");
    }
  };

  const handleVoiceDataExtracted = (data: any) => {
    setName(data.name || "");
    if (data.bed) setBed(data.bed);
    if (data.diagnosis) setMainDiagnosis(data.diagnosis);
    if (data.insurance) setInsuranceProvider(data.insurance);
    setShowVoiceInput(false);
    toast.success("Dados preenchidos por voz. Revise e salve.");
  };

  const useDuplicate = (patientId: number) => {
    toast.info("Funcionalidade em desenvolvimento");
  };

  const isLoading = createPatient.isPending || createAdmission.isPending;

  // Check if setup is needed (no hospitals or no teams)
  const dataLoaded = !hospitalsLoading && !teamsLoading;
  const noHospitalsOrTeams = dataLoaded && (hospitals.length === 0 || teams.length === 0);
  const needsSetup = noHospitalsOrTeams && !setupJustCompleted;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex items-center gap-3 h-16">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">Novo Paciente</h1>
            <p className="text-xs text-muted-foreground">
              {needsSetup ? "Configure primeiro" : "Cadastro rápido"}
            </p>
          </div>
          
          {/* Input method buttons - only show when setup is complete */}
          {!needsSetup && (
            <div className="flex items-center gap-1.5">
              <Button 
                variant="outline"
                onClick={() => setShowVoiceInput(true)}
                size="sm"
                className="gap-1.5"
                title="Cadastrar por voz"
              >
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Voz</span>
              </Button>
              <Button 
                variant={showTextPaste ? "default" : "outline"}
                onClick={() => setShowTextPaste(!showTextPaste)}
                size="sm"
                className="gap-1.5"
                title="Colar texto clínico"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span className="hidden sm:inline">Colar</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDocumentImporter(true)}
                size="sm"
                className="gap-1.5"
                title="Importar documento (PDF/foto)"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Importar</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Import Tutorial */}
      {showImportTutorial && (
        <ImportTutorial
          onComplete={() => {
            completeTutorial();
            setShowDocumentImporter(true);
          }}
          onSkip={() => setShowImportTutorial(false)}
        />
      )}

      {/* Patient Confirmation Dialog */}
      <PatientConfirmation
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmedSubmit}
        isLoading={isLoading}
        data={{
          name,
          bed,
          hospital: hospitals.find(h => h.id.toString() === hospitalId)?.name,
          team: teams.find(t => t.id.toString() === teamId)?.name,
          diagnosis: mainDiagnosis || undefined,
          priority,
          insurance: insuranceProvider || undefined,
        }}
      />

      {/* Voice Patient Input Modal */}
      {showVoiceInput && (
        <VoicePatientInput
          onDataExtracted={handleVoiceDataExtracted}
          onClose={() => setShowVoiceInput(false)}
        />
      )}

      {/* Document Importer Modal */}
      {showDocumentImporter && (
        <DocumentImporter
          onPatientsImported={(patients, importHospitalId, importTeamId) => {
            if (patients.length === 1) {
              const first = patients[0];
              setName(first.name);
              if (first.bed) setBed(first.bed);
              if (first.diagnosis) {
                const diagStr = first.diagnosisCode 
                  ? `${first.diagnosisCode} - ${first.diagnosis}` 
                  : first.diagnosis;
                setMainDiagnosis(diagStr);
              }
              if (first.insurance) setInsuranceProvider(first.insurance);
              // Set hospital/team from importer selection
              if (importHospitalId) setHospitalId(String(importHospitalId));
              if (importTeamId) setTeamId(String(importTeamId));
              toast.success(`Dados de ${first.name} preenchidos. Revise e salve.`);
            } else if (patients.length > 1) {
              handleBatchSave(patients, importHospitalId, importTeamId);
            }
          }}
          onClose={() => setShowDocumentImporter(false)}
          preSelectedHospitalId={hospitalId}
          preSelectedTeamId={teamId}
        />
      )}

      <main className="container py-6 max-w-2xl">
        {/* Batch saving indicator */}
        {isBatchSaving && (
          <Card className="mb-6 border-primary bg-primary/5">
            <CardContent className="flex items-center gap-3 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="font-medium">Salvando pacientes importados...</p>
                <p className="text-sm text-muted-foreground">Aguarde enquanto os pacientes são cadastrados no sistema.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Wizard - fluxo guiado quando falta hospital ou equipe */}
        {needsSetup && (
          <div className="mb-6">
            <SetupWizard
              missingStep={hospitals.length === 0 && teams.length === 0 ? "both" : hospitals.length === 0 ? "hospital" : "team"}
              onComplete={() => {
                setSetupJustCompleted(true);
                utils.hospitals.list.invalidate();
                utils.teams.list.invalidate();
              }}
              onSkip={() => setLocation("/settings")}
            />
          </div>
        )}

        {/* Text Paste Analyzer */}
        {showTextPaste && !needsSetup && (
          <div className="mb-6">
            <TextPasteAnalyzer
              onPatientsConfirmed={(patients) => {
                if (patients.length === 1) {
                  const p = patients[0];
                  setName(p.name);
                  if (p.bed) setBed(p.bed);
                  if (p.diagnosis) setMainDiagnosis(p.diagnosis);
                  if (p.insurance) setInsuranceProvider(p.insurance);
                  if (p.priority && ['critical', 'high', 'medium', 'low'].includes(p.priority)) {
                    setPriority(p.priority as any);
                  }
                  setShowTextPaste(false);
                  toast.success(`Dados de ${p.name} preenchidos. Revise e salve.`);
                } else if (patients.length > 1) {
                  setShowTextPaste(false);
                  handleBatchSave(patients);
                }
              }}
              onCancel={() => setShowTextPaste(false)}
            />
          </div>
        )}

        {/* Patient form - only show when setup is complete */}
        {!needsSetup && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Duplicate Warning */}
            {showDuplicateWarning && duplicates.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <CardTitle className="text-base text-amber-800">Possível duplicata encontrada</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {duplicates.map((dup) => (
                    <div key={dup.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <div>
                        <p className="font-medium">{dup.name}</p>
                        <p className="text-sm text-muted-foreground">CPF: {dup.cpf || "Não informado"}</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => useDuplicate(dup.id)}
                      >
                        Usar este
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowDuplicateWarning(false)}
                  >
                    Ignorar e continuar
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Patient Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Dados do Paciente</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="name"
                      placeholder="Digite o nome do paciente"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant={isRecording && recordingField === 'name' ? "destructive" : "outline"}
                      size="icon"
                      onClick={() => handleVoiceInput('name')}
                      title="Ditar nome por voz"
                    >
                      {isRecording && recordingField === 'name' ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admission Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Internação</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospital">Hospital *</Label>
                    <Select value={hospitalId} onValueChange={setHospitalId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals.map(h => (
                          <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team">Equipe *</Label>
                    <Select value={teamId} onValueChange={setTeamId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(t => (
                          <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bed">Leito *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bed"
                        placeholder="Ex: UTI-01"
                        value={bed}
                        onChange={(e) => setBed(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant={isRecording && recordingField === 'bed' ? "destructive" : "outline"}
                        size="icon"
                        onClick={() => handleVoiceInput('bed')}
                        title="Ditar leito por voz"
                      >
                        {isRecording && recordingField === 'bed' ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
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

                <InsuranceSelector
                  value={insuranceProvider}
                  onChange={setInsuranceProvider}
                  label="Convênio / Plano de Saúde"
                  placeholder="Selecione o convênio"
                />
              </CardContent>
            </Card>

            {/* Clinical Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Dados Clínicos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CID10Search
                  value={mainDiagnosis}
                  onChange={setMainDiagnosis}
                  label="Diagnóstico principal (CID-10)"
                  placeholder="Digite o código CID ou nome da doença..."
                  showVoiceButton={true}
                />
                <p className="text-xs text-muted-foreground">
                  Digite o código CID (ex: J18.9) ou o nome da doença (ex: pneumonia) para buscar
                </p>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setLocation("/dashboard")}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Cadastrar e Evoluir
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
