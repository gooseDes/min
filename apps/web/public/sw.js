const apiUrl = new URL(self.location).searchParams.get("apiUrl");
let currentAppState = "normal";

self.addEventListener("install", event => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
    event.respondWith(fetch(event.request));
});

self.addEventListener("message", event => {
    if (event.data && event.data.type === "SET_APP_STATE") {
        currentAppState = event.data.state;
    }
});

self.addEventListener("push", event => {
    const data = event.data.json();

    console.log("push", data);

    const author = data.author;

    if (currentAppState === `chat-${data.chat.id}`) return;

    event.waitUntil(
        self.registration.showNotification(author.username, {
            body: data.message,
            icon: `${apiUrl}/avatars/${author.avatar}.webp`,
            badge: `/badge.png`,
            tag: data.chat.id,
        }),
    );
});
