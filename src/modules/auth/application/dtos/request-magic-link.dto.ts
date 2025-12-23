import { IsEmail } from 'class-validator';

export class RequestMagicLinkDto {
    @IsEmail({}, { message: 'Email inválido' })
    email: string;
}
