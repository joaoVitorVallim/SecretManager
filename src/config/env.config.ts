export default () => ({
  port: Number(process.env.PORT),

  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_DATABASE,
  },

  auth: {
    apiToken: process.env.API_TOKEN,
    secretEncryptionKey: process.env.SECRET_ENCRYPTION_KEY,
  },

  mail: {
    host: process.env.MAIL_HOST,

    port: Number(process.env.MAIL_PORT ?? 587),

    user: process.env.MAIL_USER,

    pass: process.env.MAIL_PASS,

    from: process.env.MAIL_FROM,

    expiryAlertDays: Number(
      process.env.MAIL_EXPIRY_ALERT_DAYS ?? 5,
    ),

    alertRecipients: (
      process.env.MAIL_ALERT_RECIPIENTS ?? ''
    )
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean),
  },

  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    TTL: process.env.REDIS_TTL,
  }
  
});