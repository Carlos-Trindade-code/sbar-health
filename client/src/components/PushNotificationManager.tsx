import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, BellOff, BellRing, Smartphone, Trash2, Send, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTranslation } from "@/i18n";

// Helper para converter VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Verificar se o navegador suporta push notifications
function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Obter status da permissão
function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

interface PushNotificationManagerProps {
  compact?: boolean;
}

export default function PushNotificationManager({ compact = false }: PushNotificationManagerProps) {
  const { t } = useTranslation();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Queries e mutations
  const { data: vapidKey } = trpc.notifications.getVapidPublicKey.useQuery();
  const { data: subscriptions, refetch: refetchSubscriptions } = trpc.notifications.listPushSubscriptions.useQuery();
  const subscribeMutation = trpc.notifications.subscribePush.useMutation();
  const unsubscribeMutation = trpc.notifications.unsubscribePush.useMutation();
  const testPushMutation = trpc.notifications.testPush.useMutation();

  // Inicializar
  useEffect(() => {
    const init = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);
      setPermission(getPermissionStatus());

      if (supported) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          setRegistration(reg);

          // Verificar se já está inscrito
          const subscription = await reg.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error('Error registering service worker:', error);
        }
      }
    };

    init();
  }, []);

  // Solicitar permissão e inscrever
  const subscribe = useCallback(async () => {
    if (!registration || !vapidKey?.publicKey) {
      toast.error('Erro ao configurar notificações');
      return;
    }

    setIsLoading(true);

    try {
      // Solicitar permissão
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        toast.error('Permissão de notificações negada');
        setIsLoading(false);
        return;
      }

      // Inscrever no push manager
      const applicationServerKey = urlBase64ToUint8Array(vapidKey.publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      });

      // Extrair keys
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');

      if (!p256dh || !auth) {
        throw new Error('Failed to get subscription keys');
      }

      // Converter para base64
      const arrayToBase64 = (buffer: ArrayBuffer): string => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      };
      const p256dhBase64 = arrayToBase64(p256dh);
      const authBase64 = arrayToBase64(auth);

      // Salvar no servidor
      await subscribeMutation.mutateAsync({
        endpoint: subscription.endpoint,
        p256dh: p256dhBase64,
        auth: authBase64,
        userAgent: navigator.userAgent,
        deviceName: getDeviceName()
      });

      setIsSubscribed(true);
      refetchSubscriptions();
      toast.success('Notificações push ativadas!');
    } catch (error: any) {
      console.error('Error subscribing to push:', error);
      toast.error('Erro ao ativar notificações: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [registration, vapidKey, subscribeMutation, refetchSubscriptions]);

  // Cancelar inscrição
  const unsubscribe = useCallback(async () => {
    if (!registration) return;

    setIsLoading(true);

    try {
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Remover do servidor
        await unsubscribeMutation.mutateAsync({ endpoint: subscription.endpoint });
        
        // Cancelar subscription local
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      refetchSubscriptions();
      toast.success('Notificações push desativadas');
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      toast.error('Erro ao desativar notificações');
    } finally {
      setIsLoading(false);
    }
  }, [registration, unsubscribeMutation, refetchSubscriptions]);

  // Testar notificação
  const testNotification = useCallback(async () => {
    try {
      await testPushMutation.mutateAsync();
      toast.success('Notificação de teste enviada!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar teste');
    }
  }, [testPushMutation]);

  // Obter nome do dispositivo
  const getDeviceName = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Mac')) return 'Mac';
    if (ua.includes('Linux')) return 'Linux';
    return 'Navegador Web';
  };

  // Versão compacta para Settings
  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <BellRing className="w-5 h-5 text-primary" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Notificações Push</p>
              <p className="text-sm text-muted-foreground">
                {!isSupported 
                  ? 'Não suportado neste navegador'
                  : permission === 'denied'
                  ? 'Bloqueado nas configurações do navegador'
                  : isSubscribed 
                  ? 'Ativado' 
                  : 'Desativado'}
              </p>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={(checked) => checked ? subscribe() : unsubscribe()}
            disabled={!isSupported || permission === 'denied' || isLoading}
          />
        </div>

        {isSubscribed && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testNotification}
            disabled={testPushMutation.isPending}
          >
            {testPushMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Testar Notificação
          </Button>
        )}
      </div>
    );
  }

  // Versão completa
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba alertas mesmo quando o navegador estiver em segundo plano ou fechado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            {!isSupported ? (
              <XCircle className="w-6 h-6 text-destructive" />
            ) : permission === 'denied' ? (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            ) : isSubscribed ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <BellOff className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {!isSupported 
                  ? 'Navegador não suportado'
                  : permission === 'denied'
                  ? 'Permissão bloqueada'
                  : isSubscribed 
                  ? 'Notificações ativas' 
                  : 'Notificações desativadas'}
              </p>
              <p className="text-sm text-muted-foreground">
                {!isSupported 
                  ? 'Use Chrome, Firefox, Edge ou Safari para receber notificações'
                  : permission === 'denied'
                  ? 'Desbloqueie nas configurações do navegador'
                  : isSubscribed 
                  ? 'Você receberá alertas de passagem de plantão e status crítico' 
                  : 'Ative para receber alertas importantes'}
              </p>
            </div>
          </div>
          
          {isSupported && permission !== 'denied' && (
            <Button
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={isLoading}
              variant={isSubscribed ? "outline" : "default"}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isSubscribed ? (
                <BellOff className="w-4 h-4 mr-2" />
              ) : (
                <BellRing className="w-4 h-4 mr-2" />
              )}
              {isSubscribed ? 'Desativar' : 'Ativar'}
            </Button>
          )}
        </div>

        {/* Dispositivos registrados */}
        {isSubscribed && subscriptions && subscriptions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label>Dispositivos registrados</Label>
              <div className="space-y-2">
                {subscriptions.map((sub) => (
                  <div 
                    key={sub.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{sub.deviceName}</p>
                        <p className="text-xs text-muted-foreground">
                          {sub.lastUsed 
                            ? `Último uso: ${new Date(sub.lastUsed).toLocaleDateString('pt-BR')}`
                            : `Registrado: ${new Date(sub.createdAt).toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={sub.active ? "default" : "secondary"}>
                      {sub.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Testar */}
        {isSubscribed && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Testar notificação</p>
                <p className="text-sm text-muted-foreground">
                  Envie uma notificação de teste para verificar se está funcionando
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={testNotification}
                disabled={testPushMutation.isPending}
              >
                {testPushMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar Teste
              </Button>
            </div>
          </>
        )}

        {/* Tipos de notificação */}
        <Separator />
        <div className="space-y-3">
          <Label>Você receberá notificações para:</Label>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Passagem de plantão na Sala de Recuperação</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Alta de pacientes da RPA</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Alertas de status crítico de pacientes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Atualizações importantes da equipe</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
