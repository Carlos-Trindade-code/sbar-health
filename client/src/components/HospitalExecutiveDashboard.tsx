import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Users,
  Bed,
  Clock,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  DollarSign,
  Package,
  Stethoscope,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  Shield
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend, Area, AreaChart 
} from 'recharts';

// Mock data for hospital dashboard
const occupancyData = [
  { unit: 'UTI', total: 20, occupied: 18, rate: 90 },
  { unit: 'Enfermaria', total: 80, occupied: 65, rate: 81 },
  { unit: 'Emergência', total: 30, occupied: 28, rate: 93 },
  { unit: 'Centro Cirúrgico', total: 8, occupied: 5, rate: 63 },
];

const outcomesByTeam = [
  { team: 'Cardiologia', highSuccess: 92, avgStay: 4.2, readmission: 3.5, mortality: 1.2 },
  { team: 'Pneumologia', highSuccess: 88, avgStay: 5.8, readmission: 5.2, mortality: 2.1 },
  { team: 'Clínica Médica', highSuccess: 85, avgStay: 6.1, readmission: 4.8, mortality: 1.8 },
  { team: 'Cirurgia Geral', highSuccess: 95, avgStay: 3.5, readmission: 2.1, mortality: 0.8 },
  { team: 'Neurologia', highSuccess: 82, avgStay: 7.2, readmission: 6.5, mortality: 3.2 },
];

const monthlyTrend = [
  { month: 'Ago', admissions: 320, discharges: 305, occupancy: 85 },
  { month: 'Set', admissions: 345, discharges: 330, occupancy: 87 },
  { month: 'Out', admissions: 380, discharges: 365, occupancy: 89 },
  { month: 'Nov', admissions: 365, discharges: 370, occupancy: 88 },
  { month: 'Dez', admissions: 340, discharges: 355, occupancy: 86 },
  { month: 'Jan', admissions: 358, discharges: 342, occupancy: 88 },
];

const resourceConsumption = [
  { category: 'Medicamentos', current: 125000, budget: 150000, variance: -17 },
  { category: 'Material Hospitalar', current: 85000, budget: 90000, variance: -6 },
  { category: 'Exames Laboratoriais', current: 45000, budget: 40000, variance: 13 },
  { category: 'Imagem', current: 62000, budget: 65000, variance: -5 },
  { category: 'Equipamentos', current: 28000, budget: 30000, variance: -7 },
];

const complicationsByDoctor = [
  { name: 'Dr. Carlos', surgeries: 45, complications: 2, rate: 4.4 },
  { name: 'Dra. Ana', surgeries: 38, complications: 1, rate: 2.6 },
  { name: 'Dr. Roberto', surgeries: 52, complications: 3, rate: 5.8 },
  { name: 'Dra. Fernanda', surgeries: 41, complications: 1, rate: 2.4 },
  { name: 'Dr. João', surgeries: 35, complications: 2, rate: 5.7 },
];

const insuranceDistribution = [
  { name: 'SUS', value: 45, color: '#0d9488', revenue: 180000 },
  { name: 'Unimed', value: 25, color: '#f59e0b', revenue: 320000 },
  { name: 'Bradesco', value: 15, color: '#3b82f6', revenue: 210000 },
  { name: 'Particular', value: 10, color: '#8b5cf6', revenue: 150000 },
  { name: 'Outros', value: 5, color: '#6b7280', revenue: 75000 },
];

interface HospitalExecutiveDashboardProps {
  isDemo?: boolean;
  hospitalId?: number;
}

