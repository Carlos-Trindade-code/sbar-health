import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  BarChart3, 
  Building2, 
  Calendar, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  Users,
  Activity,
  FileText,
  Target,
  Award
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function HospitalDashboard() {
  const params = useParams<{ hospitalId: string }>();
  const hospitalId = parseInt(params.hospitalId || "0");
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState("30");

  const { data: hospital } = trpc.hospitals.get.useQuery(
    { id: hospitalId },
    { enabled: hospitalId > 0 }
  );

  const startDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - parseInt(dateRange));
    return d;
  }, [dateRange]);
  
  const endDate = useMemo(() => new Date(), []);

  const { data: analytics } = trpc.analytics.hospitalDashboard.useQuery(
    { hospitalId, startDate, endDate },
    { enabled: hospitalId > 0 }
  );

  // Mock data for executive dashboard
  const outcomeData = [
    { name: 'Alta melhorada', value: 65, color: '#10b981' },
    { name: 'Alta curada', value: 20, color: '#0d9488' },
    { name: 'Transferência', value: 10, color: '#f59e0b' },
    { name: 'Óbito', value: 5, color: '#ef4444' },
  ];

  const teamPerformance = [
    { team: 'Cardiologia', avgStay: 4.2, dischargeRate: 92, evolutions: 156 },
    { team: 'Pneumologia', avgStay: 5.8, dischargeRate: 88, evolutions: 134 },
    { team: 'Clínica Médica', avgStay: 6.1, dischargeRate: 85, evolutions: 189 },
    { team: 'Cirurgia', avgStay: 3.5, dischargeRate: 95, evolutions: 98 },
  ];

  const dailyTrend = [
    { date: '01/01', admissions: 12, discharges: 10 },
    { date: '02/01', admissions: 15, discharges: 13 },
    { date: '03/01', admissions: 8, discharges: 14 },
    { date: '04/01', admissions: 18, discharges: 12 },
    { date: '05/01', admissions: 14, discharges: 16 },
    { date: '06/01', admissions: 11, discharges: 15 },
    { date: '07/01', admissions: 9, discharges: 11 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h1 className="font-semibold">{hospital?.name || "Hospital"}</h1>
              </div>
              <p className="text-xs text-muted-foreground">Dashboard Executivo</p>
            </div>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-primary">94%</p>
                  <p className="text-xs text-muted-foreground">Taxa de alta positiva</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +2.3% vs mês anterior
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-600">4.8</p>
                  <p className="text-xs text-muted-foreground">Dias médios internação</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                -0.5 dias vs mês anterior
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500/10 to-amber-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-amber-600">87%</p>
                  <p className="text-xs text-muted-foreground">Ocupação</p>
                </div>
                <Activity className="w-8 h-8 text-amber-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {hospital?.bedsTotal || 120} leitos totais
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">1.2k</p>
                  <p className="text-xs text-muted-foreground">Evoluções/mês</p>
                </div>
                <FileText className="w-8 h-8 text-green-500 opacity-50" />
              </div>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +15% produtividade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Fluxo de Pacientes
              </CardTitle>
              <CardDescription>Internações vs Altas por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="admissions" stroke="#0d9488" name="Internações" strokeWidth={2} />
                  <Line type="monotone" dataKey="discharges" stroke="#10b981" name="Altas" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Desfechos Clínicos
              </CardTitle>
              <CardDescription>Distribuição de tipos de alta</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={outcomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5" />
              Performance por Equipe
            </CardTitle>
            <CardDescription>Métricas comparativas entre equipes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Equipe</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Tempo Médio</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Taxa Alta</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Evoluções</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.map((team, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{team.team}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={team.avgStay < 5 ? 'text-green-600' : 'text-amber-600'}>
                          {team.avgStay} dias
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={team.dischargeRate >= 90 ? 'text-green-600' : 'text-amber-600'}>
                          {team.dischargeRate}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">{team.evolutions}</td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {[...Array(5)].map((_, j) => (
                            <div 
                              key={j}
                              className={`w-2 h-2 rounded-full ${
                                j < Math.round((team.dischargeRate / 100) * 5) 
                                  ? 'bg-primary' 
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Convênio</CardTitle>
            <CardDescription>Fonte pagadora dos atendimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(analytics?.insuranceStats || [
                { provider: 'SUS', count: 450 },
                { provider: 'Unimed', count: 250 },
                { provider: 'Bradesco', count: 150 },
                { provider: 'Particular', count: 100 },
                { provider: 'Outros', count: 50 },
              ]).map((ins: any, i: number) => (
                <Card key={i} className="bg-muted/30 border-0">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold">{ins.count}</p>
                    <p className="text-xs text-muted-foreground">{ins.provider || 'N/A'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
