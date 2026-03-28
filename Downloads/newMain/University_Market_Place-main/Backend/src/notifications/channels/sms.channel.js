export const sendSMS = async ({ to, body }) => {
  if (!to) {
    throw new Error("SMS recipient is required.");
  }

  console.warn(
    `SMS channel requested for ${to}, but no SMS provider is configured. Message: ${body}`
  );
};
