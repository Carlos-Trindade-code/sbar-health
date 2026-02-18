import webpush from 'web-push';

// VAPID keys para Web Push
// Em produção, estas chaves devem ser armazenadas em variáveis de ambiente
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BKDRASg2fhzvvrjtjqOv_76hm8qvAdGJiBnvuM59VZ1UwNrmuAFZQrFdHdEDvPbiR4COnklxfNEDJMBpl0DAcXY';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'Qp5lVxXJTBrcNrSakHiqJYdVw6k1i7G5bEAVPSiFgBE';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@sbarhealth.com';

// Configurar VAPID
webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Tipos
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    type?: string;
    patientId?: number;
    patientName?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  vibrate?: number[];
}

// Enviar notificação push
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    console.log('[WebPush] Notification sent:', result.statusCode);
    return true;
  } catch (error: any) {
    console.error('[WebPush] Error sending notification:', error.message);
    
    // Se a subscription expirou ou foi cancelada, retornar false para remover
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('[WebPush] Subscription expired or invalid');
      return false;
    }
    
    throw error;
  }
}

// Enviar notificação para múltiplas subscriptions
export async function sendPushToMultiple(
  subscriptions: PushSubscription[],
  payload: PushNotificationPayload
): Promise<{ success: number; failed: number; expiredEndpoints: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    expiredEndpoints: [] as string[]
  };

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        const success = await sendPushNotification(subscription, payload);
        if (success) {
          results.success++;
        } else {
          results.failed++;
          results.expiredEndpoints.push(subscription.endpoint);
        }
      } catch (error) {
        results.failed++;
      }
    })
  );

  return results;
}

// Criar payload para passagem de plantão
export function createHandoffPushPayload(
  fromUserName: string,
  patientName: string,
  patientId: number,
  sbarSummary?: string
): PushNotificationPayload {
  return {
    title: '🔄 Passagem de Plantão',
    body: `${fromUserName} transferiu ${patientName} para você`,
    icon: '/icons/handoff-icon.png',
    badge: '/icons/badge-icon.png',
    tag: `handoff-${patientId}`,
    data: {
      url: `/recovery-room?patient=${patientId}`,
      type: 'handoff',
      patientId,
      patientName,
      priority: 'high'
    },
    actions: [
      { action: 'view', title: 'Ver Paciente' },
      { action: 'dismiss', title: 'Dispensar' }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200]
  };
}

// Criar payload para alta da RPA
export function createDischargePushPayload(
  fromUserName: string,
  patientName: string,
  patientId: number,
  destination: string
): PushNotificationPayload {
  return {
    title: '✅ Alta da RPA',
    body: `${patientName} recebeu alta para ${destination}`,
    icon: '/icons/discharge-icon.png',
    badge: '/icons/badge-icon.png',
    tag: `discharge-${patientId}`,
    data: {
      url: `/patients/${patientId}`,
      type: 'discharge',
      patientId,
      patientName,
      priority: 'medium'
    },
    actions: [
      { action: 'view', title: 'Ver Detalhes' }
    ],
    requireInteraction: false,
    vibrate: [100, 50, 100]
  };
}

// Criar payload para status crítico
export function createCriticalStatusPushPayload(
  patientName: string,
  patientId: number,
  statusMessage: string
): PushNotificationPayload {
  return {
    title: '🚨 ALERTA CRÍTICO',
    body: `${patientName}: ${statusMessage}`,
    icon: '/icons/critical-icon.png',
    badge: '/icons/badge-icon.png',
    tag: `critical-${patientId}`,
    data: {
      url: `/recovery-room?patient=${patientId}`,
      type: 'critical',
      patientId,
      patientName,
      priority: 'critical'
    },
    actions: [
      { action: 'respond', title: 'Responder Agora' },
      { action: 'view', title: 'Ver Paciente' }
    ],
    requireInteraction: true,
    vibrate: [500, 200, 500, 200, 500]
  };
}

// Criar payload para atualização de status
export function createStatusUpdatePushPayload(
  fromUserName: string,
  patientName: string,
  patientId: number,
  statusMessage: string,
  priority: 'low' | 'medium' | 'high' = 'medium'
): PushNotificationPayload {
  const icons = {
    low: '📋',
    medium: '📊',
    high: '⚠️'
  };

  return {
    title: `${icons[priority]} Atualização de Status`,
    body: `${patientName}: ${statusMessage}`,
    icon: '/icons/status-icon.png',
    badge: '/icons/badge-icon.png',
    tag: `status-${patientId}-${Date.now()}`,
    data: {
      url: `/recovery-room?patient=${patientId}`,
      type: 'status_update',
      patientId,
      patientName,
      priority
    },
    actions: [
      { action: 'view', title: 'Ver Detalhes' }
    ],
    requireInteraction: priority === 'high',
    vibrate: priority === 'high' ? [200, 100, 200] : [100]
  };
}

// Exportar chave pública para o frontend
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}
