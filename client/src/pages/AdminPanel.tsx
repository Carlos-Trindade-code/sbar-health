import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Activity, Database, BarChart3, Shield, 
  ArrowLeft, RefreshCw, Clock, AlertTriangle,
  UserCheck, Stethoscope, Building2, Users2,
  Brain, TrendingUp, FileText, MessageSquare,
  Bug, Lightbulb, HelpCircle, CheckCircle,
  Loader2, Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Tradução completa das ações do activity log
function translateAction(action: string): string {
  const map: Record<string, string> = {
    'create_patient': 'Cadastrou paciente',
    'create_admission': 'Criou internação',
    'create_evolution': 'Registrou evolução',
    'create_team': 'Criou equipe',
    'create_hospital': 'Cadastrou hospital',
    'update_patient': 'Editou paciente',
    'update_admission': 'Editou internação',
    'update_evolution': 'Editou evolução',
    'update_team': 'Editou equipe',
    'update_hospital': 'Editou hospital',
    'delete_patient': 'Excluiu paciente',
    'delete_team': 'Excluiu equipe',
    'delete_hospital': 'Excluiu hospital',
    'discharge_patient': 'Deu alta',
    'archive_patient': 'Arquivou',
    'finalize_evolution': 'Finalizou evolução',
    'analyze_text': 'Analisou texto com IA',
    'ai_prediction': 'Gerou análise IA',
    'login': 'Fez login',
    'logout': 'Fez logout',
  };
  return map[action] || action.replace(/_/g, ' ');
}

