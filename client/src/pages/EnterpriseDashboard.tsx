import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Users, 
  FileText, 
  TrendingUp, 
  Building2,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Bed,
  Stethoscope,
  UserCheck,
  UserX,
  RefreshCw
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

// Dados mock para demonstração do dashboard enterprise
const mockHospitalData = {
  name: "Hospital Mater Dei - Contorno",
  network: "Rede Mater Dei",
  totalBeds: 450,
  occupiedBeds: 387,
  totalDoctors: 156,
  activeDoctors: 142,
  totalTeams: 28,
  totalEvolutions: 12847,
  evolutionsToday: 234,
  evolutionsThisMonth: 4521,
  avgEvolutionsPerDoctor: 82.3,
  avgTimePerEvolution: "4:32",
  criticalPatients: 23,
  pendingDischarges: 45,
  avgStayDays: 5.2,
};

const mockDepartmentData = [
  { name: "UTI Adulto", beds: 40, occupied: 38, doctors: 18, evolutions: 1245, avgStay: 8.3 },
  { name: "UTI Neonatal", beds: 25, occupied: 22, doctors: 12, evolutions: 890, avgStay: 12.1 },
  { name: "Clínica Médica", beds: 120, occupied: 98, doctors: 35, evolutions: 3456, avgStay: 4.2 },
  { name: "Cirurgia Geral", beds: 80, occupied: 72, doctors: 28, evolutions: 2134, avgStay: 3.8 },
  { name: "Cardiologia", beds: 60, occupied: 54, doctors: 22, evolutions: 1876, avgStay: 5.5 },
  { name: "Ortopedia", beds: 50, occupied: 41, doctors: 15, evolutions: 1234, avgStay: 4.0 },
  { name: "Pediatria", beds: 45, occupied: 38, doctors: 14, evolutions: 987, avgStay: 3.2 },
  { name: "Maternidade", beds: 30, occupied: 24, doctors: 12, evolutions: 1025, avgStay: 2.1 },
];

const mockTopDoctors = [
  { name: "Dr. Carlos Silva", specialty: "Cardiologia", evolutions: 342, avgTime: "3:45" },
  { name: "Dra. Ana Souza", specialty: "Clínica Médica", evolutions: 298, avgTime: "4:12" },
  { name: "Dr. Pedro Santos", specialty: "UTI", evolutions: 276, avgTime: "5:23" },
  { name: "Dra. Maria Oliveira", specialty: "Cirurgia", evolutions: 254, avgTime: "4:01" },
  { name: "Dr. João Costa", specialty: "Pediatria", evolutions: 231, avgTime: "3:58" },
];

const mockTrendData = {
  evolutionsGrowth: 12.5,
  doctorsGrowth: 8.2,
  avgStayChange: -0.8,
  occupancyChange: 3.2,
};

