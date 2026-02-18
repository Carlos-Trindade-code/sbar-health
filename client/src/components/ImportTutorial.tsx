import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Camera,
  Mic,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Eye,
  Save,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

interface ImportTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const tutorialSteps = [
  {
    id: 1,
    title: "Escolha o Método de Entrada",
    description: "Você pode cadastrar pacientes de 3 formas diferentes. Escolha a mais conveniente para você:",
    icon: Lightbulb,
    options: [
      {
        icon: FileText,
        label: "Documento",
        description: "Upload de PDF ou planilha com lista de pacientes",
        highlight: "Ideal para listas grandes"
      },
      {
        icon: Camera,
        label: "Foto",
        description: "Tire foto de uma ficha ou prontuário",
        highlight: "Rápido e prático"
      },
      {
        icon: Mic,
        label: "Áudio",
        description: "Fale os dados do paciente",
        highlight: "Mãos livres"
      }
    ],
    tip: "Dica: Para equipes com muitos pacientes, a importação por documento é a mais eficiente!"
  },
  {
    id: 2,
    title: "Faça o Upload do Arquivo",
    description: "Arraste o arquivo para a área indicada ou clique para selecionar. Formatos aceitos: PDF, JPG, PNG, Excel.",
    icon: Upload,
    animation: "pulse",
    tip: "Dica: Fotos de fichas funcionam melhor com boa iluminação e texto legível."
  },
  {
    id: 3,
    title: "Revise os Dados Detectados",
    description: "Nossa IA analisa o documento e extrai automaticamente os dados dos pacientes. Revise cada um antes de salvar.",
    icon: Eye,
    features: [
      { label: "Nome", description: "Verificado automaticamente" },
      { label: "Diagnóstico", description: "Com código CID-10 sugerido" },
      { label: "Leito", description: "Extraído do documento" },
      { label: "Convênio", description: "Detectado se disponível" }
    ],
    tip: "Importante: Você pode editar qualquer campo antes de salvar. Nada é salvo automaticamente!"
  },
  {
    id: 4,
    title: "Confirme e Salve",
    description: "Selecione os pacientes que deseja cadastrar e clique em 'Importar Selecionados'. Você tem controle total!",
    icon: Save,
    actions: [
      { icon: CheckCircle, label: "Selecionar", description: "Marque os pacientes corretos" },
      { icon: Eye, label: "Editar", description: "Corrija dados se necessário" },
      { icon: X, label: "Ignorar", description: "Desmarque pacientes incorretos" }
    ],
    tip: "Lembre-se: Você sempre pode cancelar e começar novamente. Sem pressão!"
  }
];

export function ImportTutorial({ onComplete, onSkip, currentStep = 0, onStepChange }: ImportTutorialProps) {
  const [step, setStep] = useState(currentStep);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { t } = useTranslation();

  const currentTutorialStep = tutorialSteps[step];
  const isLastStep = step === tutorialSteps.length - 1;
  const isFirstStep = step === 0;

  const handleNext = () => {
    if (isLastStep) {
      if (dontShowAgain) {
        localStorage.setItem("sbar_import_tutorial_completed", "true");
      }
      onComplete();
    } else {
      const newStep = step + 1;
      setStep(newStep);
      onStepChange?.(newStep);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      const newStep = step - 1;
      setStep(newStep);
      onStepChange?.(newStep);
    }
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem("sbar_import_tutorial_completed", "true");
    }
    onSkip();
  };

  const Icon = currentTutorialStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">
                  Passo {step + 1} de {tutorialSteps.length}
                </Badge>
                <h2 className="text-xl font-semibold">{currentTutorialStep.title}</h2>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Description */}
          <p className="text-muted-foreground mb-6">{currentTutorialStep.description}</p>

          {/* Step-specific content */}
          {step === 0 && currentTutorialStep.options && (
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {currentTutorialStep.options.map((option, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border-2 border-dashed border-muted hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <option.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">{option.label}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {option.highlight}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="mb-6">
              <div className={cn(
                "border-2 border-dashed border-primary/30 rounded-lg p-8 text-center",
                "bg-primary/5 animate-pulse"
              )}>
                <Upload className="w-12 h-12 mx-auto mb-4 text-primary/50" />
                <p className="text-muted-foreground">
                  Arraste seu arquivo aqui ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, JPG, PNG, Excel (máx. 10MB)
                </p>
              </div>
            </div>
          )}

          {step === 2 && currentTutorialStep.features && (
            <div className="mb-6">
              <div className="grid gap-3 md:grid-cols-2">
                {currentTutorialStep.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                      IA com {">"}95% de precisão
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Nossa IA foi treinada com milhares de documentos médicos para extrair dados com alta precisão.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && currentTutorialStep.actions && (
            <div className="mb-6">
              <div className="space-y-3">
                {currentTutorialStep.actions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      index === 0 && "bg-green-100 dark:bg-green-900/30",
                      index === 1 && "bg-blue-100 dark:bg-blue-900/30",
                      index === 2 && "bg-gray-100 dark:bg-gray-800"
                    )}>
                      <action.icon className={cn(
                        "w-5 h-5",
                        index === 0 && "text-green-600 dark:text-green-400",
                        index === 1 && "text-blue-600 dark:text-blue-400",
                        index === 2 && "text-gray-600 dark:text-gray-400"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium">{action.label}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tip */}
          {currentTutorialStep.tip && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {currentTutorialStep.tip}
                </p>
              </div>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setStep(index);
                  onStepChange?.(index);
                }}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  index === step
                    ? "bg-primary w-6"
                    : index < step
                    ? "bg-primary/50"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Don't show again */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-muted"
            />
            <label htmlFor="dontShowAgain" className="text-sm text-muted-foreground cursor-pointer">
              Não mostrar este tutorial novamente
            </label>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={isFirstStep}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <Button onClick={handleNext}>
              {isLastStep ? (
                <>
                  Começar a Importar
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to check if tutorial should be shown
export function useImportTutorial() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("sbar_import_tutorial_completed");
    if (!completed) {
      setShouldShow(true);
    }
  }, []);

  const resetTutorial = () => {
    localStorage.removeItem("sbar_import_tutorial_completed");
    setShouldShow(true);
  };

  const completeTutorial = () => {
    localStorage.setItem("sbar_import_tutorial_completed", "true");
    setShouldShow(false);
  };

  return { shouldShow, setShouldShow, resetTutorial, completeTutorial };
}

export default ImportTutorial;