function translateEntity(entityType: string): string {
  const map: Record<string, string> = {
    'patient': 'Paciente',
    'admission': 'Internação',
    'evolution': 'Evolução',
    'team': 'Equipe',
    'hospital': 'Hospital',
    'user': 'Usuário',
    'ai_prediction': 'Análise IA',
  };
  return map[entityType] || entityType;
}

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirecionar se não for admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      setLocation('/dashboard');
    }
  }, [user, loading, setLocation]);

  const { data: stats, isLoading: statsLoading } = trpc.admin.systemStats.useQuery(
    undefined,
    { enabled: !!user && user.role === 'admin', refetchInterval: 30000 }
  );

  const { data: activity, isLoading: activityLoading } = trpc.admin.recentActivity.useQuery(
    { limit: 30 },
    { enabled: !!user && user.role === 'admin', refetchInterval: 30000 }
  );

  const { data: evolutionsByDay } = trpc.admin.evolutionsByDay.useQuery(
    { days: 30 },
    { enabled: !!user && user.role === 'admin' }
  );

  const { data: usersList } = trpc.admin.usersList.useQuery(
    undefined,
    { enabled: !!user && user.role === 'admin' }
  );

  const [ticketFilter, setTicketFilter] = useState<string>('all');
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');

  const { data: tickets, isLoading: ticketsLoading } = trpc.admin.supportTickets.useQuery(
    { status: ticketFilter as any },
    { enabled: !!user && user.role === 'admin', refetchInterval: 15000 }
  );

  const utils = trpc.useUtils();

  const updateTicket = trpc.admin.updateTicket.useMutation({
    onSuccess: () => {
      toast.success('Ticket atualizado!');
      utils.admin.supportTickets.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateVerification = trpc.admin.updateUserVerification.useMutation({
    onSuccess: () => {
      toast.success('Verificação atualizada!');
      utils.admin.usersList.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const maxEvolutions = evolutionsByDay?.reduce((max, d) => Math.max(max, d.count), 1) || 1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <h1 className="text-lg font-bold">Painel Administrativo</h1>
            </div>
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
              Acesso Restrito
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Visão Geral do Sistema
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard 
              icon={<Users className="w-5 h-5 text-blue-500" />}
              label="Usuários" 
              value={stats?.usuarios ?? '-'} 
              loading={statsLoading}
            />
            <StatCard 
              icon={<UserCheck className="w-5 h-5 text-emerald-500" />}
              label="Pacientes" 
              value={stats?.pacientes ?? '-'} 
              loading={statsLoading}
            />
            <StatCard 
              icon={<Stethoscope className="w-5 h-5 text-violet-500" />}
              label="Internações Ativas" 
              value={stats?.internacoesAtivas ?? '-'} 
              subtitle={`${stats?.internacoesTotal ?? 0} total`}
              loading={statsLoading}
            />
            <StatCard 
              icon={<FileText className="w-5 h-5 text-cyan-500" />}
              label="Evoluções" 
              value={stats?.evolucoesTotal ?? '-'} 
              subtitle={`${stats?.evolucoesHoje ?? 0} hoje`}
              highlight={stats?.evolucoesHoje ? stats.evolucoesHoje > 0 : false}
              loading={statsLoading}
            />
            <StatCard 
              icon={<Brain className="w-5 h-5 text-pink-500" />}
              label="Análises IA" 
              value={stats?.analisesIA ?? '-'} 
              loading={statsLoading}
            />
            <StatCard 
              icon={<Building2 className="w-5 h-5 text-orange-500" />}
              label="Hospitais" 
              value={stats?.hospitais ?? '-'} 
              loading={statsLoading}
            />
            <StatCard 
              icon={<Users2 className="w-5 h-5 text-teal-500" />}
              label="Equipes" 
              value={stats?.equipes ?? '-'} 
              loading={statsLoading}
            />
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Evoluções por Dia - Gráfico de barras simples */}
          <section>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-500" />
                  Evoluções por Dia (últimos 30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {evolutionsByDay && evolutionsByDay.length > 0 ? (
                  <div className="space-y-1">
                    {evolutionsByDay.slice(-15).map((day) => (
                      <div key={day.date} className="flex items-center gap-2 text-xs">
                        <span className="w-16 text-muted-foreground shrink-0">
                          {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                          <div 
                            className="bg-cyan-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.max((day.count / maxEvolutions) * 100, 5)}%` }}
                          />
                        </div>
                        <span className="w-6 text-right font-medium">{day.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma evolução registrada nos últimos 30 dias
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Usuários */}
          <section>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Usuários Cadastrados ({usersList?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersList && usersList.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {usersList.map((u) => (
                      <div key={u.id} className="p-3 rounded-lg bg-muted/50 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {(u.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{u.name || 'Sem nome'}</p>
                              <p className="text-muted-foreground">{u.email || 'Sem email'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-[10px]">
                              {u.role === 'admin' ? 'Admin' : u.role === 'hospital_admin' ? 'Admin Hosp.' : 'Usuário'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {u.plan?.toUpperCase() || 'FREE'}
                            </Badge>
                            {(u as any).verificationStatus && (
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] ${
                                  (u as any).verificationStatus === 'verified' ? 'border-green-500 text-green-600' :
                                  (u as any).verificationStatus === 'pending' ? 'border-amber-500 text-amber-600' :
                                  (u as any).verificationStatus === 'rejected' ? 'border-red-500 text-red-600' :
                                  'border-gray-400 text-gray-500'
                                }`}
                              >
                                {(u as any).verificationStatus === 'verified' ? '✓ Verificado' :
                                 (u as any).verificationStatus === 'pending' ? '⏳ Pendente' :
                                 (u as any).verificationStatus === 'rejected' ? '✗ Recusado' :
                                 'Não verificado'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {/* Dados profissionais */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                          {(u as any).professionalType && (
                            <div><span className="font-medium text-foreground">Tipo:</span> {{
                              medico: 'Médico', enfermeiro: 'Enfermeiro', fisioterapeuta: 'Fisioterapeuta',
                              nutricionista: 'Nutricionista', farmaceutico: 'Farmacêutico', psicologo: 'Psicólogo',
                              fonoaudiologo: 'Fonoaudiólogo', terapeuta_ocupacional: 'Terapeuta Ocupacional',
                              estudante: 'Estudante', gestor: 'Gestor', outro: 'Outro'
                            }[(u as any).professionalType as string] || (u as any).professionalType}</div>
                          )}
                          {((u as any).councilNumber || u.crm) && (
                            <div><span className="font-medium text-foreground">Registro:</span> {(u as any).councilType || 'CRM'} {(u as any).councilNumber || u.crm}{(u as any).councilState ? `/${(u as any).councilState}` : ''}</div>
                          )}
                          {(u as any).cpf && (
                            <div><span className="font-medium text-foreground">CPF:</span> {(u as any).cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4')}</div>
                          )}
                          {u.specialty && (
                            <div><span className="font-medium text-foreground">Especialidade:</span> {u.specialty}</div>
                          )}
                          {(u as any).university && (
                            <div><span className="font-medium text-foreground">Universidade:</span> {(u as any).university}</div>
                          )}
                          {u.lastSignedIn && (
                            <div><span className="font-medium text-foreground">Último acesso:</span> {new Date(u.lastSignedIn).toLocaleDateString('pt-BR')}</div>
                          )}
                        </div>
                        {/* Ações de verificação */}
                        {(u as any).verificationStatus === 'pending' && (
                          <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => {
                                updateVerification.mutate({ userId: u.id, status: 'verified', notes: 'Aprovado pelo administrador' });
                              }}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" /> Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                const reason = prompt('Motivo da recusa:');
                                if (reason) updateVerification.mutate({ userId: u.id, status: 'rejected', notes: reason });
                              }}
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" /> Recusar
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum usuário cadastrado
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Logs de Atividade */}
        <section>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Atividade Recente ({activity?.length ?? 0} registros)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : activity && activity.length > 0 ? (
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {activity.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 text-xs transition-colors">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{log.userName || 'Sistema'}</span>
                        <span className="text-muted-foreground">
                          {' '}{translateAction(log.action)}{' '}
                          {translateEntity(log.entityType)}
                          {log.entityId ? ` #${log.entityId}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {log.ipAddress && (
                          <span className="text-muted-foreground text-[10px]">{log.ipAddress}</span>
                        )}
                        <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(log.createdAt).toLocaleString('pt-BR', { 
                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum log de atividade registrado ainda.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    As atividades dos usuários aparecerão aqui conforme o sistema for utilizado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Tickets de Suporte */}
        <section>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  Tickets de Suporte ({tickets?.length ?? 0})
                </CardTitle>
                <Select value={ticketFilter} onValueChange={setTicketFilter}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Abertos</SelectItem>
                    <SelectItem value="in_progress">Em Análise</SelectItem>
                    <SelectItem value="resolved">Resolvidos</SelectItem>
                    <SelectItem value="closed">Fechados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : tickets && tickets.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {tickets.map((ticket: any) => {
                    const isExpanded = expandedTicket === ticket.id;
                    const typeIcon = ticket.type === 'bug' ? <Bug className="w-4 h-4 text-red-500" /> 
                      : ticket.type === 'suggestion' ? <Lightbulb className="w-4 h-4 text-yellow-500" />
                      : ticket.type === 'security' ? <Shield className="w-4 h-4 text-orange-500" />
                      : <HelpCircle className="w-4 h-4 text-blue-500" />;
                    const statusColor = ticket.status === 'open' ? 'bg-blue-100 text-blue-800'
                      : ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800'
                      : ticket.status === 'resolved' ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800';
                    const statusLabel = ticket.status === 'open' ? 'Aberto'
                      : ticket.status === 'in_progress' ? 'Em Análise'
                      : ticket.status === 'resolved' ? 'Resolvido' : 'Fechado';
                    const priorityColor = ticket.priority === 'critical' ? 'bg-red-100 text-red-800'
                      : ticket.priority === 'high' ? 'bg-orange-100 text-orange-800'
                      : ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800';
                    
                    return (
                      <div key={ticket.id} className="border rounded-lg overflow-hidden">
                        <div 
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            setExpandedTicket(isExpanded ? null : ticket.id);
                            if (!isExpanded) setAdminNotes(ticket.adminNotes || '');
                          }}
                        >
                          {typeIcon}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{ticket.subject}</p>
                            <p className="text-xs text-muted-foreground">
                              {ticket.userName || 'Usuário'} • {new Date(ticket.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={`${priorityColor} text-[10px]`}>
                              {ticket.priority === 'critical' ? 'Crítico' : ticket.priority === 'high' ? 'Alto' : ticket.priority === 'medium' ? 'Médio' : 'Baixo'}
                            </Badge>
                            <Badge className={`${statusColor} text-[10px]`}>{statusLabel}</Badge>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="border-t p-3 bg-muted/30 space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Descrição:</p>
                              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                            </div>
                            {ticket.userEmail && (
                              <p className="text-xs text-muted-foreground">Email: {ticket.userEmail}</p>
                            )}
                            {ticket.pageUrl && (
                              <p className="text-xs text-muted-foreground">Página: {ticket.pageUrl}</p>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs font-medium mb-1">Status</p>
                                <Select 
                                  value={ticket.status} 
                                  onValueChange={(v) => updateTicket.mutate({ id: ticket.id, status: v as any })}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Aberto</SelectItem>
                                    <SelectItem value="in_progress">Em Análise</SelectItem>
                                    <SelectItem value="resolved">Resolvido</SelectItem>
                                    <SelectItem value="closed">Fechado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <p className="text-xs font-medium mb-1">Prioridade</p>
                                <Select 
                                  value={ticket.priority} 
                                  onValueChange={(v) => updateTicket.mutate({ id: ticket.id, priority: v as any })}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Baixa</SelectItem>
                                    <SelectItem value="medium">Média</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                    <SelectItem value="critical">Crítica</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium mb-1">Resposta ao usuário</p>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Escreva uma resposta para o usuário..."
                                rows={3}
                                className="text-sm"
                              />
                              <Button 
                                size="sm" 
                                className="mt-2"
                                onClick={() => updateTicket.mutate({ id: ticket.id, adminNotes })}
                                disabled={updateTicket.isPending}
                              >
                                {updateTicket.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                                Salvar Resposta
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {ticketFilter === 'all' ? 'Nenhum ticket de suporte recebido ainda.' : `Nenhum ticket com status "${ticketFilter}".`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Info de Segurança */}
        <section>
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-amber-800 dark:text-amber-400">Informações de Segurança</p>
                  <p className="text-amber-700 dark:text-amber-500">
                    Este painel é acessível apenas para administradores. A promoção a admin é feita exclusivamente 
                    via banco de dados, impossibilitando auto-promoção. Todas as requisições são verificadas no 
                    backend antes de retornar dados. A URL <code className="bg-amber-200/50 dark:bg-amber-800/50 px-1 rounded">/admin</code> não 
                    aparece em nenhum menu ou link do sistema.
                  </p>
                  <p className="text-amber-700 dark:text-amber-500">
                    <strong>Dados atualizados automaticamente a cada 30 segundos.</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

// Componente de card de estatística
function StatCard({ icon, label, value, subtitle, highlight, loading }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
  loading?: boolean;
}) {
  return (
    <Card className={highlight ? 'ring-1 ring-cyan-500/30' : ''}>
      <CardContent className="p-3">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-6 bg-muted rounded w-3/4" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              {icon}
              <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
