import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { AnnouncementStatus, AnnouncementTarget, AnnouncementType } from '../../domain/enums/announcement.enums';

export class UpdateAnnouncementDto {
  @ApiPropertyOptional({ description: 'The content of the announcement' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiPropertyOptional({ description: 'Optional URL' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ enum: AnnouncementType })
  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType;

  @ApiPropertyOptional({ enum: AnnouncementTarget })
  @IsOptional()
  @IsEnum(AnnouncementTarget)
  target?: AnnouncementTarget;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startedAt?: Date;

  @ApiPropertyOptional({ description: 'Expiration date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiredAt?: Date;

  @ApiPropertyOptional({ enum: AnnouncementStatus })
  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;
}
