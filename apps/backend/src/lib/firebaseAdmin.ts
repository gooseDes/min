import { cert, getApp, initializeApp, ServiceAccount } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";

export let fcm: Messaging;

export function initAdmin() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}") as ServiceAccount;

  try {
    const app = getApp();
    fcm = getMessaging(app);
  } catch (e) {
    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    fcm = getMessaging(app);
  }
}
