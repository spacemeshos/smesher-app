/* eslint-disable no-restricted-globals */
/* eslint-disable no-console */

const CACHE_NAME = 'api-cache-v1';
const API_URL = 'http://localhost:8080/';

self.addEventListener('install', () => {
  console.log('Service Worker installed');
});

self.addEventListener('error', (event) => {
  console.log('Error occurred in Service Worker:');
  console.error(event.error);
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(API_URL)) {
    event.respondWith(
      caches
        .open(CACHE_NAME)
        .then((cache) =>
          cache
            .match(event.request)
            .then(
              (cached) =>
                cached ||
                fetch(event.request).then((response) =>
                  response.ok
                    ? cache
                        .put(event.request, response.clone())
                        .then(() => response)
                    : response
                )
            )
        )
    );
  }
});
