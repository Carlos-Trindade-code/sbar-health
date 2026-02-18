import { useState } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, Check, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { SyncStatus, PendingOperation } from '@/hooks/useOfflineSync';

interface OfflineIndicatorProps {
  status: SyncStatus;
  pendingOperations: PendingOperation[];
  onForceSync: () => void;
  onClearPending: () => void;
  className?: string;
}

export function OfflineIndicator({
  status,
  pendingOperations,
  onForceSync,
  onClearPending,
  className,
}: OfflineIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = () => {
    if (!status.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    if (status.isSyncing) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    if (status.pendingCount > 0) {
      return <Cloud className="w-4 h-4 text-yellow-500" />;
    }
    return <Wifi className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (status.isSyncing) return 'Sincronizando...';
    if (status.pendingCount > 0) return `${status.pendingCount} pendente(s)`;
    return 'Online';
  };

  const getStatusColor = () => {
    if (!status.isOnline) return 'bg-red-500';
    if (status.isSyncing) return 'bg-blue-500';
    if (status.pendingCount > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getOperationIcon = (type: PendingOperation['type']) => {
    switch (type) {
      case 'evolution':
        return '📝';
      case 'patient':
        return '👤';
      case 'discharge':
        return '🏥';
      case 'update':
        return '🔄';
      default:
        return '📋';
    }
  };

  const getOperationLabel = (type: PendingOperation['type']) => {
    switch (type) {
      case 'evolution':
        return 'Evolução SBAR';
      case 'patient':
        return 'Novo Paciente';
      case 'discharge':
        return 'Alta Hospitalar';
      case 'update':
        return 'Atualização';
      default:
        return 'Operação';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'relative gap-2 px-3 transition-all duration-300',
            !status.isOnline && 'bg-red-50 hover:bg-red-100',
            status.pendingCount > 0 && status.isOnline && 'bg-yellow-50 hover:bg-yellow-100',
            className
          )}
        >
          {getStatusIcon()}
          <span className="text-xs font-medium hidden sm:inline">{getStatusText()}</span>
          {status.pendingCount > 0 && (
            <Badge 
              variant="secondary" 
              className={cn(
                'absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs',
                getStatusColor(),
                'text-white'
              )}
            >
              {status.pendingCount}
            </Badge>
          )}
          {/* Pulsing indicator for offline */}
          {!status.isOnline && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className={cn(
          'p-4 text-white rounded-t-lg',
          status.isOnline ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status.isOnline ? (
                <Wifi className="w-5 h-5" />
              ) : (
                <WifiOff className="w-5 h-5" />
              )}
              <span className="font-semibold">
                {status.isOnline ? 'Conectado' : 'Sem Conexão'}
              </span>
            </div>
            {status.isSyncing && (
              <Badge variant="secondary" className="bg-white/20 text-white">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Sincronizando
              </Badge>
            )}
          </div>
          {status.lastSyncTime && (
            <p className="text-xs text-white/80 mt-1">
              Última sincronização: {formatTime(status.lastSyncTime)}
            </p>
          )}
        </div>

        {/* Pending Operations */}
        <div className="p-4">
          {pendingOperations.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Operações Pendentes</h4>
                <Badge variant="outline">{pendingOperations.length}</Badge>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {pendingOperations.map((op) => (
                  <div 
                    key={op.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 text-sm"
                  >
                    <span className="text-lg">{getOperationIcon(op.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{getOperationLabel(op.type)}</p>
                      {op.patientName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {op.patientName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatTime(op.timestamp)}
                        {op.retryCount > 0 && (
                          <span className="text-yellow-600 ml-2">
                            (tentativa {op.retryCount + 1})
                          </span>
                        )}
                      </p>
                    </div>
                    {status.isSyncing ? (
                      <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : (
                      <Cloud className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-3" />

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={onForceSync}
                  disabled={!status.isOnline || status.isSyncing}
                >
                  <RefreshCw className={cn('w-4 h-4 mr-1', status.isSyncing && 'animate-spin')} />
                  Sincronizar Agora
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onClearPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="font-medium">Tudo sincronizado!</p>
              <p className="text-sm text-muted-foreground">
                Nenhuma operação pendente
              </p>
            </div>
          )}
        </div>

        {/* Offline Mode Info */}
        {!status.isOnline && (
          <div className="p-4 bg-yellow-50 border-t">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Modo Offline Ativo</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Suas alterações estão sendo salvas localmente e serão sincronizadas automaticamente quando a conexão for restaurada.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sync Progress */}
        {status.isSyncing && (
          <div className="px-4 pb-4">
            <Progress value={33} className="h-1" />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default OfflineIndicator;
