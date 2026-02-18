import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { 
  UserPlus, 
  Building2, 
  Users, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  X,
  Stethoscope,
  Bell,
  Globe,
  MessageSquareLock,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import { isFeatureEnabled } from "@/hooks/useFeatureFlag";

interface OnboardingSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
  color: string;
}

interface OnboardingTutorialProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export function OnboardingTutorial({ onComplete, forceShow = false }: OnboardingTutorialProps) {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("sbar_onboarding_completed");
    if (!hasSeenOnboarding || forceShow) {
      setIsOpen(true);
    }
  }, [forceShow]);

  const slides: OnboardingSlide[] = [
    {
      icon: <Stethoscope className="w-16 h-16" />,
      title: t("onboarding.welcome.title") || "Bem-vindo ao SBAR Health",
      description: t("onboarding.welcome.description") || "A plataforma de inteligência clínica que revoluciona a comunicação entre profissionais de saúde usando o método SBAR.",
      color: "from-primary/20 to-primary/5",
    },
    {
      icon: <UserPlus className="w-16 h-16" />,
      title: t("onboarding.patient.title") || "Cadastre seus Pacientes",
      description: t("onboarding.patient.description") || "Adicione pacientes rapidamente com diagnóstico CID-10 inteligente, convênio e dados clínicos. Use entrada por voz para agilizar.",
      color: "from-blue-500/20 to-blue-500/5",
    },
    {
      icon: <Building2 className="w-16 h-16" />,
      title: t("onboarding.hospital.title") || "Vincule-se a Hospitais",
      description: t("onboarding.hospital.description") || "Conecte-se aos hospitais onde você trabalha. Busque hospitais existentes ou crie novos. Dados unificados para relatórios precisos.",
      color: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      icon: <Users className="w-16 h-16" />,
      title: t("onboarding.team.title") || "Trabalhe em Equipe",
      description: t("onboarding.team.description") || "Crie ou participe de equipes médicas. Compartilhe pacientes, faça passagem de plantão e receba notificações em tempo real.",
      color: "from-purple-500/20 to-purple-500/5",
    },
    {
      icon: <FileText className="w-16 h-16" />,
      title: t("onboarding.sbar.title") || "Evolua com SBAR",
      description: t("onboarding.sbar.description") || "Registre evoluções estruturadas: Situação, Background, Avaliação e Recomendação. Comunicação clara e padronizada.",
      color: "from-amber-500/20 to-amber-500/5",
    },
    ...(isFeatureEnabled('pushNotifications') ? [{
      icon: <Bell className="w-16 h-16" />,
      title: t("onboarding.notifications.title") || "Notificações Push",
      description: t("onboarding.notifications.description") || "Receba alertas de passagem de plantão, alta de pacientes e atualizações críticas mesmo com o navegador fechado.",
      color: "from-red-500/20 to-red-500/5",
    }] : []),
    ...(isFeatureEnabled('teamChat') ? [{
      icon: <MessageSquareLock className="w-16 h-16" />,
      title: t("onboarding.chat.title") || "Chat Seguro entre Equipes",
      description: t("onboarding.chat.description") || "Comunique-se com sigilo total. Apenas membros da sua equipe podem ler as mensagens. Chat intra-equipe e extra-equipe com criptografia.",
      color: "from-indigo-500/20 to-indigo-500/5",
    }] : []),
    ...(isFeatureEnabled('i18n') ? [{
      icon: <Globe className="w-16 h-16" />,
      title: t("onboarding.global.title") || "Tradução Automática",
      description: t("onboarding.global.description") || "Traduza diagnósticos e evoluções entre 5 idiomas. Colabore com equipes internacionais sem barreiras linguísticas.",
      color: "from-cyan-500/20 to-cyan-500/5",
    }] : []),
  ];

  const handleComplete = () => {
    localStorage.setItem("sbar_onboarding_completed", "true");
    setIsOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem("sbar_onboarding_completed", "true");
    setIsOpen(false);
    onComplete();
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentSlide]);

  if (!isOpen) return null;

  const slide = slides[currentSlide];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden" aria-describedby="onboarding-description">
        <VisuallyHidden>
          <DialogTitle>{t("onboarding.welcome.title")}</DialogTitle>
          <DialogDescription id="onboarding-description">
            {t("onboarding.welcome.description")}
          </DialogDescription>
        </VisuallyHidden>
        <div
          className="relative"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Skip button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground"
            onClick={handleSkip}
          >
            <X className="w-4 h-4 mr-1" />
            Pular
          </Button>

          {/* Slide content */}
          <div className={cn("p-8 pt-12 bg-gradient-to-b", slide.color)}>
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className="p-4 rounded-full bg-background/80 text-primary shadow-lg">
                {slide.icon}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold">{slide.title}</h2>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                {slide.description}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 bg-background">
            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mb-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentSlide
                      ? "w-6 bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={cn(currentSlide === 0 && "invisible")}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t("common.previous")}
              </Button>

              <span className="text-sm text-muted-foreground">
                {currentSlide + 1} / {slides.length}
              </span>

              <Button onClick={nextSlide}>
                {currentSlide === slides.length - 1 ? (
                  t("onboarding.finish") || "Começar"
                ) : (
                  <>
                    {t("common.next")}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OnboardingTutorial;
