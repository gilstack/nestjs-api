import { HttpStatus } from '@nestjs/common';
import { AppException } from '@shared/infrastructure/http/exceptions/app.exception';

export type AuthErrorCode =
  | 'AUTH_INVALID_TOKEN'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_REFRESH_TOKEN_MISSING'
  | 'AUTH_REFRESH_TOKEN_INVALID'
  | 'AUTH_SESSION_NOT_FOUND'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_USER_INACTIVE'
  | 'AUTH_USER_BLOCKED'
  | 'AUTH_USER_NOT_FOUND'
  | 'AUTH_INVALID_DOMAIN'
  | 'AUTH_INSUFFICIENT_PERMISSIONS'
  | 'AUTH_UNAUTHORIZED';

export class AuthException extends AppException {
  constructor(
    code: AuthErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.UNAUTHORIZED,
  ) {
    super({ code, message, statusCode });
  }

  static invalidToken(): AuthException {
    return new AuthException('AUTH_INVALID_TOKEN', 'Token inválido ou expirado');
  }

  static tokenExpired(): AuthException {
    return new AuthException('AUTH_TOKEN_EXPIRED', 'Token expirado');
  }

  static refreshTokenMissing(): AuthException {
    return new AuthException('AUTH_REFRESH_TOKEN_MISSING', 'Refresh token não encontrado');
  }

  static refreshTokenInvalid(): AuthException {
    return new AuthException('AUTH_REFRESH_TOKEN_INVALID', 'Refresh token inválido');
  }

  static sessionNotFound(): AuthException {
    return new AuthException('AUTH_SESSION_NOT_FOUND', 'Sessão não encontrada');
  }

  static sessionExpired(): AuthException {
    return new AuthException('AUTH_SESSION_EXPIRED', 'Sessão expirada');
  }

  static userInactive(): AuthException {
    return new AuthException('AUTH_USER_INACTIVE', 'Usuário inativo', HttpStatus.FORBIDDEN);
  }

  static userBlocked(): AuthException {
    return new AuthException('AUTH_USER_BLOCKED', 'Usuário bloqueado', HttpStatus.FORBIDDEN);
  }

  static userNotFound(): AuthException {
    return new AuthException('AUTH_USER_NOT_FOUND', 'Usuário não encontrado', HttpStatus.NOT_FOUND);
  }

  static invalidDomain(): AuthException {
    return new AuthException(
      'AUTH_INVALID_DOMAIN',
      'Acesso não permitido para este domínio',
      HttpStatus.FORBIDDEN,
    );
  }

  static insufficientPermissions(): AuthException {
    return new AuthException(
      'AUTH_INSUFFICIENT_PERMISSIONS',
      'Permissões insuficientes para acessar o admin',
      HttpStatus.FORBIDDEN,
    );
  }

  static unauthorized(): AuthException {
    return new AuthException('AUTH_UNAUTHORIZED', 'Não autorizado');
  }
}
