import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppExceptionOptions {
  code: string;
  message: string;
  statusCode?: HttpStatus;
  details?: Record<string, unknown> | null;
  isOperational?: boolean;
}

export class AppException extends HttpException {
  readonly code: string;
  readonly details: Record<string, unknown> | null;
  readonly isOperational: boolean;

  constructor(options: AppExceptionOptions) {
    const statusCode = options.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;

    super(
      {
        code: options.code,
        message: options.message,
        statusCode,
        details: options.details ?? null,
      },
      statusCode,
    );

    this.code = options.code;
    this.details = options.details ?? null;
    this.isOperational = options.isOperational ?? true;
  }
}
