import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Users,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X,
  Rocket,
  Target,
  Zap,
  User,
} from "lucide-react";

interface OnboardingTourProps {
  isNewUser?: boolean;
  hasHospital?: boolean;
  hasTeam?: boolean;
  hasPatient?: boolean;
  onCreateHospital?: () => void;
  onCreateTeam?: () => void;
  onCreatePatient?: () => void;
  onComplete?: () => void;
}

export default function OnboardingTour({
  isNewUser = true,
  hasHospital = false,
  hasTeam = false,
  hasPatient = false,
  onCreateHospital,
  onCreateTeam,
  onCreatePatient,
  onComplete,
}: OnboardingTourProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onboardingDismissed = localStorage.getItem("sbar_onboarding_dismissed");
    if (onboardingDismissed) {
      setDismissed(true);
      return;
    }

    if (isNewUser && !hasHospital && !hasTeam && !hasPatient) {
      const timer = setTimeout(() => setShowWelcome(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isNewUser, hasHospital, hasTeam, hasPatient]);

  const handleDismiss = () => {
    localStorage.setItem("sbar_onboarding_dismissed", "true");
    setDismissed(true);
    setShowWelcome(false);
  };

  const handleStartSetup = () => {
    handleDismiss();
    // Redirect to NewPatient which has the SetupWizard integrated
    if (onCreatePatient) {
      onCreatePatient();
    }
  };

  // Compute steps for the floating card
  const steps = [
    { id: "setup", title: "Configurar hospital e equipe", completed: hasHospital && hasTeam },
    { id: "patient", title: "Cadastrar primeiro paciente", completed: hasPatient },
  ];

  const completedSteps = steps.filter((s) => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;
  const allCompleted = completedSteps === steps.length;

  if (dismissed && allCompleted) return null;

  return (
    <>
      {/* Welcome Modal - simplified, directs to NewPatient */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Rocket className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Bem-vindo ao SBAR Health!</DialogTitle>
            <DialogDescription className="text-base">
              Vamos configurar sua conta em menos de 1 minuto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
              <div className="p-2 rounded-full bg-primary/10 shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">1. Escolha seu hospital</p>
                <p className="text-xs text-muted-foreground">Busque na base com 259+ hospitais ou cadastre um novo</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
              <div className="p-2 rounded-full bg-primary/10 shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">2. Uso pessoal ou em equipe</p>
                <p className="text-xs text-muted-foreground">Escolha como quer usar. Pode mudar depois.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
              <div className="p-2 rounded-full bg-primary/10 shrink-0">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">3. Cadastre seu primeiro paciente</p>
                <p className="text-xs text-muted-foreground">Manual, por voz, colando texto ou importando documento</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-3 p-2">
              <Zap className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                Todas as funcionalidades (IA, importação, PDF) estão disponíveis desde o início
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button onClick={handleStartSetup} className="w-full">
              Começar Configuração
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="ghost" onClick={handleDismiss} className="w-full">
              Configurar depois
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Progress Card - shows when not all steps are done */}
      {!showWelcome && !dismissed && !allCompleted && (
        <Card className="fixed bottom-24 right-4 w-80 shadow-lg border-2 border-primary/20 z-40 animate-in slide-in-from-right">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Configure sua conta
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDismiss}>
                <X className="w-3 h-3" />
              </Button>
            </div>
            <Progress value={progress} className="h-1.5" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">
              {completedSteps} de {steps.length} passos concluídos
            </p>
            <div className="space-y-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 text-sm ${
                    step.completed ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-current" />
                  )}
                  <span className={step.completed ? "line-through" : ""}>{step.title}</span>
                </div>
              ))}
            </div>
            <Button 
              size="sm" 
              className="w-full mt-3" 
              onClick={() => {
                if (!hasHospital || !hasTeam) {
                  if (onCreatePatient) onCreatePatient();
                } else if (!hasPatient) {
                  if (onCreatePatient) onCreatePatient();
                }
              }}
            >
              {!hasHospital || !hasTeam ? "Configurar Agora" : "Cadastrar Paciente"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
