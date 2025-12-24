export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

export interface IEmailService {
  send(options: EmailOptions): Promise<void>;
  sendMagicLink(email: string, magicLinkUrl: string, expiresInMinutes: number): Promise<void>;
}