export default function EnterpriseDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Verificar se usuário tem acesso enterprise
  // Na implementação real, verificar user.plan === 'enterprise'
  const hasAccess = true; // Mock para demonstração

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle>Acesso Enterprise Necessário</CardTitle>
            <CardDescription>
              Este dashboard é exclusivo para hospitais com plano Enterprise.
              Entre em contato para upgrade.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setLocation("/settings")}>
              Ver Planos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{mockHospitalData.name}</h1>
                <p className="text-sm text-muted-foreground">{mockHospitalData.network}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* KPIs Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Médicos Ativos</p>
                  <p className="text-2xl font-bold">{mockHospitalData.activeDoctors}</p>
                  <p className="text-xs text-muted-foreground">de {mockHospitalData.totalDoctors} cadastrados</p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${mockTrendData.doctorsGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {mockTrendData.doctorsGrowth > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(mockTrendData.doctorsGrowth)}%
                </div>
              </div>
              <Progress value={(mockHospitalData.activeDoctors / mockHospitalData.totalDoctors) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Evoluções Hoje</p>
                  <p className="text-2xl font-bold">{mockHospitalData.evolutionsToday}</p>
                  <p className="text-xs text-muted-foreground">{mockHospitalData.evolutionsThisMonth} este mês</p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${mockTrendData.evolutionsGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {mockTrendData.evolutionsGrowth > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(mockTrendData.evolutionsGrowth)}%
                </div>
              </div>
              <Progress value={65} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Ocupação</p>
                  <p className="text-2xl font-bold">{Math.round((mockHospitalData.occupiedBeds / mockHospitalData.totalBeds) * 100)}%</p>
                  <p className="text-xs text-muted-foreground">{mockHospitalData.occupiedBeds} de {mockHospitalData.totalBeds} leitos</p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${mockTrendData.occupancyChange > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {mockTrendData.occupancyChange > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(mockTrendData.occupancyChange)}%
                </div>
              </div>
              <Progress value={(mockHospitalData.occupiedBeds / mockHospitalData.totalBeds) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Médio Internação</p>
                  <p className="text-2xl font-bold">{mockHospitalData.avgStayDays} dias</p>
                  <p className="text-xs text-muted-foreground">média geral</p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${mockTrendData.avgStayChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {mockTrendData.avgStayChange < 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  {Math.abs(mockTrendData.avgStayChange)} dias
                </div>
              </div>
              <Progress value={60} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-900">{mockHospitalData.criticalPatients} Pacientes Críticos</p>
                <p className="text-sm text-red-700">Necessitam atenção imediata</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">{mockHospitalData.pendingDischarges} Altas Pendentes</p>
                <p className="text-sm text-amber-700">Aguardando liberação</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900">{mockHospitalData.totalTeams} Equipes Ativas</p>
                <p className="text-sm text-green-700">Todas operacionais</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Análise */}
        <Tabs defaultValue="departments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="departments">Por Departamento</TabsTrigger>
            <TabsTrigger value="doctors">Por Médico</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Desempenho por Departamento</CardTitle>
                    <CardDescription>Métricas de ocupação e produtividade</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar departamento..." className="pl-10 w-64" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium">Departamento</th>
                        <th className="pb-3 font-medium text-center">Leitos</th>
                        <th className="pb-3 font-medium text-center">Ocupação</th>
                        <th className="pb-3 font-medium text-center">Médicos</th>
                        <th className="pb-3 font-medium text-center">Evoluções</th>
                        <th className="pb-3 font-medium text-center">Média Internação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockDepartmentData.map((dept, index) => (
                        <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-medium">{dept.name}</td>
                          <td className="py-3 text-center">{dept.occupied}/{dept.beds}</td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Progress value={(dept.occupied / dept.beds) * 100} className="w-20 h-2" />
                              <span className="text-sm">{Math.round((dept.occupied / dept.beds) * 100)}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-center">{dept.doctors}</td>
                          <td className="py-3 text-center">{dept.evolutions.toLocaleString()}</td>
                          <td className="py-3 text-center">{dept.avgStay} dias</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctors" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top Médicos por Produtividade</CardTitle>
                    <CardDescription>Ranking de evoluções no período</CardDescription>
                  </div>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {mockDepartmentData.map((dept, i) => (
                        <SelectItem key={i} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTopDoctors.map((doctor, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{doctor.evolutions}</p>
                        <p className="text-xs text-muted-foreground">evoluções</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{doctor.avgTime}</p>
                        <p className="text-xs text-muted-foreground">tempo médio</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Evoluções por Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {[180, 210, 195, 230, 245, 220, 234].map((value, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-primary/80 rounded-t"
                          style={{ height: `${(value / 250) * 100}%` }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Distribuição por Especialidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Clínica Médica", value: 35, color: "bg-blue-500" },
                      { name: "Cirurgia", value: 25, color: "bg-green-500" },
                      { name: "UTI", value: 20, color: "bg-red-500" },
                      { name: "Cardiologia", value: 12, color: "bg-purple-500" },
                      { name: "Outros", value: 8, color: "bg-gray-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="flex-1 text-sm">{item.name}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Métricas de Qualidade */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Qualidade</CardTitle>
            <CardDescription>Indicadores de performance do hospital</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{mockHospitalData.avgEvolutionsPerDoctor}</div>
                <p className="text-sm text-muted-foreground">Evoluções/Médico (mês)</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{mockHospitalData.avgTimePerEvolution}</div>
                <p className="text-sm text-muted-foreground">Tempo Médio/Evolução</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">98.2%</div>
                <p className="text-sm text-muted-foreground">Evoluções Completas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">4.8</div>
                <p className="text-sm text-muted-foreground">Satisfação Médicos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
