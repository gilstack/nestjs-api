import { HttpStatus } from '@nestjs/common';
import { AppException } from '@shared/infrastructure/http/exceptions/app.exception';

export type AnnouncementErrorCode =
  | 'ANNOUNCEMENT_NOT_FOUND'
  | 'ANNOUNCEMENT_INVALID_DATES'
  | 'ANNOUNCEMENT_ALREADY_EXISTS'
  | 'ANNOUNCEMENT_INVALID_TARGET';

export class AnnouncementException extends AppException {
  constructor(
    code: AnnouncementErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message, statusCode });
  }

  static notFound(): AnnouncementException {
    return new AnnouncementException(
      'ANNOUNCEMENT_NOT_FOUND',
      'Announcement not found',
      HttpStatus.NOT_FOUND,
    );
  }

  static invalidDates(): AnnouncementException {
    return new AnnouncementException(
      'ANNOUNCEMENT_INVALID_DATES',
      'Start date cannot be after expiration date',
    );
  }

  static invalidTarget(): AnnouncementException {
    return new AnnouncementException(
      'ANNOUNCEMENT_INVALID_TARGET',
      'Invalid target audience',
    );
  }
}
