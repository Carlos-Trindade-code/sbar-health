import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { 
  Copy, 
  Download, 
  FileText, 
  Share2, 
  Check,
  FileJson,
  FileSpreadsheet,
  Mail
} from "lucide-react";
import { toast } from "sonner";

interface ExportDataProps {
  data: any;
  type: 'evolution' | 'patient' | 'report' | 'team';
  patientName?: string;
  title?: string;
}

export default function ExportData({ data, type, patientName, title }: ExportDataProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'text' | 'json' | 'csv'>('text');
  const [copied, setCopied] = useState(false);

  const formatAsText = () => {
    if (type === 'evolution') {
      return `EVOLUÇÃO SBAR - ${patientName || 'Paciente'}
Data: ${new Date().toLocaleString('pt-BR')}
${'─'.repeat(40)}

📍 SITUAÇÃO (S):
${data.situation || 'Não informado'}

📋 HISTÓRICO (B):
${data.background || 'Não informado'}

🔍 AVALIAÇÃO (A):
${data.assessment || 'Não informado'}

💡 RECOMENDAÇÃO (R):
${data.recommendation || 'Não informado'}

${'─'.repeat(40)}
Gerado por SBAR Global`;
    }
    
    if (type === 'patient') {
      return `DADOS DO PACIENTE
${'─'.repeat(40)}
Nome: ${data.name || 'Não informado'}
Leito: ${data.bed || 'Não informado'}
Diagnóstico: ${data.diagnosis || 'Não informado'}
Idade: ${data.age || 'Não informado'}
Convênio: ${data.insurance || 'Não informado'}
Data de Internação: ${data.admissionDate || 'Não informado'}
Dias Internado: ${data.daysAdmitted || 'Não informado'}
Probabilidade de Alta: ${data.dischargeProbability || 'Não informado'}%
${'─'.repeat(40)}
Gerado por SBAR Global`;
    }

    return JSON.stringify(data, null, 2);
  };

  const formatAsJSON = () => {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      type,
      patientName,
      data
    }, null, 2);
  };

  const formatAsCSV = () => {
    if (type === 'evolution') {
      return `Campo,Valor
Paciente,"${patientName || ''}"
Data,"${new Date().toLocaleString('pt-BR')}"
Situação,"${(data.situation || '').replace(/"/g, '""')}"
Histórico,"${(data.background || '').replace(/"/g, '""')}"
Avaliação,"${(data.assessment || '').replace(/"/g, '""')}"
Recomendação,"${(data.recommendation || '').replace(/"/g, '""')}"`;
    }
    
    if (type === 'patient') {
      return `Campo,Valor
Nome,"${data.name || ''}"
Leito,"${data.bed || ''}"
Diagnóstico,"${(data.diagnosis || '').replace(/"/g, '""')}"
Idade,"${data.age || ''}"
Convênio,"${data.insurance || ''}"
Data Internação,"${data.admissionDate || ''}"
Dias Internado,"${data.daysAdmitted || ''}"
Prob. Alta,"${data.dischargeProbability || ''}%"`;
    }

    return Object.entries(data).map(([k, v]) => `"${k}","${v}"`).join('\n');
  };

  const getFormattedData = () => {
    switch (exportFormat) {
      case 'json': return formatAsJSON();
      case 'csv': return formatAsCSV();
      default: return formatAsText();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFormattedData());
    setCopied(true);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getFormattedData();
    const extension = exportFormat === 'json' ? 'json' : exportFormat === 'csv' ? 'csv' : 'txt';
    const mimeType = exportFormat === 'json' ? 'application/json' : exportFormat === 'csv' ? 'text/csv' : 'text/plain';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_${patientName?.replace(/\s/g, '_') || 'export'}_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Arquivo baixado com sucesso!");
  };

  const handleShareByEmail = () => {
    const subject = encodeURIComponent(`${title || type} - ${patientName || 'SBAR Global'}`);
    const body = encodeURIComponent(formatAsText());
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => { setExportFormat('text'); setShowExportDialog(true); }}>
            <FileText className="w-4 h-4 mr-2" />
            Copiar como Texto
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setExportFormat('json'); setShowExportDialog(true); }}>
            <FileJson className="w-4 h-4 mr-2" />
            Exportar JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setExportFormat('csv'); setShowExportDialog(true); }}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareByEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Enviar por Email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Exportar Dados</DialogTitle>
            <DialogDescription>
              Copie o conteúdo abaixo ou baixe como arquivo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button 
                variant={exportFormat === 'text' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setExportFormat('text')}
              >
                Texto
              </Button>
              <Button 
                variant={exportFormat === 'json' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setExportFormat('json')}
              >
                JSON
              </Button>
              <Button 
                variant={exportFormat === 'csv' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setExportFormat('csv')}
              >
                CSV
              </Button>
            </div>
            
            <Textarea 
              value={getFormattedData()}
              readOnly
              className="font-mono text-sm h-64"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Fechar
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
            <Button onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick copy button for inline use
interface QuickCopyProps {
  text: string;
  label?: string;
}

export function QuickCopy({ text, label = "Copiar" }: QuickCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="w-3 h-3 mr-1" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 mr-1" />
          {label}
        </>
      )}
    </Button>
  );
}
