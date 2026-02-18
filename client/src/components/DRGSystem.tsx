import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  Building2,
  Calculator,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Hospital,
  Layers,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Stethoscope,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Zap
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend, ReferenceLine,
  ComposedChart, Area
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

// ==================== DADOS DE REFERÊNCIA DRG ====================

// Tabela CID-10 simplificada (principais códigos)
const CID10_CODES = [
  { code: "J18.9", description: "Pneumonia não especificada", mdc: "04" },
  { code: "I21.0", description: "IAM parede anterior", mdc: "05" },
  { code: "I50.0", description: "Insuficiência cardíaca congestiva", mdc: "05" },
  { code: "K80.0", description: "Colelitíase com colecistite aguda", mdc: "07" },
  { code: "N39.0", description: "Infecção do trato urinário", mdc: "11" },
  { code: "A41.9", description: "Sepse não especificada", mdc: "18" },
  { code: "E11.9", description: "Diabetes mellitus tipo 2", mdc: "10" },
  { code: "J44.1", description: "DPOC com exacerbação aguda", mdc: "04" },
  { code: "I63.9", description: "AVC isquêmico", mdc: "01" },
  { code: "K35.8", description: "Apendicite aguda", mdc: "06" },
];

// Comorbidades (CC e MCC)
const COMORBIDITIES = {
  cc: [ // Complication or Comorbidity
    { code: "E11.9", description: "Diabetes mellitus tipo 2", weight: 0.3 },
    { code: "I10", description: "Hipertensão essencial", weight: 0.2 },
    { code: "J44.9", description: "DPOC", weight: 0.4 },
    { code: "N18.3", description: "DRC estágio 3", weight: 0.35 },
    { code: "F32.9", description: "Depressão", weight: 0.15 },
  ],
  mcc: [ // Major Complication or Comorbidity
    { code: "A41.9", description: "Sepse", weight: 1.2 },
    { code: "J96.0", description: "Insuficiência respiratória aguda", weight: 1.5 },
    { code: "N17.9", description: "Insuficiência renal aguda", weight: 1.1 },
    { code: "I46.9", description: "Parada cardíaca", weight: 2.0 },
    { code: "R57.0", description: "Choque cardiogênico", weight: 1.8 },
  ]
};

// Procedimentos
const PROCEDURES = [
  { code: "0016070", description: "Colecistectomia videolaparoscópica", weight: 0.8 },
  { code: "0407010", description: "Ventilação mecânica", weight: 1.5 },
  { code: "0406010", description: "Hemodiálise", weight: 0.9 },
  { code: "0301010", description: "Cateterismo cardíaco", weight: 1.2 },
  { code: "0408010", description: "Traqueostomia", weight: 1.3 },
  { code: "0201010", description: "Craniotomia", weight: 2.5 },
];

// Tabela DRG com ALOS e Peso Relativo
const DRG_TABLE = [
  { drg: "193", description: "Pneumonia simples", mdc: "04", alos: 5.2, weight: 0.85, cost: 4500 },
  { drg: "194", description: "Pneumonia com CC", mdc: "04", alos: 7.1, weight: 1.15, cost: 6800 },
  { drg: "195", description: "Pneumonia com MCC", mdc: "04", alos: 9.8, weight: 1.85, cost: 12500 },
  { drg: "280", description: "IAM sem intervenção", mdc: "05", alos: 4.5, weight: 1.25, cost: 8200 },
  { drg: "281", description: "IAM com cateterismo", mdc: "05", alos: 5.8, weight: 2.10, cost: 15800 },
  { drg: "282", description: "IAM com MCC", mdc: "05", alos: 8.2, weight: 2.85, cost: 22500 },
  { drg: "417", description: "Colecistectomia VLP", mdc: "07", alos: 2.1, weight: 0.95, cost: 5200 },
  { drg: "418", description: "Colecistectomia com CC", mdc: "07", alos: 4.5, weight: 1.35, cost: 8500 },
  { drg: "871", description: "Sepse sem VM", mdc: "18", alos: 6.5, weight: 1.55, cost: 11200 },
  { drg: "872", description: "Sepse com VM", mdc: "18", alos: 12.8, weight: 3.25, cost: 35000 },
];

