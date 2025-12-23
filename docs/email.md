# Email System

## Overview

The email system provides asynchronous email sending using Nodemailer with BullMQ for job processing. Templates are rendered using Handlebars (HBS) with reusable partials.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  IQueueService  │────▶│  BullMQ Queue   │────▶│  EmailWorker    │
│  (add job)      │     │   ("email")     │     │  (process job)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │  IEmailService  │
                                                │  (send email)   │
                                                └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │   Nodemailer    │
                                                │    + HBS        │
                                                └─────────────────┘
```

## Components

| Component | Interface | Implementation | Token |
|-----------|-----------|----------------|-------|
| Email Service | `IEmailService` | `NodemailerEmailService` | `EMAIL_SERVICE` |
| Queue Service | `IQueueService` | `BullMQQueueService` | `QUEUE_SERVICE` |
| Email Worker | - | `EmailWorkerService` | - |

## Template Structure

```
src/shared/infrastructure/email/templates/
├── layouts/
│   └── base.hbs          # Main email layout
├── partials/
│   ├── header.hbs        # Reusable header
│   └── footer.hbs        # Reusable footer
└── magic-link.hbs        # Magic link email content
```

### Base Layout

The base layout (`layouts/base.hbs`) includes:
- Full HTML structure with responsive styles
- Slots for `{{> header}}`, `{{{content}}}`, and `{{> footer}}`
- Variables: `title`, `year`, `content`

### Partials

Partials are automatically loaded and registered from the `partials/` directory:
- `header.hbs` - Logo and branding
- `footer.hbs` - Copyright with dynamic `{{year}}`

### Creating a New Template

1. Create the content template:

```handlebars
{{!-- templates/welcome.hbs --}}
<h2>Bem-vindo, {{name}}!</h2>

<p>Sua conta foi criada com sucesso.</p>

<p class="text-muted">
    Qualquer dúvida, entre em contato.
</p>
```

2. Add method to `IEmailService`:

```typescript
// interfaces/email.interface.ts
export interface IEmailService {
    send(options: EmailOptions): Promise<void>;
    sendMagicLink(email: string, magicLinkUrl: string, expiresInMinutes: number): Promise<void>;
    sendWelcome(email: string, name: string): Promise<void>; // New
}
```

3. Implement in `NodemailerEmailService`:

```typescript
async sendWelcome(email: string, name: string): Promise<void> {
    const html = this.renderTemplate('welcome', {
        title: 'Bem-vindo',
        name,
    });

    await this.send({
        to: email,
        subject: 'Bem-vindo ao Storagie!',
        html,
        text: `Bem-vindo, ${name}! Sua conta foi criada com sucesso.`,
    });
}
```

4. Add job type to worker if using queue:

```typescript
// workers/email-worker.service.ts
case 'welcome':
    await this.emailService.sendWelcome(data.email, data.name);
    break;
```

## Usage

### Direct Email (Sync)

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_SERVICE } from '@shared/constants/injection-tokens';
import type { IEmailService } from '@shared/infrastructure/email/interfaces/email.interface';

@Injectable()
export class MyService {
    constructor(@Inject(EMAIL_SERVICE) private readonly emailService: IEmailService) {}

    async sendDirectEmail() {
        await this.emailService.sendMagicLink(
            'user@example.com',
            'https://app.com/verify?token=xxx',
            30,
        );
    }
}
```

### Queued Email (Async - Recommended)

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { QUEUE_SERVICE } from '@shared/constants/injection-tokens';
import type { IQueueService } from '@shared/infrastructure/queue/interfaces/queue.interface';

@Injectable()
export class MyService {
    constructor(@Inject(QUEUE_SERVICE) private readonly queueService: IQueueService) {}

    async queueEmail() {
        await this.queueService.add('email', 'magic-link', {
            email: 'user@example.com',
            magicLinkUrl: 'https://app.com/verify?token=xxx',
            expiresInMinutes: 30,
        });
    }
}
```

## Environment Variables

```bash
# SMTP Configuration
SMTP_HOST=localhost        # SMTP server host
SMTP_PORT=1025            # SMTP server port
SMTP_USER=                # SMTP username (optional)
SMTP_PASS=                # SMTP password (optional)
SMTP_FROM=noreply@storagie.app  # Default sender
```

## Development with Mailhog

The docker-compose includes Mailhog for local email testing:

```yaml
mailhog:
  image: mailhog/mailhog
  ports:
    - "1025:1025"  # SMTP
    - "8025:8025"  # Web UI
```

Access the web UI at: http://localhost:8025

## Email Interface

```typescript
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
```

## Job Types

| Job Name | Data | Description |
|----------|------|-------------|
| `magic-link` | `{ email, magicLinkUrl, expiresInMinutes }` | Authentication magic link |

## Error Handling

The `EmailWorkerService` logs errors and retries failed jobs according to BullMQ configuration:

```typescript
this.worker.on('failed', (job, error) => {
    this.logger.error('Email job failed', error, { 
        jobId: job?.id, 
        jobName: job?.name 
    });
});
```
