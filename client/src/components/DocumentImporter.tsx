import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Camera, 
  Loader2, 
  Check, 
  X, 
  Edit2, 
  AlertCircle,
  AlertTriangle,
  Users,
  Building2,
  ChevronRight,
  Trash2,
  Copy,
  UserCheck,
  UserX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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

interface DuplicateMatch {
  inputName: string;
  matches: Array<{ id: number; name: string; cpf: string | null; birthDate: Date | null }>;
}

interface DocumentImporterProps {
  onPatientsImported: (patients: DetectedPatient[], hospitalId?: number, teamId?: number) => void;
  onClose: () => void;
  preSelectedHospitalId?: string;
  preSelectedTeamId?: string;
}

export function DocumentImporter({ onPatientsImported, onClose, preSelectedHospitalId, preSelectedTeamId }: DocumentImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<"upload" | "processing" | "review" | "duplicates" | "assign" | "confirm">("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detectedPatients, setDetectedPatients] = useState<DetectedPatient[]>([]);
  const [editingPatient, setEditingPatient] = useState<DetectedPatient | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  
  // Duplicates
  const [duplicateResults, setDuplicateResults] = useState<DuplicateMatch[]>([]);
  
  // Hospital/Team assignment
  const [selectedHospitalId, setSelectedHospitalId] = useState(preSelectedHospitalId || "");
  const [selectedTeamId, setSelectedTeamId] = useState(preSelectedTeamId || "");

  const { data: hospitals = [] } = trpc.hospitals.list.useQuery();
  const { data: teams = [] } = trpc.teams.list.useQuery();

  const analyzeDocument = trpc.patients.analyzeDocument.useMutation();
  const checkBatchDuplicates = trpc.patients.checkBatchDuplicates.useMutation();

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadedFile(file);
    
    // Create preview for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    
    // Start processing
    setStep("processing");
    setIsProcessing(true);
    
    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Send to backend for analysis
      const result = await analyzeDocument.mutateAsync({
        fileData: base64,
        fileName: file.name,
        fileType: file.type,
      });
      
      // Map results to DetectedPatient format
      const patients: DetectedPatient[] = result.patients.map((p: { name?: string; age?: string; diagnosis?: string; diagnosisCode?: string; bed?: string; insurance?: string; situation?: string; background?: string; confidence?: number }, index: number) => ({
        id: `detected-${index}-${Date.now()}`,
        name: p.name || "",
        age: p.age || "",
        diagnosis: p.diagnosis || "",
        diagnosisCode: p.diagnosisCode || "",
        bed: p.bed || "",
        insurance: p.insurance || "",
        situation: p.situation || "",
        background: p.background || "",
        confidence: p.confidence || 0,
        selected: (p.confidence ?? 0) >= 70, // Auto-select high confidence
        editing: false,
      }));
      
      setDetectedPatients(patients);
      setStep("review");
    } catch (error) {
      console.error("Error analyzing document:", error);
      toast.error("Erro ao analisar documento. Tente novamente.");
      setStep("upload");
    } finally {
      setIsProcessing(false);
    }
  }, [analyzeDocument]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const togglePatientSelection = (patientId: string) => {
    setDetectedPatients(prev => 
      prev.map(p => 
        p.id === patientId ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const startEditingPatient = (patient: DetectedPatient) => {
    setEditingPatient({ ...patient });
  };

  const saveEditedPatient = () => {
    if (!editingPatient) return;
    
    setDetectedPatients(prev =>
      prev.map(p =>
        p.id === editingPatient.id ? { ...editingPatient, editing: false } : p
      )
    );
    setEditingPatient(null);
  };

  const removePatient = (patientId: string) => {
    setDetectedPatients(prev => prev.filter(p => p.id !== patientId));
  };

  const selectAll = () => {
    setDetectedPatients(prev => prev.map(p => ({ ...p, selected: true })));
  };

  const deselectAll = () => {
    setDetectedPatients(prev => prev.map(p => ({ ...p, selected: false })));
  };

  // After review, check for duplicates before going to assign
  const checkDuplicates = async () => {
    const selectedPatients = detectedPatients.filter(p => p.selected);
    if (selectedPatients.length === 0) {
      toast.error("Selecione pelo menos um paciente para importar.");
      return;
    }
    
    setIsCheckingDuplicates(true);
    
    try {
      const names = selectedPatients.map(p => p.name).filter(n => n.length >= 3);
      const results = await checkBatchDuplicates.mutateAsync({ names });
      
      setDuplicateResults(results);
      
      if (results.length > 0) {
        // Found duplicates - show the duplicates step
        setStep("duplicates");
      } else {
        // No duplicates - skip to assign
        setStep("assign");
      }
    } catch (error) {
      console.error("Error checking duplicates:", error);
      // On error, proceed to assign anyway
      toast.info("Não foi possível verificar duplicados. Prosseguindo...");
      setStep("assign");
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const isDuplicate = (patientName: string) => {
    return duplicateResults.some(d => 
      d.inputName.toLowerCase() === patientName.trim().toLowerCase()
    );
  };

  const getDuplicateMatches = (patientName: string) => {
    const result = duplicateResults.find(d => 
      d.inputName.toLowerCase() === patientName.trim().toLowerCase()
    );
    return result?.matches || [];
  };

  const deselectAllDuplicates = () => {
    const duplicateNames = new Set(duplicateResults.map(d => d.inputName.toLowerCase()));
    setDetectedPatients(prev => 
      prev.map(p => 
        duplicateNames.has(p.name.trim().toLowerCase()) ? { ...p, selected: false } : p
      )
    );
  };

  const goToAssignFromDuplicates = () => {
    setStep("assign");
  };

  const goToConfirm = () => {
    if (!selectedHospitalId || !selectedTeamId) {
      toast.error("Selecione hospital e equipe antes de continuar.");
      return;
    }
    setStep("confirm");
  };

  const confirmImport = () => {
    const selectedPatients = detectedPatients.filter(p => p.selected);
    if (selectedPatients.length === 0) {
      toast.error("Selecione pelo menos um paciente para importar.");
      return;
    }
    
    const hId = selectedHospitalId ? parseInt(selectedHospitalId) : undefined;
    const tId = selectedTeamId ? parseInt(selectedTeamId) : undefined;
    
    onPatientsImported(selectedPatients, hId, tId);
    toast.success(`${selectedPatients.length} paciente(s) importado(s) com sucesso!`);
    onClose();
  };

  const getSelectedHospitalName = () => {
    const h = hospitals.find((h: any) => String(h.id) === selectedHospitalId);
    return h ? (h as any).name : "Não selecionado";
  };

  const getSelectedTeamName = () => {
    const t = teams.find((t: any) => String(t.id) === selectedTeamId);
    return t ? (t as any).name : "Não selecionado";
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return <Badge className="bg-green-500">Alta ({confidence}%)</Badge>;
    } else if (confidence >= 70) {
      return <Badge className="bg-yellow-500">Média ({confidence}%)</Badge>;
    } else {
      return <Badge className="bg-red-500">Baixa ({confidence}%)</Badge>;
    }
  };

  const selectedCount = detectedPatients.filter(p => p.selected).length;
  const duplicateSelectedCount = detectedPatients.filter(p => p.selected && isDuplicate(p.name)).length;

  // Step progress indicator
  const steps = [
    { key: "upload", label: "Upload" },
    { key: "review", label: "Revisão" },
    { key: "duplicates", label: "Duplicados" },
    { key: "assign", label: "Vincular" },
    { key: "confirm", label: "Confirmar" },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Importar Pacientes de Documento
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Faça upload de um PDF ou foto com lista de pacientes"}
            {step === "processing" && "Analisando documento..."}
            {step === "review" && `${detectedPatients.length} paciente(s) detectado(s). Revise antes de importar.`}
            {step === "duplicates" && `${duplicateResults.length} possível(is) duplicata(s) encontrada(s). Revise antes de continuar.`}
            {step === "assign" && `Vincule os ${selectedCount} paciente(s) a um hospital e equipe`}
            {step === "confirm" && "Confirme os dados abaixo antes de importar"}
          </DialogDescription>
        </DialogHeader>

        {/* Step progress bar */}
        {step !== "upload" && step !== "processing" && (
          <div className="flex items-center gap-1 px-1">
            {steps.filter(s => s.key !== "upload").map((s, idx) => {
              const sIdx = steps.findIndex(st => st.key === s.key);
              const isActive = sIdx === currentStepIndex;
              const isCompleted = sIdx < currentStepIndex;
              // Skip duplicates step in progress if no duplicates found
              if (s.key === "duplicates" && duplicateResults.length === 0 && !isActive) return null;
              return (
                <div key={s.key} className="flex items-center gap-1 flex-1">
                  <div className={cn(
                    "h-1.5 rounded-full flex-1 transition-colors",
                    isActive ? "bg-primary" : isCompleted ? "bg-primary/60" : "bg-muted"
                  )} />
                  <span className={cn(
                    "text-[10px] whitespace-nowrap",
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  )}>{s.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Arraste um arquivo aqui</p>
              <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
              <p className="text-xs text-muted-foreground mt-2">
                Suporta: PDF, JPG, PNG (máx. 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="w-4 h-4 mr-2" />
              Tirar Foto da Ficha
            </Button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>
        )}

        {/* Step 2: Processing */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Analisando documento...</p>
            <p className="text-sm text-muted-foreground">
              Extraindo dados dos pacientes com IA
            </p>
            {uploadedFile && (
              <p className="text-xs text-muted-foreground">
                Arquivo: {uploadedFile.name}
              </p>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === "review" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedCount} de {detectedPatients.length} selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Selecionar todos
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Desmarcar todos
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {detectedPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    patient.selected ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-transparent"
                  )}
                >
                  <Checkbox
                    checked={patient.selected}
                    onCheckedChange={() => togglePatientSelection(patient.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{patient.name}</span>
                      {getConfidenceBadge(patient.confidence)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                      {patient.age && <span>{patient.age}</span>}
                      {patient.bed && <span>Leito: {patient.bed}</span>}
                      {patient.diagnosisCode && (
                        <Badge variant="outline" className="text-xs">{patient.diagnosisCode}</Badge>
                      )}
                      {patient.diagnosis && <span className="truncate">{patient.diagnosis}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditingPatient(patient)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removePatient(patient.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3.5: Duplicates Check */}
        {step === "duplicates" && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-200">
                  {duplicateResults.length} possível(is) duplicata(s) detectada(s)
                </span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Os pacientes abaixo já podem existir no sistema. Revise e decida se deseja importá-los novamente ou desmarcá-los.
              </p>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {duplicateResults.map((dup) => {
                const patient = detectedPatients.find(p => p.name.trim().toLowerCase() === dup.inputName.toLowerCase());
                if (!patient) return null;
                
                return (
                  <div key={dup.inputName} className="rounded-lg border border-amber-200 dark:border-amber-800 overflow-hidden">
                    {/* Imported patient */}
                    <div className={cn(
                      "flex items-center gap-3 p-3",
                      patient.selected ? "bg-amber-50 dark:bg-amber-900/20" : "bg-muted/50"
                    )}>
                      <Checkbox
                        checked={patient.selected}
                        onCheckedChange={() => togglePatientSelection(patient.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Copy className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-medium">{patient.name}</span>
                          <Badge variant="outline" className="text-xs border-amber-400 text-amber-700 dark:text-amber-300">
                            Importando
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {patient.bed && <span>Leito: {patient.bed}</span>}
                          {patient.diagnosisCode && <span>{patient.diagnosisCode}</span>}
                        </div>
                      </div>
                      {patient.selected ? (
                        <Badge className="bg-amber-500 text-white text-xs">Será importado</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Desmarcado</Badge>
                      )}
                    </div>
                    
                    {/* Existing matches */}
                    <div className="border-t border-amber-200 dark:border-amber-800 bg-muted/30 px-3 py-2">
                      <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        Paciente(s) similar(es) já cadastrado(s):
                      </p>
                      {dup.matches.map((match) => (
                        <div key={match.id} className="flex items-center gap-2 text-sm py-1">
                          <span className="text-muted-foreground">•</span>
                          <span className="font-medium">{match.name}</span>
                          {match.cpf && <span className="text-xs text-muted-foreground">CPF: {match.cpf}</span>}
                          {match.birthDate && (
                            <span className="text-xs text-muted-foreground">
                              Nasc: {new Date(match.birthDate).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs ml-auto">ID #{match.id}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Non-duplicate patients summary */}
            {selectedCount - duplicateSelectedCount > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    {selectedCount - duplicateSelectedCount} paciente(s) sem duplicata serão importados normalmente.
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
                onClick={deselectAllDuplicates}
              >
                <UserX className="w-4 h-4 mr-1" />
                Desmarcar todos os duplicados
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Assign Hospital/Team */}
        {step === "assign" && (
          <div className="space-y-6">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">{selectedCount} paciente(s) selecionado(s)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Escolha o hospital e a equipe para vincular os pacientes importados.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4" />
                  Hospital
                </Label>
                {hospitals.length > 0 ? (
                  <Select value={selectedHospitalId} onValueChange={setSelectedHospitalId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((h: any) => (
                        <SelectItem key={h.id} value={String(h.id)}>
                          {h.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    Nenhum hospital cadastrado. Configure um hospital primeiro nas Configurações.
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  Equipe
                </Label>
                {teams.length > 0 ? (
                  <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((t: any) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name} {t.isPersonal ? "(Pessoal)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    Nenhuma equipe cadastrada. Configure uma equipe primeiro nas Configurações.
                  </p>
                )}
              </div>
            </div>

            {(!hospitals.length || !teams.length) && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Configuração necessária
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    Você precisa ter pelo menos um hospital e uma equipe configurados para importar pacientes. 
                    Vá em "Novo Paciente" para configurar.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Confirm */}
        {step === "confirm" && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">Resumo da Importação</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pacientes:</span>
                  <span className="font-medium">{selectedCount} paciente(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hospital:</span>
                  <span className="font-medium">{getSelectedHospitalName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Equipe:</span>
                  <span className="font-medium">{getSelectedTeamName()}</span>
                </div>
                {duplicateSelectedCount > 0 && (
                  <div className="flex justify-between text-amber-700 dark:text-amber-300">
                    <span>Possíveis duplicatas:</span>
                    <span className="font-medium">{duplicateSelectedCount} paciente(s)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {detectedPatients.filter(p => p.selected).map((patient, idx) => (
                <div key={patient.id} className={cn(
                  "flex items-center gap-2 text-sm p-2 rounded",
                  isDuplicate(patient.name) ? "bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800" : "bg-muted/50"
                )}>
                  <span className="text-muted-foreground w-6">{idx + 1}.</span>
                  <span className="font-medium flex-1">{patient.name}</span>
                  {patient.bed && <span className="text-muted-foreground">Leito: {patient.bed}</span>}
                  {patient.diagnosisCode && <Badge variant="outline" className="text-xs">{patient.diagnosisCode}</Badge>}
                  {isDuplicate(patient.name) && (
                    <Badge className="bg-amber-500 text-white text-xs">Duplicata</Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Ao confirmar, os pacientes serão cadastrados no sistema vinculados ao hospital e equipe acima. Deseja continuar?
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === "upload" && (
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          )}
          
          {step === "processing" && (
            <Button variant="outline" onClick={() => setStep("upload")}>
              Cancelar
            </Button>
          )}
          
          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Voltar
              </Button>
              <Button 
                onClick={checkDuplicates}
                disabled={selectedCount === 0 || isCheckingDuplicates}
              >
                {isCheckingDuplicates ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando duplicados...
                  </>
                ) : (
                  <>
                    Próximo: Verificar Duplicados
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </>
          )}

          {step === "duplicates" && (
            <>
              <Button variant="outline" onClick={() => setStep("review")}>
                Voltar
              </Button>
              <Button onClick={goToAssignFromDuplicates}>
                Próximo: Vincular Hospital
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {step === "assign" && (
            <>
              <Button variant="outline" onClick={() => {
                // Go back to duplicates if there were any, otherwise review
                if (duplicateResults.length > 0) {
                  setStep("duplicates");
                } else {
                  setStep("review");
                }
              }}>
                Voltar
              </Button>
              <Button 
                onClick={goToConfirm}
                disabled={!selectedHospitalId || !selectedTeamId}
              >
                Próximo: Confirmar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {step === "confirm" && (
            <>
              <Button variant="outline" onClick={() => setStep("assign")}>
                Voltar
              </Button>
              <Button 
                onClick={confirmImport}
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmar e Importar {selectedCount} paciente(s)
              </Button>
            </>
          )}
        </DialogFooter>

        {/* Edit Patient Dialog */}
        {editingPatient && (
          <Dialog open onOpenChange={() => setEditingPatient(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Paciente</DialogTitle>
                <DialogDescription>
                  Corrija as informações detectadas antes de importar
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Nome completo</Label>
                  <Input
                    value={editingPatient.name}
                    onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                    placeholder="Nome do paciente"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Idade</Label>
                    <Input
                      value={editingPatient.age}
                      onChange={(e) => setEditingPatient({ ...editingPatient, age: e.target.value })}
                      placeholder="Ex: 45 anos"
                    />
                  </div>
                  <div>
                    <Label>Leito</Label>
                    <Input
                      value={editingPatient.bed}
                      onChange={(e) => setEditingPatient({ ...editingPatient, bed: e.target.value })}
                      placeholder="Ex: 201-A"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Diagnóstico (descrição)</Label>
                  <Input
                    value={editingPatient.diagnosis}
                    onChange={(e) => setEditingPatient({ ...editingPatient, diagnosis: e.target.value })}
                    placeholder="Ex: Pneumonia adquirida na comunidade"
                  />
                </div>
                
                <div>
                  <Label>Código CID-10</Label>
                  <Input
                    value={editingPatient.diagnosisCode}
                    onChange={(e) => setEditingPatient({ ...editingPatient, diagnosisCode: e.target.value.toUpperCase() })}
                    placeholder="Ex: J18.9"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formato: Letra + números (ex: J18.9, M54.5, I10)
                  </p>
                </div>
                
                <div>
                  <Label>Convênio</Label>
                  <Input
                    value={editingPatient.insurance}
                    onChange={(e) => setEditingPatient({ ...editingPatient, insurance: e.target.value })}
                    placeholder="Ex: Unimed, Particular"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingPatient(null)}>
                  Cancelar
                </Button>
                <Button onClick={saveEditedPatient}>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

export default DocumentImporter;
