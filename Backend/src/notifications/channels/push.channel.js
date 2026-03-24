import webpush from 'web-push';

let initialized = false;

const initWebPush = () => {
  if (initialized) return;

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    throw new Error('VAPID keys missing — run: npx web-push generate-vapid-keys and add to .env');
  }

  webpush.setVapidDetails(
    'mailto:' + process.env.EMAIL_USER,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  initialized = true;
};

export const sendPush = async ({ subscription, title, body }) => {
  initWebPush();
  const payload = JSON.stringify({ title, body });
  await webpush.sendNotification(subscription, payload);
};
