export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM,

  replyTo: process.env.EMAIL_REPLY_TO,

  appName: "AutoFlow",

  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000",
};
