// Push notification handler for Service Worker
// This file is imported by the PWA service worker

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/logo.png',
      badge: data.badge || '/logo.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: [
        { action: 'open', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      tag: 'bbuc-notice',
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'BBUC Notice Board', options)
    );
  } catch (e) {
    // Fallback for non-JSON payloads
    event.waitUntil(
      self.registration.showNotification('BBUC Notice Board', {
        body: event.data.text(),
        icon: '/logo.png',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/notices';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});
