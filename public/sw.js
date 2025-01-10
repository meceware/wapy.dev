self.addEventListener('push', function(event) {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon.main,
      badge: data.icon.badge,
      color: data.color,
      actions: [
        {
          action: 'markAsPaid',
          title: data.markAsPaid.title,
          icon: data.markAsPaid.icon,
        },
        {
          action: 'dismiss',
          title: data.dismiss.title,
          icon: data.dismiss.icon,
        }
      ],
      data: {
        url: {
          main: data.url,
          markAsPaid: data.markAsPaid.url,
        },
      },
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'markAsPaid') {
    // Call the API to mark as paid
    fetch(event.notification.data.url.markAsPaid, {
      method: 'POST'
    });
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action (e.g., open the URL)
    event.waitUntil(
      clients.openWindow(event.notification.data.url.main)
    );
  }
});