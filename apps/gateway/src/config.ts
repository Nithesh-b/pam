export interface AppConfig {
  port: number;
  host: string;
  logLevel: string;
  whatsapp: {
    accessToken: string;
    phoneNumberId: string;
    verifyToken: string;
    appSecret?: string;
  };
}

export function loadConfig(): AppConfig {
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';
  const logLevel = process.env.LOG_LEVEL || 'info';

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || '';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || '';
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  return {
    port,
    host,
    logLevel,
    whatsapp: {
      accessToken,
      phoneNumberId,
      verifyToken,
      appSecret,
    },
  };
}

export function validateConfig(config: AppConfig): string[] {
  const errors: string[] = [];

  if (!config.whatsapp.accessToken) {
    errors.push('WHATSAPP_ACCESS_TOKEN or WHATSAPP_TOKEN is required');
  }

  if (!config.whatsapp.phoneNumberId) {
    errors.push('WHATSAPP_PHONE_NUMBER_ID is required');
  }

  if (!config.whatsapp.verifyToken) {
    errors.push('WHATSAPP_VERIFY_TOKEN is required');
  }

  return errors;
}
