// Service worker for background audio playback and notifications

let audioContext = null;
let backgroundAudio = null;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};

  switch (type) {
    case 'KEEP_ALIVE':
      // Keep service worker alive for background playback
      break;
      
    case 'PLAY_TRACK':
      playTrackInBackground(data);
      break;
      
    case 'PAUSE_TRACK':
      pauseTrackInBackground();
      break;
      
    case 'NEXT_TRACK':
      playNextTrack();
      break;
      
    case 'PREV_TRACK':
      playPrevTrack();
      break;
      
    default:
      break;
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('push', (event) => {
  // Handle push notifications for new releases, etc.
  if (event.data) {
    const payload = event.data.json();
    const options = {
      body: payload.body,
      icon: payload.icon || '/logo3.jpg',
      badge: '/logo3.jpg',
      tag: payload.tag || 'general',
      data: {
        url: payload.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    );
  }
});

function playTrackInBackground(trackData) {
  // Create or resume audio context
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Store track data for background playback
  self.currentTrack = trackData;
  
  // Show notification
  self.registration.showNotification(`Now Playing: ${trackData.name}`, {
    body: `By ${trackData.primary_artists || 'Unknown Artist'}`,
    icon: trackData.image[2]?.url || '/logo3.jpg',
    badge: '/logo3.jpg',
    tag: 'background-playback',
    requireInteraction: false,
    silent: false,
    actions: [
      { action: 'prev', title: 'Previous', icon: '/icons/previous.png' },
      { action: 'pause', title: 'Pause', icon: '/icons/pause.png' },
      { action: 'next', title: 'Next', icon: '/icons/next.png' }
    ]
  });
}

function pauseTrackInBackground() {
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend();
  }
  
  self.registration.showNotification('Playback Paused', {
    body: 'Music playback has been paused',
    icon: '/logo3.jpg',
    badge: '/logo3.jpg',
    tag: 'playback-status'
  });
}

function playNextTrack() {
  // Notify the main app to play the next track
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'PLAY_NEXT_TRACK' });
    });
  });
}

function playPrevTrack() {
  // Notify the main app to play the previous track
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'PLAY_PREV_TRACK' });
    });
  });
}

// Handle background audio events
self.addEventListener('fetch', (event) => {
  // Intercept audio requests to enable background playback
  if (event.request.destination === 'audio') {
    event.respondWith(
      fetch(event.request).then(response => {
        // Log audio playback for background tracking
        return response;
      })
    );
  }
});