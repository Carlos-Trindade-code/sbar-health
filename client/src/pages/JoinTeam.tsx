import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Shield, CheckCircle2, XCircle, Clock, LogIn, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, { label: string; description: string; icon: string }> = {
  admin: { label: "Administrador", description: "Acesso total: gerenciar membros, editar pacientes, evoluções e configurações", icon: "🔑" },
  editor: { label: "Editor", description: "Criar e editar pacientes e evoluções, sem gerenciar membros", icon: "✏️" },
  reader: { label: "Leitor", description: "Visualizar pacientes e evoluções, sem editar", icon: "👁️" },
  data_user: { label: "Dados", description: "Acesso a relatórios e estatísticas, sem dados clínicos identificáveis", icon: "📊" },
};

export default function JoinTeam() {
  const [, params] = useRoute("/join/:code");
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const code = params?.code || "";

  const [accepted, setAccepted] = useState(false);

  const { data: invite, isLoading, error } = trpc.teams.getInvite.useQuery(
    { code },
    { enabled: !!code, retry: false }
  );

  const acceptMutation = trpc.teams.acceptInvite.useMutation({
    onSuccess: (data) => {
      setAccepted(true);
      toast.success("Convite aceito! Você agora faz parte da equipe.");
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao aceitar convite");
    },
  });

  const handleAccept = () => {
    if (!code) return;
    acceptMutation.mutate({ code });
  };

  const handleGoToDashboard = () => {
    navigate("/");
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage = error.message || "Convite não encontrado";
    const isExpired = errorMessage.includes("expirado");
    const isUsed = errorMessage.includes("aceito") || errorMessage.includes("rejeitado") || errorMessage.includes("utilizado");

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              {isExpired ? (
                <Clock className="w-8 h-8 text-destructive" />
              ) : isUsed ? (
                <CheckCircle2 className="w-8 h-8 text-amber-500" />
              ) : (
                <XCircle className="w-8 h-8 text-destructive" />
              )}
            </div>
            <CardTitle>
              {isExpired ? "Convite Expirado" : isUsed ? "Convite Já Utilizado" : "Convite Inválido"}
            </CardTitle>
            <CardDescription>
              {isExpired
                ? "Este link de convite expirou. Peça ao administrador da equipe para gerar um novo."
                : isUsed
                ? "Este convite já foi utilizado. Se você já é membro, acesse o dashboard."
                : "O link de convite não foi encontrado. Verifique se o link está correto."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={handleGoToDashboard}>
              Ir para o Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Convite para Equipe</CardTitle>
            <CardDescription>
              Você foi convidado para a equipe <strong>{invite?.teamName}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invite?.suggestedRole && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-medium">Função sugerida:</span>
                  <Badge variant="secondary">
                    {roleLabels[invite.suggestedRole]?.icon} {roleLabels[invite.suggestedRole]?.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {roleLabels[invite.suggestedRole]?.description}
                </p>
              </div>
            )}

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-200">Faça login para continuar</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Você precisa estar logado para aceitar o convite.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => {
              // Redirect to login, then back to this page
              const returnUrl = `/join/${code}`;
              // Store return URL in sessionStorage so we can redirect after login
              sessionStorage.setItem('sbar-join-redirect', returnUrl);
              window.location.href = getLoginUrl();
            }}>
              <LogIn className="w-4 h-4 mr-2" />
              Fazer Login e Aceitar Convite
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Accepted state
  if (accepted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle>Bem-vindo à equipe!</CardTitle>
            <CardDescription>
              Você agora faz parte de <strong>{invite?.teamName}</strong> como{" "}
              <Badge variant="secondary" className="ml-1">
                {roleLabels[invite?.suggestedRole || "editor"]?.label}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={handleGoToDashboard}>
              Ir para o Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Invite details - ready to accept
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Convite para Equipe</CardTitle>
          <CardDescription>
            Você foi convidado para a equipe <strong>{invite?.teamName}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invite?.suggestedRole && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium">Função:</span>
                <Badge variant="secondary">
                  {roleLabels[invite.suggestedRole]?.icon} {roleLabels[invite.suggestedRole]?.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {roleLabels[invite.suggestedRole]?.description}
              </p>
            </div>
          )}

          {invite?.expiresAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                Expira em: {new Date(invite.expiresAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <p className="text-muted-foreground">
              Logado como: <strong>{user.name || user.email}</strong>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleGoToDashboard}>
            Recusar
          </Button>
          <Button
            className="flex-1"
            onClick={handleAccept}
            disabled={acceptMutation.isPending}
          >
            {acceptMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Aceitando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aceitar Convite
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
