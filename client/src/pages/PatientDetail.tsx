import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, User, Calendar, MapPin, Heart, AlertTriangle,
  FileText, Clock, Activity, Stethoscope, ChevronDown, ChevronUp,
  Plus, Phone, Droplets, Pill, Brain, Printer
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  critical: { label: "Crítico", color: "text-red-700 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" },
  high: { label: "Alto", color: "text-orange-700 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  medium: { label: "Médio", color: "text-yellow-700 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
  low: { label: "Baixo", color: "text-green-700 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Ativo", color: "bg-emerald-500" },
  discharged: { label: "Alta", color: "bg-blue-500" },
  transferred: { label: "Transferido", color: "bg-purple-500" },
  deceased: { label: "Óbito", color: "bg-gray-500" },
  archived: { label: "Arquivado", color: "bg-gray-400" },
};

function EvolutionCard({ evolution, isExpanded, onToggle }: { 
  evolution: any; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  const timeAgo = evolution.createdAt 
    ? formatDistanceToNow(new Date(evolution.createdAt), { addSuffix: true, locale: ptBR })
    : "";

  return (
    <Card className={`transition-all ${evolution.isDraft ? 'border-dashed border-yellow-400 dark:border-yellow-600' : ''}`}>
      <CardHeader className="pb-2 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${evolution.isDraft ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-primary/10'}`}>
              <FileText className={`w-5 h-5 ${evolution.isDraft ? 'text-yellow-600 dark:text-yellow-400' : 'text-primary'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {evolution.isDraft ? "Rascunho" : "Evolução SBAR"}
                </span>
                {evolution.isDraft && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-400 text-xs">Rascunho</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{timeAgo}</span>
                {evolution.author && (
                  <>
                    <span>•</span>
                    <span>{evolution.author.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evolution.situation && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">S</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Situação</span>
                </div>
                <p className="text-sm pl-8 text-foreground">{evolution.situation}</p>
              </div>
            )}
            {evolution.background && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">B</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Background</span>
                </div>
                <p className="text-sm pl-8 text-foreground">{evolution.background}</p>
              </div>
            )}
            {evolution.assessment && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">A</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avaliação</span>
                </div>
                <p className="text-sm pl-8 text-foreground">{evolution.assessment}</p>
              </div>
            )}
            {evolution.recommendation && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">R</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recomendação</span>
                </div>
                <p className="text-sm pl-8 text-foreground">{evolution.recommendation}</p>
              </div>
            )}
          </div>
          
          {evolution.vitalSigns && Object.keys(evolution.vitalSigns).length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Sinais Vitais
                </span>
                <div className="flex flex-wrap gap-3">
                  {evolution.vitalSigns.temperature && (
                    <Badge variant="outline" className="text-xs">🌡️ {evolution.vitalSigns.temperature}°C</Badge>
                  )}
                  {evolution.vitalSigns.heartRate && (
                    <Badge variant="outline" className="text-xs">❤️ {evolution.vitalSigns.heartRate} bpm</Badge>
                  )}
                  {evolution.vitalSigns.bloodPressure && (
                    <Badge variant="outline" className="text-xs">🩺 {evolution.vitalSigns.bloodPressure} mmHg</Badge>
                  )}
                  {evolution.vitalSigns.respiratoryRate && (
                    <Badge variant="outline" className="text-xs">🫁 {evolution.vitalSigns.respiratoryRate} irpm</Badge>
                  )}
                  {evolution.vitalSigns.oxygenSaturation && (
                    <Badge variant="outline" className="text-xs">O₂ {evolution.vitalSigns.oxygenSaturation}%</Badge>
                  )}
                  {evolution.vitalSigns.painLevel !== undefined && (
                    <Badge variant="outline" className="text-xs">😣 Dor: {evolution.vitalSigns.painLevel}/10</Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function AdmissionSection({ admission, defaultExpanded = false }: { admission: any; defaultExpanded?: boolean }) {
  const [, setLocation] = useLocation();
  const { data: evolutions, isLoading } = trpc.evolutions.byAdmission.useQuery(
    { admissionId: admission.id },
    { enabled: !!admission.id }
  );
  
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [expandedEvolution, setExpandedEvolution] = useState<number | null>(null);
  
  const status = statusConfig[admission.status] || statusConfig.active;
  const priority = priorityConfig[admission.priority] || priorityConfig.medium;
  
  const daysInternado = useMemo(() => {
    const admDate = new Date(admission.admissionDate);
    const endDate = admission.dischargeDate ? new Date(admission.dischargeDate) : new Date();
    return Math.floor((endDate.getTime() - admDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [admission.admissionDate, admission.dischargeDate]);

  const nonDraftEvolutions = evolutions?.filter((e: any) => !e.isDraft) || [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="cursor-pointer pb-3" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-10 rounded-full ${status.color}`} />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Internação #{admission.id}</CardTitle>
                <Badge variant="outline" className={`text-xs ${priority.color} ${priority.bgColor}`}>
                  {priority.label}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(admission.admissionDate).toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {admission.bed}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {daysInternado} dia{daysInternado !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {admission.status === 'active' && (
              <Button 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); setLocation(`/evolution/${admission.id}`); }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Nova Evolução
              </Button>
            )}
            {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0 space-y-4">
          <Separator />
          
          {/* Admission Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Diagnóstico</span>
              <p className="font-medium">{admission.mainDiagnosis || "Não informado"}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Equipe</span>
              <p className="font-medium">{admission.team?.name || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Hospital</span>
              <p className="font-medium">{admission.hospital?.name || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Convênio</span>
              <p className="font-medium">{admission.insuranceProvider || "Não informado"}</p>
            </div>
          </div>
          
          {admission.dischargeDate && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Alta em {new Date(admission.dischargeDate).toLocaleDateString('pt-BR')}
                {admission.dischargeType && ` — ${admission.dischargeType === 'improved' ? 'Melhorado' : admission.dischargeType === 'cured' ? 'Curado' : admission.dischargeType === 'transferred' ? 'Transferido' : admission.dischargeType === 'deceased' ? 'Óbito' : 'Outro'}`}
              </span>
            </div>
          )}
          
          {/* Evolutions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Evoluções ({nonDraftEvolutions.length})
              </h4>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : nonDraftEvolutions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma evolução registrada</p>
                {admission.status === 'active' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setLocation(`/evolution/${admission.id}`)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Criar primeira evolução
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {nonDraftEvolutions.map((evo: any) => (
                  <EvolutionCard 
                    key={evo.id} 
                    evolution={evo}
                    isExpanded={expandedEvolution === evo.id}
                    onToggle={() => setExpandedEvolution(expandedEvolution === evo.id ? null : evo.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

async function generatePrintReport(patient: any, admissions: any[], activeAdmission: any) {
  toast.info('Gerando relatório...');
  
  const priorityLabel = (p: string) => ({ critical: 'Crítico', high: 'Alto', medium: 'Médio', low: 'Baixo' }[p] || p);
  const genderLabel = (g: string) => ({ M: 'Masculino', F: 'Feminino', O: 'Outro' }[g] || '');
  
  // Fetch evolutions via tRPC batch endpoint
  let evolutions: any[] = [];
  try {
    const res = await fetch(`/api/trpc/evolutions.byAdmission?batch=1&input=${encodeURIComponent(JSON.stringify({"0":{"json":{"admissionId":activeAdmission.id}}}))}`);  
    const data = await res.json();
    evolutions = data?.[0]?.result?.data?.json || [];
  } catch (e) {
    console.error('Error fetching evolutions for report:', e);
  }
  
  const nonDraftEvos = evolutions.filter((e: any) => !e.isDraft);
  
  const evolutionsHtml = nonDraftEvos.length === 0 
    ? '<p style="color:#999;font-style:italic">Nenhuma evolução registrada para esta internação.</p>'
    : nonDraftEvos.map((evo: any, i: number) => {
      const vs = evo.vitalSigns || {};
      const vitalsHtml = Object.keys(vs).length > 0 ? `
        <div class="vitals">
          ${vs.temperature ? `<span class="vital-item">Temp: ${vs.temperature}°C</span>` : ''}
          ${vs.heartRate ? `<span class="vital-item">FC: ${vs.heartRate} bpm</span>` : ''}
          ${vs.bloodPressure ? `<span class="vital-item">PA: ${vs.bloodPressure} mmHg</span>` : ''}
          ${vs.respiratoryRate ? `<span class="vital-item">FR: ${vs.respiratoryRate} irpm</span>` : ''}
          ${vs.oxygenSaturation ? `<span class="vital-item">SpO2: ${vs.oxygenSaturation}%</span>` : ''}
          ${vs.painLevel !== undefined ? `<span class="vital-item">Dor: ${vs.painLevel}/10</span>` : ''}
        </div>` : '';
      
      return `
        ${i > 0 ? '<div class="evolution-divider"></div>' : ''}
        <div class="timestamp">${evo.createdAt ? new Date(evo.createdAt).toLocaleString('pt-BR') : ''}</div>
        ${vitalsHtml}
        ${evo.situation ? `<div class="sbar-block">
          <div class="sbar-label"><span class="letter s-color">S</span> Situação</div>
          <p class="sbar-text">${evo.situation}</p>
        </div>` : ''}
        ${evo.background ? `<div class="sbar-block">
          <div class="sbar-label"><span class="letter b-color">B</span> Background</div>
          <p class="sbar-text">${evo.background}</p>
        </div>` : ''}
        ${evo.assessment ? `<div class="sbar-block">
          <div class="sbar-label"><span class="letter a-color">A</span> Avaliação</div>
          <p class="sbar-text">${evo.assessment}</p>
        </div>` : ''}
        ${evo.recommendation ? `<div class="sbar-block">
          <div class="sbar-label"><span class="letter r-color">R</span> Recomendação</div>
          <p class="sbar-text">${evo.recommendation}</p>
        </div>` : ''}`;
    }).join('');
  
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório SBAR - ${patient.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 3px solid #0f766e; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 24px; color: #0f766e; }
    .header p { font-size: 12px; color: #666; margin-top: 4px; }
    .patient-info { background: #f8fffe; border: 1px solid #d1fae5; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .patient-info h2 { font-size: 18px; margin-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; }
    .info-grid .label { color: #666; font-weight: 500; }
    .admission-section { margin-bottom: 24px; }
    .admission-header { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
    .admission-header h3 { font-size: 16px; color: #0f766e; }
    .sbar-block { margin-bottom: 16px; page-break-inside: avoid; }
    .sbar-label { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .sbar-label .letter { width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; }
    .s-color { background: #2563eb; } .b-color { background: #7c3aed; } .a-color { background: #d97706; } .r-color { background: #059669; }
    .sbar-text { font-size: 13px; line-height: 1.6; padding-left: 28px; color: #333; }
    .vitals { display: flex; flex-wrap: wrap; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 16px; }
    .vital-item { font-size: 12px; padding: 4px 10px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; }
    .evolution-divider { border-top: 1px dashed #d1d5db; margin: 16px 0; }
    .footer { border-top: 2px solid #0f766e; padding-top: 16px; margin-top: 32px; font-size: 11px; color: #666; text-align: center; }
    .timestamp { font-size: 11px; color: #999; margin-bottom: 12px; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center;margin-bottom:20px">
    <button onclick="window.print()" style="padding:10px 24px;background:#0f766e;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer">Imprimir / Salvar PDF</button>
  </div>
  <div class="header">
    <h1>SBAR Global - Relatório Clínico</h1>
    <p>Gerado em ${new Date().toLocaleString('pt-BR')} | Confidencial</p>
  </div>
  <div class="patient-info">
    <h2>${patient.name}</h2>
    <div class="info-grid">
      ${patient.gender ? `<div><span class="label">Sexo:</span> ${genderLabel(patient.gender)}</div>` : ''}
      ${patient.birthDate ? `<div><span class="label">Nascimento:</span> ${new Date(patient.birthDate).toLocaleDateString('pt-BR')}</div>` : ''}
      ${patient.bloodType ? `<div><span class="label">Tipo Sanguíneo:</span> ${patient.bloodType}</div>` : ''}
      ${patient.cpf ? `<div><span class="label">CPF:</span> ${patient.cpf}</div>` : ''}
      ${patient.allergies ? `<div><span class="label">Alergias:</span> ${patient.allergies}</div>` : ''}
      ${patient.comorbidities ? `<div><span class="label">Comorbidades:</span> ${patient.comorbidities}</div>` : ''}
    </div>
  </div>
  <div class="admission-section">
    <div class="admission-header">
      <h3>Internação - Leito ${activeAdmission.bed}</h3>
      <div class="info-grid" style="margin-top:8px">
        <div><span class="label">Diagnóstico:</span> ${activeAdmission.mainDiagnosis || 'Não informado'}</div>
        <div><span class="label">Prioridade:</span> ${priorityLabel(activeAdmission.priority)}</div>
        <div><span class="label">Data Internação:</span> ${new Date(activeAdmission.admissionDate).toLocaleDateString('pt-BR')}</div>
        <div><span class="label">Convênio:</span> ${activeAdmission.insuranceProvider || 'Não informado'}</div>
      </div>
    </div>
    <h4 style="font-size:14px;margin-bottom:12px;color:#0f766e">Evoluções SBAR (${nonDraftEvos.length})</h4>
    ${evolutionsHtml}
  </div>
  <div class="footer">
    <p>SBAR Global - Clinical Intelligence Platform</p>
    <p>Documento gerado automaticamente. Válido como registro de evolução clínica.</p>
  </div>
</body>
</html>`;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error('Permita pop-ups para gerar o relatório');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  toast.success('Relatório gerado! Use Ctrl+P para salvar como PDF.');
}

export default function PatientDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const patientId = parseInt(params.id || "0");
  
  const { data: patient, isLoading: patientLoading } = trpc.patients.get.useQuery(
    { id: patientId },
    { enabled: !!patientId }
  );
  
  const { data: admissionsList, isLoading: admissionsLoading } = trpc.admissions.byPatient.useQuery(
    { patientId },
    { enabled: !!patientId }
  );

  if (patientLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass border-b">
          <div className="container flex items-center gap-4 h-14">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="w-48 h-6" />
          </div>
        </header>
        <main className="container py-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-lg font-semibold">Paciente não encontrado</h2>
          <Button onClick={() => setLocation("/dashboard")}>Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

  const activeAdmission = admissionsList?.find((a: any) => a.status === 'active');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex items-center gap-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{patient.name}</h1>
            {activeAdmission && (
              <p className="text-xs text-muted-foreground">
                Leito {activeAdmission.bed} • {priorityConfig[activeAdmission.priority]?.label || 'Médio'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeAdmission && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  // Generate printable report in new window
                  generatePrintReport(patient, admissionsList || [], activeAdmission);
                }}
              >
                <Printer className="w-4 h-4 mr-1" />
                PDF
              </Button>
            )}
            {activeAdmission && (
              <Button size="sm" onClick={() => setLocation(`/evolution/${activeAdmission.id}`)}>
                <Plus className="w-4 h-4 mr-1" />
                Evoluir
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-4 space-y-4">
        {/* Patient Info Card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h2 className="text-lg font-semibold">{patient.name}</h2>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                    {patient.gender && (
                      <span>{patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Feminino' : 'Outro'}</span>
                    )}
                    {patient.birthDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {patient.cpf && <span>CPF: {patient.cpf}</span>}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {patient.bloodType && (
                    <Badge variant="outline" className="text-xs">
                      <Droplets className="w-3 h-3 mr-1" />
                      {patient.bloodType}
                    </Badge>
                  )}
                  {patient.allergies && (
                    <Badge variant="outline" className="text-xs text-red-600 border-red-300 dark:text-red-400 dark:border-red-700">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Alergias: {patient.allergies}
                    </Badge>
                  )}
                  {patient.comorbidities && (
                    <Badge variant="outline" className="text-xs">
                      <Pill className="w-3 h-3 mr-1" />
                      {patient.comorbidities}
                    </Badge>
                  )}
                </div>
                
                {(patient.phone || patient.emergencyContact) && (
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {patient.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {patient.phone}
                      </span>
                    )}
                    {patient.emergencyContact && (
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        Contato: {patient.emergencyContact} {patient.emergencyPhone && `(${patient.emergencyPhone})`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admissions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Internações ({admissionsList?.length || 0})
          </h3>
          
          {admissionsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !admissionsList || admissionsList.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma internação registrada</p>
              </CardContent>
            </Card>
          ) : (
            admissionsList.map((admission: any, index: number) => (
              <AdmissionSection 
                key={admission.id} 
                admission={admission} 
                defaultExpanded={index === 0}
              />
            ))
          )}
        </div>
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
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">Novo</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground"
            onClick={() => setLocation("/settings")}
          >
            <Brain className="w-5 h-5" />
            <span className="text-xs font-medium">Config</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
