/* eslint-disable no-restricted-globals */
/* eslint-disable no-console */

const CACHE_NAME = 'cache-v1';

self.addEventListener('install', () => {
  console.log('Service Worker installed');
});

self.addEventListener('error', (event) => {
  console.log('Error occurred in Service Worker:');
  console.error(event.error);
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.protocol === 'chrome-extension:') return;

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
});
