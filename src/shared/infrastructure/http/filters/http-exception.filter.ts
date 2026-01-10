import { randomUUID } from 'node:crypto';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
// internal
import { LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import type { FastifyReply, FastifyRequest } from 'fastify';

// relatives
import { AppException } from '../exceptions/app.exception';
import type { ApiErrorDetail, ApiErrorResponse } from '../types/response.types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();
    const requestId = (request.headers['x-request-id'] as string) || randomUUID();

    const errorResponse = this.buildErrorResponse(exception, request, requestId);
    this.logError(exception, errorResponse, request);

    response.status(errorResponse.error.statusCode).send(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: FastifyRequest,
    requestId: string,
  ): ApiErrorResponse {
    const meta = {
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };

    if (exception instanceof AppException) {
      return {
        error: {
          code: exception.code,
          message: exception.message,
          statusCode: exception.getStatus(),
          details: exception.details,
        },
        meta,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Trata erros do ValidationPipe
      if (status === HttpStatus.UNPROCESSABLE_ENTITY && typeof exceptionResponse === 'object') {
        const validationResponse = exceptionResponse as { message?: string[] | ApiErrorDetail[] };
        const details = this.formatValidationErrors(validationResponse.message);

        return {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            statusCode: status,
            details,
          },
          meta,
        };
      }

      return {
        error: {
          code: this.getHttpErrorCode(status),
          message:
            typeof exceptionResponse === 'string'
              ? exceptionResponse
              : (exceptionResponse as { message?: string }).message || 'An error occurred',
          statusCode: status,
          details: null,
        },
        meta,
      };
    }

    // Exception não tratada
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        details: null,
      },
      meta,
    };
  }

  private formatValidationErrors(messages?: string[] | ApiErrorDetail[]): ApiErrorDetail[] | null {
    if (!messages || !Array.isArray(messages)) {
      return null;
    }

    // Se já estiver formatado como objeto
    if (messages.length > 0 && typeof messages[0] === 'object') {
      return messages as ApiErrorDetail[];
    }

    // Se for array de strings (formato padrão do class-validator)
    return (messages as string[]).map((message) => ({ message }));
  }

  private getHttpErrorCode(status: HttpStatus): string {
    const codes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
      [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
    };

    return codes[status] || 'HTTP_ERROR';
  }

  private logError(
    exception: unknown,
    errorResponse: ApiErrorResponse,
    request: FastifyRequest,
  ): void {
    const logContext = {
      code: errorResponse.error.code,
      path: request.url,
      method: request.method,
      requestId: errorResponse.meta.requestId,
    };

    if (exception instanceof AppException && exception.isOperational) {
      this.logger.warn('Operational error', logContext);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status >= 500) {
        this.logger.error('Server error', exception, logContext);
      } else {
        this.logger.warn('Client error', { ...logContext, exception });
      }
      return;
    }

    // Erro não tratado - loga completo
    this.logger.error('Unhandled exception', exception as Error, logContext);
  }
}
