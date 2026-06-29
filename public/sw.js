self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? { title: "FlipScout", body: "New deal found!" }
  self.registration.showNotification(data.title || "FlipScout", {
    body: data.body || "New deal found!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/dashboard" },
  })
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/dashboard"))
})
