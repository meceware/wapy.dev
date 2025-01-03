self.addEventListener('push', function(event) {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon.main,
      badge: data.icon.badge,
      actions: [
        {
          action: 'markAsPaid',
          title: data.markAsPaid.title,
          icon: data.markAsPaid.icon,
        },
        {
          action: 'home',
          title: data.home.title,
          icon: data.home.icon,
        }
      ],
      data: {
        url: {
          main: data.url,
          markAsPaid: data.markAsPaid.url,
          home: data.home.url,
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
  } else if (event.action === 'home') {
    // Open the home page
    event.waitUntil(
      clients.openWindow(event.notification.data.url.home)
    );
  } else {
    // Default action (e.g., open the URL)
    event.waitUntil(
      clients.openWindow(event.notification.data.url.main)
    );
  }
});