import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyMagicLinkDto {
    @IsString()
    @IsNotEmpty()
    @Length(64, 64, { message: 'Token inválido' })
    token: string;
}
