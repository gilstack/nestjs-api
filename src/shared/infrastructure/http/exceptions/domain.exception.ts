import { HttpStatus } from '@nestjs/common';
import { AppException, type AppExceptionOptions } from './app.exception';

export class DomainException extends AppException {
  constructor(options: Omit<AppExceptionOptions, 'statusCode'> & { statusCode?: HttpStatus }) {
    super({
      ...options,
      statusCode: options.statusCode ?? HttpStatus.UNPROCESSABLE_ENTITY,
    });
  }
}
