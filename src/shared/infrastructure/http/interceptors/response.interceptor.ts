import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { type Observable, map } from 'rxjs';
import { randomUUID } from 'node:crypto';
import type { ApiResponse } from '../types/response.types';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const requestId = (request.headers['x-request-id'] as string) || randomUUID();

    return next.handle().pipe(
      map((data) => {
        // Ignora respostas void/null (ex: 204 No Content)
        if (data === undefined || data === null) {
          return data;
        }

        // Se já está no formato esperado, retorna como está
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return data as ApiResponse<T>;
        }

        return {
          data,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId,
          },
        };
      }),
    );
  }
}
