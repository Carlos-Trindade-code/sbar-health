import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  BarChart3, 
  Calendar, 
  Clock, 
  FileText, 
  TrendingUp, 
  Users,
  Activity,
  Brain,
  Settings
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [dateRange, setDateRange] = useState("30");

  const { data: teams = [] } = trpc.teams.list.useQuery();
  
  const startDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - parseInt(dateRange));
    return d;
  }, [dateRange]);
  
  const endDate = useMemo(() => new Date(), []);

  const { data: stats } = trpc.analytics.teamProductivity.useQuery(
    { 
      teamId: selectedTeam !== "all" ? parseInt(selectedTeam) : (teams[0]?.id || 1),
      startDate,
      endDate
    },
    { enabled: teams.length > 0 }
  );

  // Mock data for charts
  const weeklyData = [
    { day: 'Seg', evolutions: 12, admissions: 3 },
    { day: 'Ter', evolutions: 19, admissions: 5 },
    { day: 'Qua', evolutions: 15, admissions: 2 },
    { day: 'Qui', evolutions: 22, admissions: 4 },
    { day: 'Sex', evolutions: 18, admissions: 3 },
    { day: 'Sáb', evolutions: 8, admissions: 1 },
    { day: 'Dom', evolutions: 5, admissions: 1 },
  ];

  const insuranceData = [
    { name: 'SUS', value: 45, color: '#0d9488' },
    { name: 'Unimed', value: 25, color: '#f59e0b' },
    { name: 'Bradesco', value: 15, color: '#3b82f6' },
    { name: 'Particular', value: 10, color: '#8b5cf6' },
    { name: 'Outros', value: 5, color: '#6b7280' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Analytics</h1>
              <p className="text-xs text-muted-foreground">Métricas de produtividade</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas equipes</SelectItem>
              {teams.map(t => (
                <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{Number(stats?.admissions?.total || 0)}</p>
                  <p className="text-xs text-muted-foreground">Internações</p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{Number(stats?.admissions?.discharged || 0)}</p>
                  <p className="text-xs text-muted-foreground">Altas</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats?.admissions?.avgStay ? Number(stats.admissions.avgStay).toFixed(1) : "0"}</p>
                  <p className="text-xs text-muted-foreground">Dias médios</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.evolutionsByAuthor?.reduce((acc: number, e: any) => acc + e.count, 0) || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Evoluções</p>
                </div>
                <FileText className="w-8 h-8 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Atividade Semanal
              </CardTitle>
              <CardDescription>Evoluções e internações por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="evolutions" fill="#0d9488" name="Evoluções" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="admissions" fill="#f59e0b" name="Internações" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Convênios Atendidos
              </CardTitle>
              <CardDescription>Distribuição por fonte pagadora</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={insuranceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {insuranceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Médicos Mais Ativos
            </CardTitle>
            <CardDescription>Ranking por número de evoluções</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.evolutionsByAuthor || []).slice(0, 5).map((author: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(author.count / (stats?.evolutionsByAuthor?.[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium">{author.count} evoluções</span>
                </div>
              ))}
              {(!stats?.evolutionsByAuthor || stats.evolutionsByAuthor.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado disponível para o período selecionado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-40 safe-bottom">
        <div className="flex justify-around items-center h-16">
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground"
            onClick={() => setLocation("/dashboard")}
          >
            <Activity className="w-5 h-5" />
            <span className="text-xs font-medium">Início</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground"
            onClick={() => setLocation("/patient/new")}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs font-medium">Novo</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-primary"
            onClick={() => setLocation("/analytics")}
          >
            <Brain className="w-5 h-5" />
            <span className="text-xs font-medium">Analytics</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground"
            onClick={() => setLocation("/settings")}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">Config</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
