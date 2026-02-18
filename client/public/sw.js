// Service Worker para SBAR Global - Push Notifications

const CACHE_NAME = 'sbar-global-v1';

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated');
  event.waitUntil(clients.claim());
});

// Receber push notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    console.log('[SW] No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] Push data:', data);

    const options = {
      body: data.body || 'Nova notificação',
      icon: data.icon || '/icons/notification-icon.png',
      badge: data.badge || '/icons/badge-icon.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      vibrate: data.vibrate || [100, 50, 100],
      timestamp: Date.now(),
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'SBAR Global', options)
    );
  } catch (error) {
    console.error('[SW] Error processing push:', error);
  }
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  const data = event.notification.data || {};
  let url = '/';

  // Determinar URL baseado na ação ou dados
  if (event.action === 'view' || event.action === 'respond') {
    url = data.url || '/';
  } else if (event.action === 'dismiss') {
    return; // Apenas fechar
  } else {
    url = data.url || '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já tem uma janela aberta, focar nela
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            if (url !== '/') {
              client.navigate(url);
            }
            return;
          }
        }
        // Se não tem janela aberta, abrir uma nova
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Fechar notificação
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// Subscription change (quando a subscription expira ou é renovada)
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(self.VAPID_PUBLIC_KEY)
    })
    .then((subscription) => {
      // Enviar nova subscription para o servidor
      return fetch('/api/trpc/notifications.subscribePush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
        }),
      });
    })
    .catch((error) => {
      console.error('[SW] Error resubscribing:', error);
    })
  );
});

// Helper para converter VAPID key
function urlBase64ToUint8Array(base64String) {
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
