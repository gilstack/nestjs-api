import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { RequestUser } from '../strategies/jwt-cookie.strategy';

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;

    return data ? user[data] : user;
  },
);
