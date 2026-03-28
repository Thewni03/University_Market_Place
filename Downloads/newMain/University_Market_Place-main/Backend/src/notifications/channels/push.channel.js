let initialized = false;
let webpushModule;

const getWebPush = async () => {
  if (webpushModule) return webpushModule;

  try {
    const imported = await import("web-push");
    webpushModule = imported.default || imported;
    return webpushModule;
  } catch {
    throw new Error('Optional dependency "web-push" is not installed.');
  }
};

const initWebPush = async () => {
  if (initialized) return;

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    throw new Error('VAPID keys missing — run: npx web-push generate-vapid-keys and add to .env');
  }

  const webpush = await getWebPush();
  webpush.setVapidDetails(
    'mailto:' + process.env.EMAIL_USER,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  initialized = true;
};

export const sendPush = async ({ subscription, title, body }) => {
  const webpush = await getWebPush();
  await initWebPush();
  const payload = JSON.stringify({ title, body });
  await webpush.sendNotification(subscription, payload);
};