export default function HospitalExecutiveDashboard({ isDemo = false, hospitalId }: HospitalExecutiveDashboardProps) {
  const [period, setPeriod] = useState('month');
  const [selectedUnit, setSelectedUnit] = useState('all');

  const handleExportReport = () => {
    toast.success("Relatório gerado!", {
      description: "O download começará em instantes."
    });
  };

  const KPICard = ({ 
    title, 
    value, 
    change, 
    changeType, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: string; 
    change: string; 
    changeType: 'positive' | 'negative' | 'neutral';
    icon: any;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <div className={`flex items-center gap-1 mt-1 text-sm ${
              changeType === 'positive' ? 'text-green-600' :
              changeType === 'negative' ? 'text-red-600' :
              'text-muted-foreground'
            }`}>
              {changeType === 'positive' ? <ArrowUpRight className="w-4 h-4" /> :
               changeType === 'negative' ? <ArrowDownRight className="w-4 h-4" /> : null}
              <span>{change}</span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Dashboard Executivo
          </h2>
          <p className="text-muted-foreground">Hospital São Lucas - Visão Gerencial</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard 
          title="Taxa de Ocupação" 
          value="87%" 
          change="+2.3% vs mês anterior"
          changeType="positive"
          icon={Bed}
          color="bg-blue-500"
        />
        <KPICard 
          title="Tempo Médio Internação" 
          value="4.8 dias" 
          change="-0.5 dias vs meta"
          changeType="positive"
          icon={Clock}
          color="bg-green-500"
        />
        <KPICard 
          title="Taxa de Reinternação" 
          value="4.2%" 
          change="+0.3% vs mês anterior"
          changeType="negative"
          icon={Activity}
          color="bg-amber-500"
        />
        <KPICard 
          title="Satisfação Paciente" 
          value="4.6/5" 
          change="+0.2 vs mês anterior"
          changeType="positive"
          icon={Heart}
          color="bg-purple-500"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="teams">Por Equipe</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="quality">Qualidade</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Occupancy by Unit */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ocupação por Unidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {occupancyData.map((unit) => (
                    <div key={unit.unit}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{unit.unit}</span>
                        <span className={unit.rate > 90 ? 'text-red-600' : unit.rate > 80 ? 'text-amber-600' : 'text-green-600'}>
                          {unit.occupied}/{unit.total} ({unit.rate}%)
                        </span>
                      </div>
                      <Progress 
                        value={unit.rate} 
                        className={unit.rate > 90 ? 'bg-red-100' : unit.rate > 80 ? 'bg-amber-100' : 'bg-green-100'}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tendência Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="admissions" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Admissões" />
                    <Area type="monotone" dataKey="discharges" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Altas" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Insurance Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Distribuição por Convênio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={insuranceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {insuranceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
                
                <div className="space-y-3">
                  {insuranceDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{item.value}%</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          R$ {(item.revenue / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Desempenho por Equipe</CardTitle>
              <CardDescription>Métricas agregadas e anonimizadas por equipe médica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium">Equipe</th>
                      <th className="text-center py-3 px-2 text-sm font-medium">Taxa de Sucesso</th>
                      <th className="text-center py-3 px-2 text-sm font-medium">Tempo Médio</th>
                      <th className="text-center py-3 px-2 text-sm font-medium">Reinternação</th>
                      <th className="text-center py-3 px-2 text-sm font-medium">Mortalidade</th>
                      <th className="text-center py-3 px-2 text-sm font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outcomesByTeam.map((team, index) => {
                      const score = (team.highSuccess * 0.4) + ((10 - team.avgStay) * 3) + ((10 - team.readmission) * 2) + ((5 - team.mortality) * 4);
                      return (
                        <tr key={team.team} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {index === 0 && <Badge className="bg-amber-500">Top</Badge>}
                              <span className="font-medium">{team.team}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className={team.highSuccess >= 90 ? 'text-green-600 font-medium' : ''}>
                              {team.highSuccess}%
                            </span>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className={team.avgStay <= 4 ? 'text-green-600 font-medium' : team.avgStay >= 6 ? 'text-amber-600' : ''}>
                              {team.avgStay} dias
                            </span>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className={team.readmission <= 3 ? 'text-green-600 font-medium' : team.readmission >= 5 ? 'text-red-600' : ''}>
                              {team.readmission}%
                            </span>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className={team.mortality <= 1 ? 'text-green-600 font-medium' : team.mortality >= 3 ? 'text-red-600' : ''}>
                              {team.mortality}%
                            </span>
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge variant={score >= 70 ? 'default' : score >= 60 ? 'secondary' : 'outline'}>
                              {score.toFixed(0)}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Team Comparison Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Comparativo de Equipes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={outcomesByTeam} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="team" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="highSuccess" fill="#10b981" name="Taxa de Sucesso %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Consumo de Recursos
              </CardTitle>
              <CardDescription>Comparativo orçado vs realizado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resourceConsumption.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.category}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          R$ {(item.current / 1000).toFixed(0)}k / R$ {(item.budget / 1000).toFixed(0)}k
                        </span>
                        <Badge variant={item.variance < 0 ? 'default' : 'destructive'} className={item.variance < 0 ? 'bg-green-500' : ''}>
                          {item.variance > 0 ? '+' : ''}{item.variance}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={(item.current / item.budget) * 100} />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Total Consumido</p>
                    <p className="text-2xl font-bold">R$ 345.000</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Orçamento Total</p>
                    <p className="text-2xl font-bold">R$ 375.000</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Economia</p>
                    <p className="text-2xl font-bold text-green-600">R$ 30.000</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Complications by Surgeon */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Taxa de Complicações Cirúrgicas
                </CardTitle>
                <CardDescription>Dados agregados por cirurgião (anonimizado para gestão)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complicationsByDoctor.map((doctor) => (
                    <div key={doctor.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">{doctor.surgeries} cirurgias</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${doctor.rate <= 3 ? 'text-green-600' : doctor.rate >= 5 ? 'text-amber-600' : ''}`}>
                          {doctor.rate}%
                        </p>
                        <p className="text-xs text-muted-foreground">{doctor.complications} complicações</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Média do hospital: 4.2%</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Meta ANS: &lt; 5%</p>
                </div>
              </CardContent>
            </Card>

            {/* Quality Indicators */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Indicadores de Qualidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span>Infecção Hospitalar</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600">2.1%</span>
                      <span className="text-xs text-muted-foreground ml-2">Meta: &lt;3%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span>Queda de Pacientes</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600">0.8%</span>
                      <span className="text-xs text-muted-foreground ml-2">Meta: &lt;1%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span>Lesão por Pressão</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-600">1.8%</span>
                      <span className="text-xs text-muted-foreground ml-2">Meta: &lt;1.5%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span>Erro de Medicação</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600">0.3%</span>
                      <span className="text-xs text-muted-foreground ml-2">Meta: &lt;0.5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certifications */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certificações e Acreditações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="font-medium">ONA Nível 3</p>
                  <p className="text-xs text-muted-foreground">Excelência</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl mb-2">⭐</div>
                  <p className="font-medium">JCI</p>
                  <p className="text-xs text-muted-foreground">Acreditado</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl mb-2">🛡️</div>
                  <p className="font-medium">ISO 9001</p>
                  <p className="text-xs text-muted-foreground">Certificado</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-3xl mb-2">🌟</div>
                  <p className="font-medium">HIMSS 6</p>
                  <p className="text-xs text-muted-foreground">Em progresso</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
