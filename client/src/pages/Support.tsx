import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageSquare, 
  Send, 
  Loader2,
  CheckCircle,
  Search,
  BookOpen,
  Bug,
  Lightbulb,
  Mail,
  Shield,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "@/i18n";

// FAQ data
const faqCategories = [
  {
    id: "getting-started",
    title: "Primeiros Passos",
    icon: BookOpen,
    questions: [
      {
        q: "Como cadastrar meu primeiro paciente?",
        a: "Acesse o Dashboard e clique em 'Novo Paciente'. Você pode digitar os dados manualmente, usar entrada por voz, ou importar de um documento (PDF, foto). O sistema irá guiá-lo pelo processo."
      },
      {
        q: "Como vincular minha conta a um hospital?",
        a: "Vá em Configurações > Hospitais. Busque o hospital na base com mais de 259 hospitais brasileiros pré-cadastrados. Se não encontrar, cadastre um novo. Após vincular, poderá admitir pacientes nesse hospital."
      },
      {
        q: "Como criar ou entrar em uma equipe?",
        a: "Acesse Configurações > Equipes. Para criar uma equipe, clique em 'Nova Equipe'. Para entrar em uma equipe existente, peça ao administrador para enviar um convite ou use o código de convite."
      },
      {
        q: "O que é o método SBAR?",
        a: "SBAR é um método de comunicação estruturada: Situação (o que está acontecendo), Background (contexto clínico), Avaliação (sua análise), Recomendação (o que você sugere). Ele padroniza a passagem de informações entre profissionais de saúde."
      }
    ]
  },
  {
    id: "patients",
    title: "Pacientes e Evoluções",
    icon: HelpCircle,
    questions: [
      {
        q: "Como fazer uma evolução SBAR?",
        a: "Acesse o paciente no Dashboard e clique em 'Evoluir'. Preencha os campos S, B, A, R com as informações relevantes. Você pode usar entrada por voz para agilizar."
      },
      {
        q: "Como importar vários pacientes de uma vez?",
        a: "Na tela de Novo Paciente, clique em 'Importar'. Você pode enviar um PDF, planilha ou foto de uma lista de pacientes. O sistema detectará automaticamente os dados e pedirá sua confirmação."
      },
      {
        q: "Como buscar um paciente específico?",
        a: "Use a barra de busca no Dashboard (ou Ctrl+K). Você pode buscar por nome, leito, diagnóstico ou hospital. Os resultados aparecem em tempo real."
      },
      {
        q: "O que significa cada prioridade de paciente?",
        a: "Crítico (vermelho): risco imediato de vida. Alto (laranja): necessita atenção urgente. Médio (amarelo): estável mas requer monitoramento. Baixo (verde): estável, acompanhamento de rotina."
      }
    ]
  },
  {
    id: "teams",
    title: "Equipes e Colaboração",
    icon: MessageSquare,
    questions: [
      {
        q: "Quem pode ver os dados dos meus pacientes?",
        a: "Apenas membros da sua equipe podem ver os pacientes vinculados a ela. Cada equipe é um ambiente isolado e seguro. Você controla quem entra na equipe."
      },
      {
        q: "Como convidar um colega para minha equipe?",
        a: "Vá em Configurações > Equipes, selecione a equipe e clique em 'Convidar Membro'. Você pode enviar por email ou compartilhar o código de convite."
      },
      {
        q: "Quais são os níveis de permissão?",
        a: "Admin: controle total da equipe. Editor: cria e edita evoluções. Leitor: apenas visualiza. Usuário de Dados: acessa apenas dados não-sensíveis (para gestores e secretárias)."
      }
    ]
  },
  {
    id: "security",
    title: "Segurança e Privacidade",
    icon: Shield,
    questions: [
      {
        q: "Meus dados estão seguros?",
        a: "Sim. Utilizamos criptografia de ponta a ponta, servidores seguros com certificação, e seguimos as normas LGPD e HIPAA. Seus dados nunca são compartilhados com terceiros."
      },
      {
        q: "Posso acessar de qualquer dispositivo?",
        a: "Sim. O SBAR Health funciona em qualquer navegador moderno (Chrome, Firefox, Safari, Edge) em computadores, tablets e celulares. Seus dados sincronizam automaticamente."
      },
      {
        q: "O que acontece se eu perder meu celular?",
        a: "Seus dados estão seguros na nuvem. Basta fazer login em outro dispositivo. Recomendamos ativar autenticação de dois fatores em Configurações > Segurança."
      }
    ]
  }
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: "Aberto", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  in_progress: { label: "Em Análise", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  resolved: { label: "Resolvido", color: "bg-green-100 text-green-800", icon: CheckCircle },
  closed: { label: "Fechado", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
};

const typeConfig: Record<string, { label: string; icon: any }> = {
  bug: { label: "Bug / Erro", icon: Bug },
  suggestion: { label: "Sugestão", icon: Lightbulb },
  question: { label: "Dúvida", icon: HelpCircle },
  security: { label: "Segurança", icon: Shield },
};

export default function Support() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  
  const [searchQuery, setSearchQuery] = useState("");
  
  // Report form state
  const [reportType, setReportType] = useState<string>("bug");
  const [reportSubject, setReportSubject] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [showMyTickets, setShowMyTickets] = useState(false);

  // tRPC mutations and queries
  const submitTicket = trpc.support.submit.useMutation({
    onSuccess: () => {
      toast.success("Ticket enviado com sucesso! Nossa equipe irá analisar em breve.");
      setReportSubject("");
      setReportDescription("");
      setReportType("bug");
      utils.support.myTickets.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar ticket");
    }
  });

  const { data: myTickets = [] } = trpc.support.myTickets.useQuery(undefined, {
    enabled: showMyTickets,
  });

  // Filter FAQs based on search
  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportSubject.trim() || !reportDescription.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    submitTicket.mutate({
      type: reportType as "bug" | "suggestion" | "question" | "security",
      subject: reportSubject,
      description: reportDescription,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold">Central de Ajuda</h1>
            <p className="text-xs text-muted-foreground">FAQ, Suporte e Reporte de Erros</p>
          </div>
        </div>
      </header>

      <main className="container py-6 max-w-4xl">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar nas perguntas frequentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* FAQ Section */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Perguntas Frequentes
                </CardTitle>
                <CardDescription>
                  Encontre respostas para as dúvidas mais comuns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {searchQuery && filteredFaqs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum resultado encontrado para "{searchQuery}"</p>
                    <p className="text-sm mt-2">Tente buscar com outras palavras ou envie sua dúvida abaixo</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {(searchQuery ? filteredFaqs : faqCategories).map((category) => (
                      <div key={category.id} className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <category.icon className="w-4 h-4 text-primary" />
                          <h3 className="font-medium">{category.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {category.questions.length}
                          </Badge>
                        </div>
                        {category.questions.map((item, index) => (
                          <AccordionItem key={`${category.id}-${index}`} value={`${category.id}-${index}`}>
                            <AccordionTrigger className="text-left text-sm">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </div>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

            {/* My Tickets Section */}
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => setShowMyTickets(!showMyTickets)}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="w-5 h-5" />
                      Meus Tickets
                    </CardTitle>
                    <CardDescription>
                      Acompanhe o status dos seus reportes
                    </CardDescription>
                  </div>
                  {showMyTickets ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              {showMyTickets && (
                <CardContent>
                  {myTickets.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Você ainda não enviou nenhum ticket.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myTickets.map((ticket: any) => {
                        const status = statusConfig[ticket.status] || statusConfig.open;
                        const type = typeConfig[ticket.type] || typeConfig.bug;
                        const StatusIcon = status.icon;
                        const TypeIcon = type.icon;
                        return (
                          <div key={ticket.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <TypeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="font-medium text-sm">{ticket.subject}</span>
                              </div>
                              <Badge className={`${status.color} text-xs shrink-0`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{type.label}</span>
                              <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {ticket.adminNotes && (
                              <div className="bg-muted/50 rounded p-2 mt-2">
                                <p className="text-xs font-medium text-primary">Resposta da equipe:</p>
                                <p className="text-xs text-muted-foreground mt-1">{ticket.adminNotes}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Report Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Reportar Problema
                </CardTitle>
                <CardDescription>
                  Encontrou um bug ou tem uma sugestão? Envie para nossa equipe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">
                          <div className="flex items-center gap-2">
                            <Bug className="w-4 h-4" />
                            Bug / Erro
                          </div>
                        </SelectItem>
                        <SelectItem value="suggestion">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Sugestão
                          </div>
                        </SelectItem>
                        <SelectItem value="question">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            Dúvida
                          </div>
                        </SelectItem>
                        <SelectItem value="security">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Segurança
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Assunto *</Label>
                    <Input
                      placeholder="Resumo do problema"
                      value={reportSubject}
                      onChange={(e) => setReportSubject(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Descrição *</Label>
                    <Textarea
                      placeholder="Descreva o problema ou sugestão em detalhes. Inclua passos para reproduzir o erro, se possível."
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Mínimo 10 caracteres. Informações do dispositivo serão enviadas automaticamente.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitTicket.isPending}>
                    {submitTicket.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Ticket
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contato Direto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Precisa de ajuda urgente? Entre em contato:
                </p>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="mailto:suporte@sbarhealth.com">
                    <Mail className="w-4 h-4 mr-2" />
                    suporte@sbarhealth.com
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Resposta em até 24 horas úteis
                </p>
              </CardContent>
            </Card>

            {/* Version Info */}
            <Card>
              <CardContent className="pt-4">
                <div className="text-center text-sm text-muted-foreground">
                  <p>SBAR Health</p>
                  <p className="font-mono">v2.15.0</p>
                  <Badge variant="outline" className="mt-2">Beta</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
