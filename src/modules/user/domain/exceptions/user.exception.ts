import { HttpStatus } from '@nestjs/common';
import { AppException } from '@shared/infrastructure/http/exceptions/app.exception';

export type UserErrorCode = 'USER_NOT_FOUND' | 'USER_INACTIVE' | 'USER_BLOCKED';

export class UserException extends AppException {
  constructor(
    code: UserErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message, statusCode });
  }

  static notFound(): UserException {
    return new UserException('USER_NOT_FOUND', 'User not found', HttpStatus.NOT_FOUND);
  }

  static inactive(): UserException {
    return new UserException('USER_INACTIVE', 'User is inactive', HttpStatus.FORBIDDEN);
  }

  static blocked(): UserException {
    return new UserException('USER_BLOCKED', 'User is blocked', HttpStatus.FORBIDDEN);
  }
}