// MDC (Major Diagnostic Categories)
const MDC_CATEGORIES = [
  { code: "01", name: "Sistema Nervoso", icon: "🧠" },
  { code: "04", name: "Sistema Respiratório", icon: "🫁" },
  { code: "05", name: "Sistema Circulatório", icon: "❤️" },
  { code: "06", name: "Sistema Digestivo", icon: "🫃" },
  { code: "07", name: "Sistema Hepatobiliar", icon: "🫀" },
  { code: "10", name: "Endócrino/Metabólico", icon: "⚗️" },
  { code: "11", name: "Sistema Urinário", icon: "🫘" },
  { code: "18", name: "Infecciosas/Parasitárias", icon: "🦠" },
];

// ==================== DADOS MOCK DE PACIENTES ====================

const mockPatientsDRG = [
  {
    id: 1,
    name: "Maria Silva Santos",
    bed: "UTI-01",
    admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    cidPrincipal: "J18.9",
    cidsSecundarios: ["E11.9", "I10"],
    procedures: ["0407010"],
    age: 68,
    sex: "F",
    drg: "195",
    drgDescription: "Pneumonia com MCC",
    weightRelative: 1.85,
    alosExpected: 9.8,
    actualStay: 3,
    costExpected: 12500,
    costActual: 4200,
    status: "internado",
    hasMCC: true,
    hasCC: true,
    physician: "Dr. Paulo Mendes",
    team: "UTI Adulto"
  },
  {
    id: 2,
    name: "João Pedro Oliveira",
    bed: "UCO-02",
    admissionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    cidPrincipal: "I21.0",
    cidsSecundarios: ["E11.9"],
    procedures: ["0301010"],
    age: 55,
    sex: "M",
    drg: "281",
    drgDescription: "IAM com cateterismo",
    weightRelative: 2.10,
    alosExpected: 5.8,
    actualStay: 6,
    costExpected: 15800,
    costActual: 18200,
    status: "outlier",
    hasMCC: false,
    hasCC: true,
    physician: "Dra. Ana Costa",
    team: "Cardiologia"
  },
  {
    id: 3,
    name: "Ana Costa Ferreira",
    bed: "ENF-12",
    admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    cidPrincipal: "K80.0",
    cidsSecundarios: [],
    procedures: ["0016070"],
    age: 45,
    sex: "F",
    drg: "417",
    drgDescription: "Colecistectomia VLP",
    weightRelative: 0.95,
    alosExpected: 2.1,
    actualStay: 2,
    costExpected: 5200,
    costActual: 4800,
    status: "alta_prevista",
    hasMCC: false,
    hasCC: false,
    physician: "Dr. Ricardo Lima",
    team: "Cirurgia Geral"
  },
  {
    id: 4,
    name: "Carlos Eduardo Santos",
    bed: "UTI-03",
    admissionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    cidPrincipal: "A41.9",
    cidsSecundarios: ["J96.0", "N17.9"],
    procedures: ["0407010", "0406010"],
    age: 72,
    sex: "M",
    drg: "872",
    drgDescription: "Sepse com VM",
    weightRelative: 3.25,
    alosExpected: 12.8,
    actualStay: 10,
    costExpected: 35000,
    costActual: 42000,
    status: "critico",
    hasMCC: true,
    hasCC: true,
    physician: "Dra. Juliana Reis",
    team: "UTI Adulto"
  },
  {
    id: 5,
    name: "Fernanda Oliveira",
    bed: "ENF-08",
    admissionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    cidPrincipal: "N39.0",
    cidsSecundarios: ["E11.9"],
    procedures: [],
    age: 58,
    sex: "F",
    drg: "690",
    drgDescription: "ITU com CC",
    weightRelative: 0.75,
    alosExpected: 4.2,
    actualStay: 4,
    costExpected: 3800,
    costActual: 3500,
    status: "alta_prevista",
    hasMCC: false,
    hasCC: true,
    physician: "Dr. Bruno Santos",
    team: "Clínica Médica"
  }
];

// ==================== COMPONENTE PRINCIPAL ====================

interface DRGSystemProps {
  isDemo?: boolean;
}

