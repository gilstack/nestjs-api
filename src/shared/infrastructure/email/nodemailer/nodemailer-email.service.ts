import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TypedConfigService } from '@config/config.service';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { createTransport, type Transporter } from 'nodemailer';
import type { EmailOptions, IEmailService } from '../interfaces/email.interface';

@Injectable()
export class NodemailerEmailService implements IEmailService, OnModuleInit {
  private transporter: Transporter;
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map();
  private baseLayout: Handlebars.TemplateDelegate;

  constructor(private readonly config: TypedConfigService) {
    this.transporter = createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: config.email.user
        ? {
            user: config.email.user,
            pass: config.email.pass,
          }
        : undefined,
    });
  }

  onModuleInit(): void {
    this.loadPartials();
    this.loadTemplates();
    this.loadBaseLayout();
  }

  private loadPartials(): void {
    const partialsDir = join(__dirname, '..', 'templates', 'partials');

    if (!existsSync(partialsDir)) return;

    const files = readdirSync(partialsDir).filter((f) => f.endsWith('.hbs'));

    for (const file of files) {
      const name = file.replace('.hbs', '');
      const content = readFileSync(join(partialsDir, file), 'utf-8');
      Handlebars.registerPartial(name, content);
    }
  }

  private loadTemplates(): void {
    const templatesDir = join(__dirname, '..', 'templates');

    if (!existsSync(templatesDir)) return;

    const files = readdirSync(templatesDir).filter((f) => f.endsWith('.hbs'));

    for (const file of files) {
      const name = file.replace('.hbs', '');
      const content = readFileSync(join(templatesDir, file), 'utf-8');
      this.templates.set(name, Handlebars.compile(content));
    }
  }

  private loadBaseLayout(): void {
    const layoutPath = join(__dirname, '..', 'templates', 'layouts', 'base.hbs');

    if (existsSync(layoutPath)) {
      const content = readFileSync(layoutPath, 'utf-8');
      this.baseLayout = Handlebars.compile(content);
    }
  }

  private renderTemplate(templateName: string, context: Record<string, unknown>): string {
    const template = this.templates.get(templateName);

    if (!template) {
      throw new Error(`Email template "${templateName}" not found`);
    }

    const content = template(context);

    return this.baseLayout({
      title: context.title || 'Storagie',
      year: new Date().getFullYear(),
      content,
      ...context,
    });
  }

  async send(options: EmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.email.from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }

  async sendMagicLink(
    email: string,
    userName: string | null,
    magicLinkUrl: string,
    expiresInMinutes: number,
  ): Promise<void> {
    const displayName = userName || email.split('@')[0];

    const html = this.renderTemplate('magic-link', {
      title: 'Join Storagie',
      previewText: 'Join Storagie',
      logotype: this.config.email.logotype,
      name: displayName,
      magicLinkUrl,
      expiresInMinutes,
    });

    await this.send({
      to: email,
      subject: 'Your Access Link - Storagie',
      html,
      text: `Hello ${displayName},\n\nYour passport to Storagie is one click away: ${magicLinkUrl}\n\nThis link expires in ${expiresInMinutes} minutes.`,
    });
  }
}
