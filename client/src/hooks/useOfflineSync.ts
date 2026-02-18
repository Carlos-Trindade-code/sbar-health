import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Types for offline operations
export interface PendingOperation {
  id: string;
  type: 'evolution' | 'patient' | 'discharge' | 'update';
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  patientId?: number;
  patientName?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  syncError: string | null;
}

const STORAGE_KEY = 'sbar_pending_operations';
const MAX_RETRIES = 3;
const SYNC_INTERVAL = 30000; // 30 seconds

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// LocalStorage helpers
const loadPendingOperations = (): PendingOperation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const savePendingOperations = (operations: PendingOperation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(operations));
  } catch (error) {
    console.error('Failed to save pending operations:', error);
  }
};

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>(loadPendingOperations);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada! Sincronizando dados...', {
        icon: '🌐',
        duration: 3000,
      });
      // Trigger sync when coming back online
      syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Você está offline. As alterações serão salvas localmente.', {
        icon: '📴',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist pending operations to localStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    savePendingOperations(pendingOperations);
  }, [pendingOperations]);

  // Set up periodic sync
  useEffect(() => {
    if (isOnline && pendingOperations.length > 0) {
      syncIntervalRef.current = setInterval(() => {
        syncPendingOperations();
      }, SYNC_INTERVAL);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline, pendingOperations.length]);

  // Add operation to pending queue
  const addPendingOperation = useCallback((
    type: PendingOperation['type'],
    data: Record<string, unknown>,
    patientId?: number,
    patientName?: string
  ) => {
    const operation: PendingOperation = {
      id: generateId(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      patientId,
      patientName,
    };

    setPendingOperations(prev => [...prev, operation]);

    toast.info(`${getOperationLabel(type)} salva localmente`, {
      icon: '💾',
      description: isOnline 
        ? 'Será sincronizada em breve' 
        : 'Será sincronizada quando a conexão voltar',
      duration: 3000,
    });

    // If online, try to sync immediately
    if (isOnline) {
      setTimeout(() => syncPendingOperations(), 1000);
    }

    return operation.id;
  }, [isOnline]);

  // Remove operation from queue
  const removeOperation = useCallback((id: string) => {
    setPendingOperations(prev => prev.filter(op => op.id !== id));
  }, []);

  // Sync pending operations with server
  const syncPendingOperations = useCallback(async () => {
    if (!isOnline || isSyncing || pendingOperations.length === 0) {
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    const successfulIds: string[] = [];
    const failedOperations: PendingOperation[] = [];

    for (const operation of pendingOperations) {
      try {
        // Simulate API call - in real implementation, call actual tRPC mutation
        await simulateApiCall(operation);
        successfulIds.push(operation.id);
      } catch (error) {
        const newRetryCount = operation.retryCount + 1;
        if (newRetryCount < MAX_RETRIES) {
          failedOperations.push({ ...operation, retryCount: newRetryCount });
        } else {
          // Max retries reached, show error
          toast.error(`Falha ao sincronizar: ${getOperationLabel(operation.type)}`, {
            description: 'Operação será descartada após múltiplas tentativas',
          });
        }
      }
    }

    // Update pending operations
    setPendingOperations(prev => 
      prev.filter(op => !successfulIds.includes(op.id))
        .map(op => {
          const failed = failedOperations.find(f => f.id === op.id);
          return failed || op;
        })
    );

    if (successfulIds.length > 0) {
      setLastSyncTime(Date.now());
      toast.success(`${successfulIds.length} operação(ões) sincronizada(s)`, {
        icon: '✅',
        duration: 2000,
      });
    }

    setIsSyncing(false);
  }, [isOnline, isSyncing, pendingOperations]);

  // Force sync
  const forceSync = useCallback(() => {
    if (!isOnline) {
      toast.error('Sem conexão. Aguarde a conexão ser restaurada.');
      return;
    }
    syncPendingOperations();
  }, [isOnline, syncPendingOperations]);

  // Clear all pending operations
  const clearPendingOperations = useCallback(() => {
    setPendingOperations([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Operações pendentes removidas');
  }, []);

  // Get sync status
  const status: SyncStatus = {
    isOnline,
    isSyncing,
    pendingCount: pendingOperations.length,
    lastSyncTime,
    syncError,
  };

  return {
    status,
    pendingOperations,
    addPendingOperation,
    removeOperation,
    forceSync,
    clearPendingOperations,
    isOnline,
    isSyncing,
  };
}

// Helper functions
function getOperationLabel(type: PendingOperation['type']): string {
  const labels: Record<PendingOperation['type'], string> = {
    evolution: 'Evolução SBAR',
    patient: 'Cadastro de paciente',
    discharge: 'Alta hospitalar',
    update: 'Atualização',
  };
  return labels[type] || 'Operação';
}

async function simulateApiCall(operation: PendingOperation): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Simulate occasional failures (10% chance in demo)
  if (Math.random() < 0.1) {
    throw new Error('Network error');
  }
  
  console.log('Synced operation:', operation);
}

export default useOfflineSync;
