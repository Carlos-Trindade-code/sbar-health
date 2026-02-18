import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Smartphone,
  Download,
  Share,
  MoreVertical,
  Plus,
  CheckCircle,
  Apple,
  Chrome,
  Monitor,
  Sparkles,
  ArrowDown,
  ExternalLink
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

// Detect device type
function useDeviceType() {
  const [device, setDevice] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDevice("ios");
    } else if (/android/.test(userAgent)) {
      setDevice("android");
    } else {
      setDevice("desktop");
    }
  }, []);

  return device;
}

// Check if PWA can be installed
function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    }
  };

  return { installPrompt, isInstalled, promptInstall };
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function Step({ number, title, description, icon, highlight }: StepProps) {
  return (
    <div className={cn(
      "flex gap-4 p-4 rounded-lg transition-colors",
      highlight ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
        highlight ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
      )}>
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs">Passo {number}</Badge>
          <h3 className="font-medium">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function InstallApp() {
  const [, setLocation] = useLocation();
  const device = useDeviceType();
  const { installPrompt, isInstalled, promptInstall } = useInstallPrompt();
  const { t } = useTranslation();

  // Default tab based on device
  const defaultTab = device === "ios" ? "ios" : device === "android" ? "android" : "desktop";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/settings")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">Instalar App</h1>
            <p className="text-xs text-muted-foreground">Adicione à tela inicial</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Grátis
          </Badge>
        </div>
      </header>

      <main className="container py-6 max-w-2xl space-y-6">
        {/* Hero */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">SBAR Global no seu celular</h2>
                <p className="text-sm text-muted-foreground">
                  Acesse rapidamente como um app nativo, sem precisar baixar da loja.
                </p>
              </div>
            </div>

            {/* Quick install button if available */}
            {installPrompt && !isInstalled && (
              <Button onClick={promptInstall} className="w-full mt-4 gap-2">
                <Download className="w-4 h-4" />
                Instalar Agora
              </Button>
            )}

            {isInstalled && (
              <div className="mt-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                  App já instalado no seu dispositivo!
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Por que instalar?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Acesso rápido</p>
                  <p className="text-xs text-muted-foreground">Ícone na tela inicial</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Tela cheia</p>
                  <p className="text-xs text-muted-foreground">Sem barra do navegador</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Notificações</p>
                  <p className="text-xs text-muted-foreground">Alertas em tempo real</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Sem custo</p>
                  <p className="text-xs text-muted-foreground">Não precisa de loja</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions by device */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como instalar</CardTitle>
            <CardDescription>
              Selecione seu dispositivo para ver as instruções
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="ios" className="gap-2">
                  <Apple className="w-4 h-4" />
                  iPhone
                </TabsTrigger>
                <TabsTrigger value="android" className="gap-2">
                  <Chrome className="w-4 h-4" />
                  Android
                </TabsTrigger>
                <TabsTrigger value="desktop" className="gap-2">
                  <Monitor className="w-4 h-4" />
                  Desktop
                </TabsTrigger>
              </TabsList>

              {/* iOS Instructions */}
              <TabsContent value="ios" className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Importante:</strong> Use o navegador Safari para instalar no iPhone/iPad.
                  </p>
                </div>

                <div className="space-y-3">
                  <Step
                    number={1}
                    title="Abra no Safari"
                    description="Certifique-se de estar usando o Safari (navegador padrão do iPhone)"
                    icon={<ExternalLink className="w-5 h-5" />}
                  />
                  <Step
                    number={2}
                    title="Toque em Compartilhar"
                    description="Toque no ícone de compartilhar (quadrado com seta para cima) na barra inferior"
                    icon={<Share className="w-5 h-5" />}
                    highlight
                  />
                  <Step
                    number={3}
                    title="Role para baixo"
                    description="Role a lista de opções até encontrar 'Adicionar à Tela de Início'"
                    icon={<ArrowDown className="w-5 h-5" />}
                  />
                  <Step
                    number={4}
                    title="Adicionar à Tela de Início"
                    description="Toque em 'Adicionar à Tela de Início' e depois em 'Adicionar'"
                    icon={<Plus className="w-5 h-5" />}
                    highlight
                  />
                  <Step
                    number={5}
                    title="Pronto!"
                    description="O ícone do SBAR Global aparecerá na sua tela inicial"
                    icon={<CheckCircle className="w-5 h-5" />}
                  />
                </div>

                {/* Visual guide for iOS */}
                <div className="mt-6 p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm font-medium mb-3">Resumo visual:</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-background border">
                      <Share className="w-4 h-4" />
                      <span>Compartilhar</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-background border">
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
                      <CheckCircle className="w-4 h-4" />
                      <span>Pronto!</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Android Instructions */}
              <TabsContent value="android" className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Dica:</strong> Use o Chrome para a melhor experiência no Android.
                  </p>
                </div>

                <div className="space-y-3">
                  <Step
                    number={1}
                    title="Abra no Chrome"
                    description="Acesse o SBAR Global pelo navegador Chrome"
                    icon={<Chrome className="w-5 h-5" />}
                  />
                  <Step
                    number={2}
                    title="Toque no menu"
                    description="Toque nos três pontos verticais (⋮) no canto superior direito"
                    icon={<MoreVertical className="w-5 h-5" />}
                    highlight
                  />
                  <Step
                    number={3}
                    title="Instalar aplicativo"
                    description="Toque em 'Instalar aplicativo' ou 'Adicionar à tela inicial'"
                    icon={<Download className="w-5 h-5" />}
                    highlight
                  />
                  <Step
                    number={4}
                    title="Confirme"
                    description="Toque em 'Instalar' na janela de confirmação"
                    icon={<CheckCircle className="w-5 h-5" />}
                  />
                  <Step
                    number={5}
                    title="Pronto!"
                    description="O app será instalado e aparecerá na sua tela inicial"
                    icon={<Smartphone className="w-5 h-5" />}
                  />
                </div>

                {/* Visual guide for Android */}
                <div className="mt-6 p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm font-medium mb-3">Resumo visual:</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-background border">
                      <MoreVertical className="w-4 h-4" />
                      <span>Menu</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-background border">
                      <Download className="w-4 h-4" />
                      <span>Instalar</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
                      <CheckCircle className="w-4 h-4" />
                      <span>Pronto!</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Desktop Instructions */}
              <TabsContent value="desktop" className="space-y-4">
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    <strong>Compatível com:</strong> Chrome, Edge e outros navegadores baseados em Chromium.
                  </p>
                </div>

                <div className="space-y-3">
                  <Step
                    number={1}
                    title="Abra no Chrome ou Edge"
                    description="Acesse o SBAR Global pelo navegador"
                    icon={<Chrome className="w-5 h-5" />}
                  />
                  <Step
                    number={2}
                    title="Clique no ícone de instalação"
                    description="Na barra de endereço, clique no ícone de instalação (⊕) ou no menu"
                    icon={<Download className="w-5 h-5" />}
                    highlight
                  />
                  <Step
                    number={3}
                    title="Confirme a instalação"
                    description="Clique em 'Instalar' na janela de confirmação"
                    icon={<CheckCircle className="w-5 h-5" />}
                  />
                  <Step
                    number={4}
                    title="Pronto!"
                    description="O app abrirá em uma janela própria e será adicionado aos seus aplicativos"
                    icon={<Monitor className="w-5 h-5" />}
                  />
                </div>

                {/* Install button for desktop */}
                {installPrompt && !isInstalled && (
                  <Button onClick={promptInstall} className="w-full mt-4 gap-2">
                    <Download className="w-4 h-4" />
                    Instalar Agora
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Perguntas frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">Preciso pagar algo?</h4>
              <p className="text-sm text-muted-foreground">
                Não! Instalar o app é totalmente gratuito. Você só precisa ter uma conta no SBAR Global.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Ocupa espaço no celular?</h4>
              <p className="text-sm text-muted-foreground">
                Muito pouco! O app usa menos de 5MB, muito menos que apps tradicionais.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Funciona offline?</h4>
              <p className="text-sm text-muted-foreground">
                Parcialmente. Você pode ver dados já carregados, mas precisa de internet para sincronizar.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Como desinstalar?</h4>
              <p className="text-sm text-muted-foreground">
                Igual a qualquer app: segure o ícone e escolha "Remover" ou "Desinstalar".
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back button */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setLocation("/settings")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar às Configurações
        </Button>
      </main>
    </div>
  );
}
