import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  Brain, 
  Clock, 
  FileText, 
  Mic, 
  MicOff, 
  Save,
  Send,
  Loader2,
  Lock,
  History,
  Activity,
  Thermometer,
  Heart,
  Wind,
  Languages
} from "lucide-react";
import { TranslateButton, useTranslationState } from "@/components/TranslateButton";
import { EvolutionCard } from "@/components/EvolutionCard";
import { EvolutionConfirmation } from "@/components/SBARConfirmation";
import { useLocation, useParams } from "wouter";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export default function Evolution() {
  const params = useParams<{ admissionId: string }>();
  const admissionId = parseInt(params.admissionId || "0");
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  
  // SBAR Form state
  const [situation, setSituation] = useState("");
  const [background, setBackground] = useState("");
  const [assessment, setAssessment] = useState("");
  const [recommendation, setRecommendation] = useState("");
  
  // Vital signs
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  
  // UI state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Detect ?tab=ai query param to open AI tab directly
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const initialTab = searchParams.get('tab') === 'ai' ? 'ai' : 'sbar';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Round mode: list of admission IDs to evolve sequentially
  const roundIds = (searchParams.get('round') || '').split(',').filter(Boolean).map(Number);
  const currentRoundIndex = roundIds.indexOf(admissionId);
  const isInRound = roundIds.length > 1 && currentRoundIndex >= 0;
  const nextRoundId = isInRound && currentRoundIndex < roundIds.length - 1 ? roundIds[currentRoundIndex + 1] : null;
  const roundProgress = isInRound ? `${currentRoundIndex + 1}/${roundIds.length}` : '';
  
  // Queries
  const { data: admission, isLoading: loadingAdmission } = trpc.admissions.get.useQuery(
    { id: admissionId },
    { enabled: admissionId > 0 }
  );
  
  const { data: patient } = trpc.patients.get.useQuery(
    { id: admission?.patientId || 0 },
    { enabled: !!admission?.patientId }
  );
  
  const { data: evolutions = [] } = trpc.evolutions.byAdmission.useQuery(
    { admissionId },
    { enabled: admissionId > 0 }
  );
  
  const { data: draft } = trpc.evolutions.getDraft.useQuery(
    { admissionId },
    { enabled: admissionId > 0 }
  );

  const { data: firstEvolution } = trpc.evolutions.firstByAdmission.useQuery(
    { admissionId },
    { enabled: admissionId > 0 }
  );

  // Get the LATEST evolution for pre-filling S/B (most clinically relevant)
  const latestEvolution = evolutions.length > 0 ? evolutions[0] : null;
  
  const { data: aiPrediction } = trpc.ai.getLatestPrediction.useQuery(
    { admissionId, type: "discharge" },
    { enabled: admissionId > 0 }
  );
  
  // Mutations
  const saveDraft = trpc.evolutions.saveDraft.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
      setIsDirty(false);
    }
  });
  
  const finalize = trpc.evolutions.finalize.useMutation({
    onSuccess: () => {
      utils.evolutions.byAdmission.invalidate({ admissionId });
      utils.evolutions.getDraft.invalidate({ admissionId });
      utils.evolutions.todayCount.invalidate();
      
      if (nextRoundId) {
        const remainingIds = roundIds.join(',');
        toast.success(`Evolução salva! Próximo paciente (${currentRoundIndex + 2}/${roundIds.length})...`);
        setTimeout(() => {
          setLocation(`/evolution/${nextRoundId}?round=${remainingIds}`);
        }, 600);
      } else if (isInRound) {
        toast.success("Ronda finalizada! Todos os pacientes evoluídos.");
        setTimeout(() => setLocation("/dashboard"), 800);
      } else {
        toast.success("Evolução salva com sucesso! Retornando ao painel...");
        setTimeout(() => setLocation("/dashboard"), 800);
      }
    },
    onError: (error) => {
      toast.error("Erro ao salvar evolução: " + error.message);
    }
  });
  
  const predictDischarge = trpc.ai.predictDischarge.useMutation({
    onSuccess: (data) => {
      toast.success("Análise IA concluída!");
      utils.ai.getLatestPrediction.invalidate({ admissionId, type: "discharge" });
    },
    onError: (error) => {
      toast.error("Erro na análise IA: " + error.message);
    }
  });

  // Reset ALL form fields when admissionId changes (critical for round mode)
  useEffect(() => {
    setSituation("");
    setBackground("");
    setAssessment("");
    setRecommendation("");
    setTemperature("");
    setHeartRate("");
    setBloodPressure("");
    setRespiratoryRate("");
    setOxygenSaturation("");
    setIsDirty(false);
    setLastSaved(null);
  }, [admissionId]);

  // Load draft or pre-fill from LATEST evolution of THIS patient
  useEffect(() => {
    if (draft) {
      setSituation(draft.situation || "");
      setBackground(draft.background || "");
      setAssessment(draft.assessment || "");
      setRecommendation(draft.recommendation || "");
      if (draft.vitalSigns) {
        const vs = draft.vitalSigns as any;
        setTemperature(vs.temperature?.toString() || "");
        setHeartRate(vs.heartRate?.toString() || "");
        setBloodPressure(vs.bloodPressure || "");
        setRespiratoryRate(vs.respiratoryRate?.toString() || "");
        setOxygenSaturation(vs.oxygenSaturation?.toString() || "");
      }
      setLastSaved(draft.draftSavedAt ? new Date(draft.draftSavedAt) : null);
    } else if (latestEvolution) {
      // Pre-fill S and B from LATEST evolution of THIS patient (most clinically relevant)
      setSituation((latestEvolution as any).situation || "");
      setBackground((latestEvolution as any).background || "");
    } else if (firstEvolution) {
      // Fallback to first evolution if no latest
      setSituation(firstEvolution.situation || "");
      setBackground(firstEvolution.background || "");
    }
  }, [draft, latestEvolution, firstEvolution, admissionId]);

  // Auto-save draft
  useEffect(() => {
    if (isDirty && admissionId > 0) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      autoSaveRef.current = setTimeout(() => {
        saveDraft.mutate({
          admissionId,
          situation,
          background,
          assessment,
          recommendation,
          vitalSigns: {
            temperature: temperature ? parseFloat(temperature) : undefined,
            heartRate: heartRate ? parseInt(heartRate) : undefined,
            bloodPressure: bloodPressure || undefined,
            respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : undefined,
            oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation) : undefined,
          }
        });
      }, 3000);
    }
    
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [isDirty, situation, background, assessment, recommendation, temperature, heartRate, bloodPressure, respiratoryRate, oxygenSaturation, admissionId]);

  const handleFieldChange = useCallback((setter: (v: string) => void) => {
    return (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setter(e.target.value);
      setIsDirty(true);
    };
  }, []);

  const handleVoiceInput = useCallback((field: string) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Reconhecimento de voz não suportado");
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
        case 'situation':
          setSituation(prev => prev + (prev ? ' ' : '') + transcript);
          break;
        case 'background':
          setBackground(prev => prev + (prev ? ' ' : '') + transcript);
          break;
        case 'assessment':
          setAssessment(prev => prev + (prev ? ' ' : '') + transcript);
          break;
        case 'recommendation':
          setRecommendation(prev => prev + (prev ? ' ' : '') + transcript);
          break;
      }
      setIsDirty(true);
    };

    recognition.onerror = () => {
      toast.error("Erro no reconhecimento de voz");
    };

    recognition.onend = () => {
      setIsRecording(false);
      setRecordingField(null);
    };

    recognition.start();
  }, []);

  const handleFinalize = () => {
    if (!situation.trim() || !assessment.trim() || !recommendation.trim()) {
      toast.error("Preencha pelo menos Situação, Avaliação e Recomendação");
      return;
    }
    // Show confirmation dialog instead of finalizing directly
    setShowConfirmation(true);
  };

  const handleConfirmedFinalize = () => {
    finalize.mutate({
      admissionId,
      situation,
      background,
      assessment,
      recommendation,
      vitalSigns: {
        temperature: temperature ? parseFloat(temperature) : undefined,
        heartRate: heartRate ? parseInt(heartRate) : undefined,
        bloodPressure: bloodPressure || undefined,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : undefined,
        oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation) : undefined,
      }
    });
    setShowConfirmation(false);
  };

  const handleAiAnalysis = () => {
    if (evolutions.length === 0 && !situation) {
      toast.error("Adicione pelo menos uma evolução antes da análise IA");
      return;
    }
    predictDischarge.mutate({ admissionId });
  };

  if (loadingAdmission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold">{patient?.name || "Paciente"}</h1>
                {isInRound && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    Ronda {roundProgress}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Leito {admission?.bed} • {admission?.mainDiagnosis || "Sem diagnóstico"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Save className="w-3 h-3" />
                {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {isDirty && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Não salvo
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Evolution Confirmation Dialog */}
      <EvolutionConfirmation
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmedFinalize}
        isLoading={finalize.isPending}
        data={{
          patientName: patient?.name,
          bed: admission?.bed,
          diagnosis: admission?.mainDiagnosis || undefined,
          situation,
          background,
          assessment,
          recommendation,
          vitalSigns: {
            temperature: temperature || undefined,
            heartRate: heartRate || undefined,
            bloodPressure: bloodPressure || undefined,
            respiratoryRate: respiratoryRate || undefined,
            oxygenSaturation: oxygenSaturation || undefined,
          },
        }}
      />

      <main className="container py-6 space-y-6 max-w-3xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sbar">
              <FileText className="w-4 h-4 mr-2" />
              SBAR
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="w-4 h-4 mr-2" />
              IA
            </TabsTrigger>
          </TabsList>

          {/* SBAR Form */}
          <TabsContent value="sbar" className="space-y-4 mt-4">
            {/* Vital Signs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Sinais Vitais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      Temp
                    </Label>
                    <Input
                      placeholder="36.5"
                      value={temperature}
                      onChange={handleFieldChange(setTemperature)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      FC
                    </Label>
                    <Input
                      placeholder="80"
                      value={heartRate}
                      onChange={handleFieldChange(setHeartRate)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">PA</Label>
                    <Input
                      placeholder="120/80"
                      value={bloodPressure}
                      onChange={handleFieldChange(setBloodPressure)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Wind className="w-3 h-3" />
                      FR
                    </Label>
                    <Input
                      placeholder="18"
                      value={respiratoryRate}
                      onChange={handleFieldChange(setRespiratoryRate)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SpO2</Label>
                    <Input
                      placeholder="98"
                      value={oxygenSaturation}
                      onChange={handleFieldChange(setOxygenSaturation)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Situation */}
            <Card className="sbar-section sbar-s">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-primary">S - Situação</CardTitle>
                  <Button
                    type="button"
                    variant={isRecording && recordingField === 'situation' ? "destructive" : "ghost"}
                    size="icon"
                    onClick={() => handleVoiceInput('situation')}
                  >
                    {isRecording && recordingField === 'situation' ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <CardDescription>O que está acontecendo agora?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Descreva a situação atual do paciente..."
                  value={situation}
                  onChange={handleFieldChange(setSituation)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Background */}
            <Card className="sbar-section sbar-b">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg" style={{ color: 'oklch(0.45 0.05 250)' }}>B - Background</CardTitle>
                  <Button
                    type="button"
                    variant={isRecording && recordingField === 'background' ? "destructive" : "ghost"}
                    size="icon"
                    onClick={() => handleVoiceInput('background')}
                  >
                    {isRecording && recordingField === 'background' ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <CardDescription>Qual é o contexto clínico?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="História relevante, diagnósticos, tratamentos..."
                  value={background}
                  onChange={handleFieldChange(setBackground)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Assessment */}
            <Card className="sbar-section sbar-a">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg" style={{ color: 'oklch(0.75 0.15 85)' }}>A - Avaliação</CardTitle>
                  <Button
                    type="button"
                    variant={isRecording && recordingField === 'assessment' ? "destructive" : "ghost"}
                    size="icon"
                    onClick={() => handleVoiceInput('assessment')}
                  >
                    {isRecording && recordingField === 'assessment' ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <CardDescription>Qual é sua avaliação?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Sua análise da situação..."
                  value={assessment}
                  onChange={handleFieldChange(setAssessment)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Recommendation */}
            <Card className="sbar-section sbar-r">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg" style={{ color: 'oklch(0.65 0.18 145)' }}>R - Recomendação</CardTitle>
                  <Button
                    type="button"
                    variant={isRecording && recordingField === 'recommendation' ? "destructive" : "ghost"}
                    size="icon"
                    onClick={() => handleVoiceInput('recommendation')}
                  >
                    {isRecording && recordingField === 'recommendation' ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <CardDescription>O que você recomenda?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Plano de ação, solicitações..."
                  value={recommendation}
                  onChange={handleFieldChange(setRecommendation)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4 mt-4">
            {evolutions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <History className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">Nenhuma evolução anterior</p>
                  <p className="text-sm text-muted-foreground">Esta será a primeira evolução</p>
                </CardContent>
              </Card>
            ) : (
              evolutions.map((evo: any) => (
                <EvolutionCard key={evo.id} evolution={evo} showTranslation={true} />
              ))
            )}
          </TabsContent>

          {/* AI Analysis */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Análise Preditiva
                </CardTitle>
                <CardDescription>
                  IA analisa evoluções para prever alta e prognóstico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleAiAnalysis}
                  disabled={predictDischarge.isPending}
                  className="w-full"
                >
                  {predictDischarge.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Gerar Análise IA
                    </>
                  )}
                </Button>

                {aiPrediction && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-primary/5 border-0">
                        <CardContent className="pt-4">
                          <p className="text-3xl font-bold text-primary">
                            {aiPrediction.predictedValue.dischargeProbability3Days}%
                          </p>
                          <p className="text-sm text-muted-foreground">Prob. alta em 3 dias</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-blue-500/5 border-0">
                        <CardContent className="pt-4">
                          <p className="text-3xl font-bold text-blue-600">
                            {aiPrediction.predictedValue.estimatedDaysRemaining}
                          </p>
                          <p className="text-sm text-muted-foreground">Dias estimados</p>
                        </CardContent>
                      </Card>
                    </div>

                    {aiPrediction.predictedValue.factors && (
                      <div>
                        <p className="font-medium mb-2">Fatores considerados:</p>
                        <ul className="space-y-1">
                          {aiPrediction.predictedValue.factors.map((f: any, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <span className={`w-2 h-2 rounded-full ${
                                f.impact === 'positive' ? 'bg-green-500' :
                                f.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                              }`} />
                              {f.factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiPrediction.predictedValue.recommendations && (
                      <div>
                        <p className="font-medium mb-2">Recomendações:</p>
                        <ul className="space-y-1">
                          {aiPrediction.predictedValue.recommendations.map((r: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground">• {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-bottom">
        <div className="container max-w-3xl flex gap-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              saveDraft.mutate({
                admissionId,
                situation,
                background,
                assessment,
                recommendation,
              });
              toast.success("Rascunho salvo!");
            }}
            disabled={saveDraft.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button 
            className="flex-1"
            onClick={handleFinalize}
            disabled={finalize.isPending}
          >
            {finalize.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Finalizar Evolução
          </Button>
        </div>
      </div>
    </div>
  );
}