export default function DRGSystem({ isDemo = false }: DRGSystemProps) {
  const [patients, setPatients] = useState(mockPatientsDRG);
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatientsDRG[0] | null>(null);
  const [viewMode, setViewMode] = useState<'hospitalar' | 'clinico'>('hospitalar');
  const [filterMDC, setFilterMDC] = useState<string>('all');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [showCodingModal, setShowCodingModal] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Calcular KPIs
  const totalPatients = patients.length;
  const outliersCount = patients.filter(p => p.actualStay > p.alosExpected).length;
  const avgCMI = patients.reduce((acc, p) => acc + p.weightRelative, 0) / totalPatients;
  const totalCostExpected = patients.reduce((acc, p) => acc + p.costExpected, 0);
  const totalCostActual = patients.reduce((acc, p) => acc + p.costActual, 0);
  const costVariance = ((totalCostActual - totalCostExpected) / totalCostExpected) * 100;

  // Gerar alertas de desvio
  useEffect(() => {
    const newAlerts = patients
      .filter(p => p.actualStay >= p.alosExpected && p.status !== 'alta_prevista')
      .map(p => ({
        id: p.id,
        patient: p.name,
        bed: p.bed,
        type: p.actualStay > p.alosExpected * 1.2 ? 'critical' : 'warning',
        message: `Permanência ${p.actualStay} dias (esperado: ${p.alosExpected.toFixed(1)})`
      }));
    setAlerts(newAlerts);
  }, [patients]);

  // Dados para gráficos
  const mdcDistribution = MDC_CATEGORIES.map(mdc => ({
    name: mdc.name,
    value: patients.filter(p => {
      const cid = CID10_CODES.find(c => c.code === p.cidPrincipal);
      return cid?.mdc === mdc.code;
    }).length
  })).filter(d => d.value > 0);

  const stayComparison = patients.map(p => ({
    name: p.name.split(' ')[0],
    esperado: p.alosExpected,
    real: p.actualStay,
    variance: ((p.actualStay - p.alosExpected) / p.alosExpected) * 100
  }));

  const costComparison = patients.map(p => ({
    name: p.name.split(' ')[0],
    esperado: p.costExpected,
    real: p.costActual,
    variance: ((p.costActual - p.costExpected) / p.costExpected) * 100
  }));

  const teamPerformance = [
    { team: "UTI Adulto", cmi: 2.55, avgStay: 6.5, alosRatio: 0.92, patients: 2 },
    { team: "Cardiologia", cmi: 2.10, avgStay: 6.0, alosRatio: 1.03, patients: 1 },
    { team: "Cirurgia Geral", cmi: 0.95, avgStay: 2.0, alosRatio: 0.95, patients: 1 },
    { team: "Clínica Médica", cmi: 0.75, avgStay: 4.0, alosRatio: 0.95, patients: 1 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critico': return 'bg-red-500';
      case 'outlier': return 'bg-orange-500';
      case 'alta_prevista': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critico': return 'destructive';
      case 'outlier': return 'warning' as any;
      case 'alta_prevista': return 'default';
      default: return 'secondary';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // ==================== RENDERIZAÇÃO ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Sistema DRG
          </h2>
          <p className="text-muted-foreground">
            Diagnosis Related Groups - Gestão por Valor
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="hospitalar" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Gestor Hospitalar
              </TabsTrigger>
              <TabsTrigger value="clinico" className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Líder Clínico
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Badge variant="outline">{isDemo ? "DEMO" : "LIVE"}</Badge>
        </div>
      </div>

      {/* Alertas de Desvio (Variance Tracking) */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-orange-800">
                {alerts.length} paciente(s) com permanência acima do esperado
              </p>
              <p className="text-sm text-orange-600">
                {alerts.filter(a => a.type === 'critical').length} críticos, {alerts.filter(a => a.type === 'warning').length} em atenção
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info("Relatório de outliers gerado")}>
              <FileText className="w-4 h-4 mr-2" />
              Ver Relatório
            </Button>
          </div>
        </motion.div>
      )}

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pacientes DRG</p>
                <p className="text-2xl font-bold">{totalPatients}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className={avgCMI > 1.5 ? "border-blue-300 bg-blue-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Case-Mix Index</p>
                <p className="text-2xl font-bold text-blue-600">{avgCMI.toFixed(2)}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgCMI > 1.5 ? "Alta complexidade" : avgCMI > 1.0 ? "Média complexidade" : "Baixa complexidade"}
            </p>
          </CardContent>
        </Card>

        <Card className={outliersCount > 0 ? "border-orange-300 bg-orange-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outliers</p>
                <p className={`text-2xl font-bold ${outliersCount > 0 ? 'text-orange-600' : ''}`}>
                  {outliersCount}
                </p>
              </div>
              <AlertCircle className={`w-8 h-8 ${outliersCount > 0 ? 'text-orange-500' : 'text-muted-foreground opacity-50'}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Acima do ALOS esperado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Esperado</p>
                <p className="text-xl font-bold">{formatCurrency(totalCostExpected)}</p>
              </div>
              <Calculator className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className={costVariance > 10 ? "border-red-300 bg-red-50" : costVariance < -10 ? "border-green-300 bg-green-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Variância Custo</p>
                <p className={`text-xl font-bold flex items-center gap-1 ${
                  costVariance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {costVariance > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {costVariance > 0 ? '+' : ''}{costVariance.toFixed(1)}%
                </p>
              </div>
              <DollarSign className={`w-8 h-8 ${costVariance > 0 ? 'text-red-500' : 'text-green-500'} opacity-50`} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Real: {formatCurrency(totalCostActual)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal baseado na Visão */}
      {viewMode === 'hospitalar' ? (
        // ==================== VISÃO GESTOR HOSPITALAR ====================
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Distribuição por MDC */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Distribuição por MDC
                </CardTitle>
                <CardDescription>
                  Major Diagnostic Categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={mdcDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mdcDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Custo Real vs DRG */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Custo Real vs Custo DRG
                </CardTitle>
                <CardDescription>
                  Comparação de eficiência financeira
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={costComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="esperado" name="Custo DRG" fill="#8884d8" />
                    <Bar dataKey="real" name="Custo Real" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Rentabilidade por Equipe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance por Equipe
              </CardTitle>
              <CardDescription>
                Case-Mix Index e eficiência de permanência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Equipe</th>
                      <th className="text-center p-2">Pacientes</th>
                      <th className="text-center p-2">CMI</th>
                      <th className="text-center p-2">Perm. Média</th>
                      <th className="text-center p-2">ALOS Ratio</th>
                      <th className="text-center p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPerformance.map((team, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{team.team}</td>
                        <td className="p-2 text-center">{team.patients}</td>
                        <td className="p-2 text-center">
                          <Badge variant={team.cmi > 2 ? "default" : "secondary"}>
                            {team.cmi.toFixed(2)}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">{team.avgStay.toFixed(1)} dias</td>
                        <td className="p-2 text-center">
                          <span className={`flex items-center justify-center gap-1 ${
                            team.alosRatio > 1 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {team.alosRatio > 1 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {team.alosRatio.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant={team.alosRatio <= 1 ? "default" : "destructive"}>
                            {team.alosRatio <= 1 ? "Eficiente" : "Atenção"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // ==================== VISÃO LÍDER CLÍNICO ====================
        <div className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={filterTeam} onValueChange={setFilterTeam}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as equipes</SelectItem>
                      <SelectItem value="uti">UTI Adulto</SelectItem>
                      <SelectItem value="cardio">Cardiologia</SelectItem>
                      <SelectItem value="cirurgia">Cirurgia Geral</SelectItem>
                      <SelectItem value="clinica">Clínica Médica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowCodingModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Codificação em Tempo Real
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Permanência Real vs Esperada */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Permanência Real vs ALOS Esperado
              </CardTitle>
              <CardDescription>
                Identificação de outliers por paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={stayComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="esperado" name="ALOS Esperado" fill="#8884d8" />
                  <Bar dataKey="real" name="Permanência Real" fill="#82ca9d" />
                  <ReferenceLine y={0} stroke="#000" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lista de Pacientes com DRG */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pacientes Internados
              </CardTitle>
              <CardDescription>
                Clique para ver detalhes e codificação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {patients.map(patient => (
                <div
                  key={patient.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    patient.status === 'critico' ? 'border-red-300 bg-red-50' :
                    patient.status === 'outlier' ? 'border-orange-300 bg-orange-50' :
                    patient.status === 'alta_prevista' ? 'border-green-300 bg-green-50' : ''
                  }`}
                  onClick={() => setSelectedPatient(selectedPatient?.id === patient.id ? null : patient)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-12 rounded-full ${getStatusColor(patient.status)}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{patient.name}</span>
                          <Badge variant="outline">{patient.bed}</Badge>
                          <Badge variant={getStatusBadge(patient.status)}>
                            {patient.status === 'alta_prevista' ? 'Alta Prevista' : 
                             patient.status === 'outlier' ? 'Outlier' :
                             patient.status === 'critico' ? 'Crítico' : 'Internado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          DRG {patient.drg}: {patient.drgDescription}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>CID: {patient.cidPrincipal}</span>
                          <span>Peso: {patient.weightRelative.toFixed(2)}</span>
                          <span>{patient.physician}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Permanência</p>
                        <p className={`font-bold ${patient.actualStay > patient.alosExpected ? 'text-red-600' : 'text-green-600'}`}>
                          {patient.actualStay} / {patient.alosExpected.toFixed(1)} dias
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Custo</p>
                        <p className={`font-bold ${patient.costActual > patient.costExpected ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(patient.costActual)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {patient.hasMCC && <Badge className="bg-red-100 text-red-800">MCC</Badge>}
                        {patient.hasCC && !patient.hasMCC && <Badge className="bg-yellow-100 text-yellow-800">CC</Badge>}
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform ${selectedPatient?.id === patient.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Detalhes Expandidos */}
                  <AnimatePresence>
                    {selectedPatient?.id === patient.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <Separator className="my-4" />
                        <div className="grid md:grid-cols-3 gap-4">
                          {/* Inputs DRG */}
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Inputs (Codificação)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">CID-10 Principal:</span>
                                <Badge variant="outline" className="ml-2">{patient.cidPrincipal}</Badge>
                              </div>
                              <div>
                                <span className="text-muted-foreground">CIDs Secundários:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {patient.cidsSecundarios.length > 0 ? 
                                    patient.cidsSecundarios.map(cid => (
                                      <Badge key={cid} variant="secondary">{cid}</Badge>
                                    )) : 
                                    <span className="text-muted-foreground">Nenhum</span>
                                  }
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Procedimentos:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {patient.procedures.length > 0 ? 
                                    patient.procedures.map(proc => (
                                      <Badge key={proc} variant="secondary">{proc}</Badge>
                                    )) : 
                                    <span className="text-muted-foreground">Nenhum</span>
                                  }
                                </div>
                              </div>
                              <div className="flex gap-4">
                                <span><span className="text-muted-foreground">Idade:</span> {patient.age}</span>
                                <span><span className="text-muted-foreground">Sexo:</span> {patient.sex}</span>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Outputs DRG */}
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Outputs (DRG)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">DRG:</span>
                                <Badge>{patient.drg}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Peso Relativo:</span>
                                <span className="font-bold">{patient.weightRelative.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">ALOS Esperado:</span>
                                <span>{patient.alosExpected.toFixed(1)} dias</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Custo Esperado:</span>
                                <span>{formatCurrency(patient.costExpected)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Severidade:</span>
                                {patient.hasMCC ? 
                                  <Badge variant="destructive">MCC</Badge> :
                                  patient.hasCC ?
                                  <Badge className="bg-yellow-100 text-yellow-800">CC</Badge> :
                                  <Badge variant="secondary">Sem CC</Badge>
                                }
                              </div>
                            </CardContent>
                          </Card>

                          {/* Ações */}
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Ações</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => toast.success("Codificação atualizada")}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Atualizar Codificação
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => toast.info("Alta programada")}
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Programar Alta
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => toast.info("Relatório gerado")}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Gerar Relatório
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fórmula DRG */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <Calculator className="w-5 h-5 text-primary" />
            <div>
              <p className="font-mono font-bold">
                Paciente + Diagnóstico + Complexidade = DRG
              </p>
              <p className="font-mono text-muted-foreground">
                DRG = Previsão de Tempo + Previsão de Custo + Meta de Qualidade
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
