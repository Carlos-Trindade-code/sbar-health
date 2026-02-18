import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, Check, CheckCheck, Trash2, X, UserCheck, LogOut, Activity, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS, es, fr, zhCN } from "date-fns/locale";
import { useTranslation } from "@/i18n";

// Som de notificação
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log("Audio not supported");
  }
};

interface NotificationCenterProps {
  isDemo?: boolean;
}

export default function NotificationCenter({ isDemo = false }: NotificationCenterProps) {
  const { locale: language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);
  
  // Mock notifications for demo mode
  const [mockNotifications, setMockNotifications] = useState([
    {
      id: 1,
      title: "Passagem de Plantão - Maria Silva",
      message: "Dr. Carlos transferiu a responsabilidade do paciente Maria Silva para você.",
      type: "handoff" as const,
      category: "recovery_room" as const,
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      metadata: {
        patientId: 1,
        patientName: "Maria Silva",
        fromUserName: "Dr. Carlos",
        priority: "high" as const,
      }
    },
    {
      id: 2,
      title: "Alta da RPA - João Santos",
      message: "Dra. Ana deu alta ao paciente João Santos. Destino: Enfermaria.",
      type: "discharge" as const,
      category: "recovery_room" as const,
      read: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      metadata: {
        patientId: 2,
        patientName: "João Santos",
        fromUserName: "Dra. Ana",
        priority: "medium" as const,
      }
    },
    {
      id: 3,
      title: "Atualização de Status - Pedro Lima",
      message: "Enf. Maria atualizou o status do paciente Pedro Lima para: Atenção - SpO2 baixo.",
      type: "status_update" as const,
      category: "recovery_room" as const,
      read: true,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      metadata: {
        patientId: 3,
        patientName: "Pedro Lima",
        fromUserName: "Enf. Maria",
        priority: "high" as const,
      }
    },
    {
      id: 4,
      title: "Bem-vindo ao SBAR Global",
      message: "Sua conta foi criada com sucesso. Explore as funcionalidades do sistema.",
      type: "info" as const,
      category: "system" as const,
      read: true,
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      metadata: {}
    },
  ]);

  // tRPC queries (only when not in demo mode)
  const { data: notifications, refetch: refetchNotifications } = trpc.notifications.list.useQuery(
    undefined,
    { enabled: !isDemo, refetchInterval: 30000 }
  );
  
  const { data: unreadCount, refetch: refetchCount } = trpc.notifications.unreadCount.useQuery(
    undefined,
    { enabled: !isDemo, refetchInterval: 10000 }
  );
  
  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchCount();
    }
  });
  
  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchCount();
      toast.success("Todas as notificações marcadas como lidas");
    }
  });
  
  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchCount();
    }
  });

  // Get locale for date formatting
  const getLocale = () => {
    switch (language) {
      case 'en-US': return enUS;
      case 'es-ES': return es;
      case 'fr-FR': return fr;
      case 'zh-CN': return zhCN;
      default: return ptBR;
    }
  };

  // Use mock or real data
  const displayNotifications = isDemo ? mockNotifications : (notifications || []);
  const displayUnreadCount = isDemo 
    ? mockNotifications.filter(n => !n.read).length 
    : (unreadCount || 0);

  // Play sound when new notification arrives
  useEffect(() => {
    if (displayUnreadCount > previousCount && previousCount > 0) {
      playNotificationSound();
      toast.info("Nova notificação recebida", {
        description: "Você tem uma nova notificação",
        action: {
          label: "Ver",
          onClick: () => setIsOpen(true)
        }
      });
    }
    setPreviousCount(displayUnreadCount);
  }, [displayUnreadCount, previousCount]);

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'handoff': return <UserCheck className="w-5 h-5 text-blue-500" />;
      case 'discharge': return <LogOut className="w-5 h-5 text-green-500" />;
      case 'status_update': return <Activity className="w-5 h-5 text-orange-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success': return <Check className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      default: return 'border-l-gray-300';
    }
  };

  // Handle mark as read
  const handleMarkRead = useCallback((id: number) => {
    if (isDemo) {
      setMockNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } else {
      markReadMutation.mutate({ id });
    }
  }, [isDemo, markReadMutation]);

  // Handle mark all as read
  const handleMarkAllRead = useCallback(() => {
    if (isDemo) {
      setMockNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("Todas as notificações marcadas como lidas");
    } else {
      markAllReadMutation.mutate();
    }
  }, [isDemo, markAllReadMutation]);

  // Handle delete
  const handleDelete = useCallback((id: number) => {
    if (isDemo) {
      setMockNotifications(prev => prev.filter(n => n.id !== id));
    } else {
      deleteMutation.mutate({ id });
    }
  }, [isDemo, deleteMutation]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <AnimatePresence mode="wait">
            {displayUnreadCount > 0 ? (
              <motion.div
                key="bell-ring"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.8, rotate: 10 }}
              >
                <BellRing className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="bell"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <Bell className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {displayUnreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Badge 
                variant="destructive" 
                className="h-5 min-w-5 flex items-center justify-center p-0 text-xs"
              >
                {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
              </Badge>
            </motion.div>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notificações</h3>
          <div className="flex items-center gap-2">
            {displayUnreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          {displayNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell className="w-10 h-10 mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {displayNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`p-3 hover:bg-muted/50 transition-colors border-l-4 ${
                    getPriorityColor((notification.metadata as any)?.priority)
                  } ${!notification.read ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h4>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMarkRead(notification.id)}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: getLocale()
                          })}
                        </span>
                        
                        {notification.category === 'recovery_room' && (
                          <Badge variant="outline" className="text-xs">
                            Sala de Recuperação
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <Button variant="ghost" className="w-full text-sm" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
