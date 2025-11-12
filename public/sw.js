// Service Worker para notificações push
// Este arquivo deve ser servido em /sw.js na raiz do projeto

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push recebido:', event)
  
  let notificationData = {
    title: 'Notificação',
    body: 'Você tem uma nova notificação',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'notification',
    requireInteraction: false,
    data: {}
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        requireInteraction: data.requireInteraction || false,
        data: data.data || {},
        actions: data.actions || []
      }
    } catch (e) {
      console.error('[Service Worker] Erro ao parsear dados:', e)
      notificationData.body = event.data.text() || notificationData.body
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.actions,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    })
  )
})

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notificação clicada:', event)
  
  event.notification.close()

  const data = event.notification.data || {}
  const urlToOpen = data.url || '/financial'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Verificar se já existe uma janela aberta
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // Se não existe, abrir nova janela
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

self.addEventListener('notificationclose', function(event) {
  console.log('[Service Worker] Notificação fechada:', event)
})

// Instalar Service Worker
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Instalando...')
  self.skipWaiting()
})

// Ativar Service Worker
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Ativando...')
  event.waitUntil(self.clients.claim())
})



