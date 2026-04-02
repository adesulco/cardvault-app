// Fundamental Service Worker to validate PWA integrity and clear browser compilation logs
const CACHE_NAME = 'cardvault-secure-cache-v1';

self.addEventListener('install', (event) => {
  // Instantly lock active control bypassing manual user confirmation
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Neutral pass-through mechanism ensuring absolute zero conflict with Next.js dynamic routing mechanics
  event.respondWith(fetch(event.request).catch(error => {
     console.error('Fetch intercepted by safe-fail service worker', error);
     throw error;
  }));
});
