import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyMagicLinkDto {
  @ApiProperty({ description: 'Magic link token received via email', example: 'a'.repeat(64) })
  @IsString()
  @IsNotEmpty()
  @Length(64, 64, { message: 'Token inválido' })
  token: string;
}
