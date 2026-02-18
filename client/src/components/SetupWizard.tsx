import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HospitalSearch } from "@/components/HospitalSearch";
import { 
  Building2, Users, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Plus, 
  Stethoscope, User, Sparkles, Zap, Target
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SetupWizardProps {
  /** What's missing: 'hospital', 'team', or 'both' */
  missingStep: "hospital" | "team" | "both";
  /** Called when setup is complete */
  onComplete: () => void;
  /** Optional: called when user wants to skip */
  onSkip?: () => void;
  /** Compact mode for inline display */
  compact?: boolean;
}

type WizardStep = "mode" | "hospital" | "team" | "done";

export function SetupWizard({ missingStep, onComplete, onSkip, compact = false }: SetupWizardProps) {
  // Mode selection
  const [useMode, setUseMode] = useState<"personal" | "team" | null>(null);
  
  // Current step in the wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    missingStep === "team" ? "team" : "mode"
  );
  
  // Hospital selection
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [selectedHospitalName, setSelectedHospitalName] = useState("");
  
  // New hospital form
  const [showNewHospitalForm, setShowNewHospitalForm] = useState(false);
  const [newHospitalName, setNewHospitalName] = useState("");
  const [newHospitalCity, setNewHospitalCity] = useState("");
  const [newHospitalState, setNewHospitalState] = useState("");
  const [newHospitalType, setNewHospitalType] = useState<"public" | "private" | "mixed">("private");
  
  // Team form
  const [teamName, setTeamName] = useState("");

  const utils = trpc.useUtils();
  
  const quickSetup = trpc.teams.quickSetup.useMutation({
    onSuccess: () => {
      toast.success("Configuração concluída! Agora você pode cadastrar pacientes.");
      utils.hospitals.list.invalidate();
      utils.teams.list.invalidate();
      utils.auth.me.invalidate();
      setCurrentStep("done");
      onComplete();
    },
    onError: (err) => {
      toast.error(`Erro na configuração: ${err.message}`);
    },
  });

  const createHospital = trpc.hospitals.create.useMutation({
    onSuccess: (data) => {
      toast.success("Hospital cadastrado!");
      setSelectedHospitalId(data.id);
      setSelectedHospitalName(newHospitalName);
      setShowNewHospitalForm(false);
      utils.hospitals.list.invalidate();
      
      // If personal mode, complete setup immediately
      if (useMode === "personal") {
        quickSetup.mutate({
          mode: "personal",
          hospitalId: data.id,
        });
      } else {
        setCurrentStep("team");
      }
    },
    onError: (err) => {
      toast.error(`Erro ao cadastrar hospital: ${err.message}`);
    },
  });

  const handleSelectMode = (mode: "personal" | "team") => {
    setUseMode(mode);
    if (missingStep === "team") {
      // Already has hospital, just need team
      if (mode === "personal") {
        // Auto-create personal team with existing hospital
        // We need a hospital ID - get from the list
        toast.info("Selecione o hospital para vincular.");
      }
      setCurrentStep("hospital");
    } else {
      setCurrentStep("hospital");
    }
  };

  const handleSelectHospital = (hospital: { id: number; name: string }) => {
    setSelectedHospitalId(hospital.id);
    setSelectedHospitalName(hospital.name);
    
    if (useMode === "personal") {
      // Complete setup immediately - personal mode doesn't need team name
      quickSetup.mutate({
        mode: "personal",
        hospitalId: hospital.id,
      });
    } else {
      // Go to team step
      setCurrentStep("team");
    }
  };

  const handleCreateNewHospital = (name?: string) => {
    setNewHospitalName(name || "");
    setShowNewHospitalForm(true);
  };

  const handleSubmitNewHospital = () => {
    if (!newHospitalName.trim()) {
      toast.error("Nome do hospital é obrigatório");
      return;
    }
    
    if (useMode === "personal") {
      // Use quickSetup to create hospital + personal team in one go
      quickSetup.mutate({
        mode: "personal",
        newHospitalName: newHospitalName.trim(),
        newHospitalCity: newHospitalCity || undefined,
        newHospitalState: newHospitalState || undefined,
        newHospitalType: newHospitalType,
      });
    } else {
      createHospital.mutate({
        name: newHospitalName.trim(),
        city: newHospitalCity || undefined,
        state: newHospitalState || undefined,
        type: newHospitalType,
      });
    }
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      toast.error("Nome da equipe é obrigatório");
      return;
    }
    
    quickSetup.mutate({
      mode: "team",
      hospitalId: selectedHospitalId || undefined,
      newHospitalName: !selectedHospitalId ? newHospitalName : undefined,
      newHospitalCity: !selectedHospitalId ? newHospitalCity : undefined,
      newHospitalState: !selectedHospitalId ? newHospitalState : undefined,
      newHospitalType: !selectedHospitalId ? newHospitalType : undefined,
      teamName: teamName.trim(),
    });
  };

  const isLoading = quickSetup.isPending || createHospital.isPending;

  const STATES = [
    "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
    "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
  ];

  // Step indicator
  const getSteps = () => {
    if (missingStep === "team") {
      return [
        { id: "hospital" as const, label: "Hospital", done: !!selectedHospitalId },
        ...(useMode === "team" ? [{ id: "team" as const, label: "Equipe", done: false }] : []),
      ];
    }
    return [
      { id: "mode" as const, label: "Modo", done: !!useMode },
      { id: "hospital" as const, label: "Hospital", done: !!selectedHospitalId },
      ...(useMode === "team" ? [{ id: "team" as const, label: "Equipe", done: false }] : []),
    ];
  };

  const steps = getSteps();

  return (
    <Card className={cn(
      "border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background shadow-lg",
      compact && "shadow-none border-0 bg-transparent"
    )}>
      <CardHeader className={cn(compact && "px-0 pt-0")}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          Configuração Rápida
        </CardTitle>
        <CardDescription className="text-base">
          {currentStep === "mode" && "Configure em 30 segundos para começar a usar."}
          {currentStep === "hospital" && (useMode === "personal" 
            ? "Selecione o hospital e pronto! Sua equipe pessoal será criada automaticamente."
            : "Selecione o hospital onde sua equipe trabalha."
          )}
          {currentStep === "team" && "Dê um nome para sua equipe. Você pode convidar colegas depois."}
          {currentStep === "done" && "Tudo pronto! Agora cadastre seus pacientes."}
        </CardDescription>
        
        {/* Step indicator */}
        {steps.length > 1 && currentStep !== "done" && (
          <div className="flex items-center gap-2 mt-3">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  currentStep === step.id 
                    ? "bg-primary text-primary-foreground" 
                    : step.done
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  {step.done ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : step.id === "mode" ? (
                    <Target className="h-3.5 w-3.5" />
                  ) : step.id === "hospital" ? (
                    <Building2 className="h-3.5 w-3.5" />
                  ) : (
                    <Users className="h-3.5 w-3.5" />
                  )}
                  {step.label}
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className={cn(compact && "px-0 pb-0")}>
        {/* MODE SELECTION STEP */}
        {currentStep === "mode" && (
          <div className="space-y-3">
            <button
              onClick={() => handleSelectMode("personal")}
              className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-transparent hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
            >
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 shrink-0 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-base">Uso Individual</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie seus pacientes de forma independente. Ideal para consultório, plantão ou home care.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-[10px]">
                    <Zap className="w-3 h-3 mr-0.5" />
                    Setup em 1 clique
                  </Badge>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectMode("team")}
              className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-transparent hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
            >
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 shrink-0 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-base">Uso em Equipe</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Compartilhe pacientes com colegas. Ideal para hospital, clínica ou residência médica.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-[10px]">Convide colegas depois</Badge>
                </div>
              </div>
            </button>
            
            <p className="text-xs text-muted-foreground text-center pt-2">
              Você pode mudar para equipe a qualquer momento nas Configurações.
            </p>
          </div>
        )}

        {/* HOSPITAL STEP */}
        {currentStep === "hospital" && !showNewHospitalForm && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Buscar hospital (base com 259+ hospitais brasileiros)
              </Label>
              <HospitalSearch
                onSelect={handleSelectHospital}
                onCreateNew={handleCreateNewHospital}
                selectedHospitalId={selectedHospitalId || undefined}
                placeholder="Digite o nome do hospital (ex: Mater Dei, Albert Einstein...)"
                showCreateOption={true}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Busque pelo nome do hospital. Se não encontrar, você pode cadastrar um novo.
              </p>
            </div>
            
            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Configurando...</span>
              </div>
            )}
            
            {useMode && (
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep("mode")}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
            )}
          </div>
        )}

        {/* NEW HOSPITAL FORM */}
        {currentStep === "hospital" && showNewHospitalForm && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => setShowNewHospitalForm(false)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar à busca
              </Button>
              <Badge variant="outline">Novo Hospital</Badge>
            </div>
            
            <div>
              <Label htmlFor="hospitalName">Nome do Hospital *</Label>
              <Input
                id="hospitalName"
                value={newHospitalName}
                onChange={(e) => setNewHospitalName(e.target.value)}
                placeholder="Ex: Hospital São Lucas"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hospitalCity">Cidade</Label>
                <Input
                  id="hospitalCity"
                  value={newHospitalCity}
                  onChange={(e) => setNewHospitalCity(e.target.value)}
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div>
                <Label htmlFor="hospitalState">Estado</Label>
                <Select value={newHospitalState} onValueChange={setNewHospitalState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Tipo</Label>
              <Select value={newHospitalType} onValueChange={(v) => setNewHospitalType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Privado</SelectItem>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="mixed">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleSubmitNewHospital} 
              disabled={isLoading || !newHospitalName.trim()}
              className="w-full"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Configurando...</>
              ) : useMode === "personal" ? (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Cadastrar e Começar</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" /> Cadastrar Hospital</>
              )}
            </Button>
          </div>
        )}

        {/* TEAM STEP */}
        {currentStep === "team" && (
          <div className="space-y-4">
            {selectedHospitalName && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Hospital: <strong>{selectedHospitalName}</strong></span>
              </div>
            )}
            
            <div>
              <Label htmlFor="teamName">Nome da Equipe *</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Ex: Equipe Clínica Médica, UTI Adulto..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Você pode convidar colegas para esta equipe depois nas Configurações.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep("hospital")}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
              <Button 
                onClick={handleCreateTeam} 
                disabled={isLoading || !teamName.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Criando...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Criar e Começar</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* DONE STEP */}
        {currentStep === "done" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-semibold text-lg">Tudo pronto!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Agora você pode cadastrar seus pacientes.
            </p>
          </div>
        )}

        {onSkip && currentStep !== "done" && (
          <div className="mt-4 text-center">
            <Button variant="link" size="sm" onClick={onSkip} className="text-muted-foreground">
              Configurar depois nas Configurações
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
