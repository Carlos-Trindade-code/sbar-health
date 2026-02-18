import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  MessageCircle,
  Phone,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  Send,
  RefreshCw,
  Smartphone,
  Globe,
  Shield,
  Zap
} from "lucide-react";

interface PendingMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'evolution' | 'query' | 'alert';
  status: 'pending' | 'sent' | 'failed';
  patientName?: string;
}

interface WhatsAppBotProps {
  isOnline?: boolean;
  phoneNumber?: string;
  onConnect?: () => void;
}

export default function WhatsAppBot({ isOnline = true, phoneNumber, onConnect }: WhatsAppBotProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([
    {
      id: '1',
      content: 'Evolução: Paciente Maria Silva - Estável, sem febre há 24h',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: 'evolution',
      status: 'pending',
      patientName: 'Maria Silva'
    },
    {
      id: '2',
      content: 'Consulta: Qual a última PA do paciente João?',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      type: 'query',
      status: 'sent',
      patientName: 'João Pedro'
    }
  ]);
  const [autoSync, setAutoSync] = useState(true);
  const [notifyAlerts, setNotifyAlerts] = useState(true);

  const handleConnect = () => {
    setShowQRCode(true);
    // Simular conexão após 3 segundos
    setTimeout(() => {
      setIsConnected(true);
      setShowQRCode(false);
      toast.success("WhatsApp conectado com sucesso!");
      onConnect?.();
    }, 3000);
  };

  const handleSyncPending = () => {
    if (!isOnline) {
      toast.error("Sem conexão. Mensagens serão enviadas quando o sinal voltar.");
      return;
    }
    
    setPendingMessages(prev => 
      prev.map(msg => ({ ...msg, status: 'sent' as const }))
    );
    toast.success("Mensagens sincronizadas com sucesso!");
  };

  const getStatusIcon = (status: PendingMessage['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getTypeLabel = (type: PendingMessage['type']) => {
    switch (type) {
      case 'evolution':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Evolução</Badge>;
      case 'query':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Consulta</Badge>;
      case 'alert':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Alerta</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status de Conexão */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
                <MessageCircle className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">WhatsApp Bot</CardTitle>
                <CardDescription>
                  {isConnected ? 'Conectado e sincronizando' : 'Não conectado'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <Wifi className="w-3 h-3 mr-1" /> Online
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  <WifiOff className="w-3 h-3 mr-1" /> Offline
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              {showQRCode ? (
                <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-white">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
                    <QrCode className="w-24 h-24 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Escaneie o QR Code com seu WhatsApp
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Aguardando conexão...
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Conecte seu WhatsApp para enviar e receber evoluções diretamente pelo aplicativo.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm">Evoluções rápidas</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <span className="text-sm">Funciona mundial</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="text-sm">Criptografado</span>
                    </div>
                  </div>
                  <Button onClick={handleConnect} className="w-full bg-green-600 hover:bg-green-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Conectar WhatsApp
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      {phoneNumber || '+55 31 9****-****'}
                    </p>
                    <p className="text-xs text-green-600">Conectado há 2 dias</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  Desconectar
                </Button>
              </div>

              <Separator />

              {/* Configurações */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sincronização automática</Label>
                    <p className="text-xs text-muted-foreground">
                      Sincronizar quando o sinal voltar
                    </p>
                  </div>
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificar alertas críticos</Label>
                    <p className="text-xs text-muted-foreground">
                      Receber alertas de pacientes críticos
                    </p>
                  </div>
                  <Switch checked={notifyAlerts} onCheckedChange={setNotifyAlerts} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mensagens Pendentes (Modo Offline) */}
      {isConnected && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Fila de Mensagens</CardTitle>
                <CardDescription>
                  {pendingMessages.filter(m => m.status === 'pending').length} mensagens aguardando envio
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSyncPending}
                disabled={!isOnline}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {getTypeLabel(msg.type)}
                      {msg.patientName && (
                        <span className="text-sm font-medium">{msg.patientName}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {msg.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(msg.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comandos Disponíveis */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comandos do WhatsApp</CardTitle>
            <CardDescription>
              Envie estes comandos para interagir com o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <code className="text-sm font-mono text-green-600">/evolucao [paciente]</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Criar nova evolução para o paciente
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <code className="text-sm font-mono text-green-600">/status [paciente]</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Ver status atual do paciente
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <code className="text-sm font-mono text-green-600">/criticos</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Listar pacientes críticos
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <code className="text-sm font-mono text-green-600">/alta [paciente]</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Iniciar processo de alta
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente de indicador de WhatsApp para o header
export function WhatsAppIndicator({ isConnected, pendingCount }: { isConnected: boolean; pendingCount: number }) {
  return (
    <Button variant="ghost" size="sm" className="relative">
      <MessageCircle className={`w-4 h-4 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
          {pendingCount}
        </span>
      )}
    </Button>
  );
}
