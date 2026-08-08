import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log(vapidKeys);