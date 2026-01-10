import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

import { AnnouncementStatus, AnnouncementTarget, AnnouncementType } from '../../domain/enums/announcement.enums';

export class CreateAnnouncementDto {
  @ApiProperty({
    description: 'The content of the announcement',
    example: 'New feature released!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Optional URL for the announcement',
    example: 'https://example.com/feature',
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({
    enum: AnnouncementType,
    description: 'Type of the announcement',
    example: AnnouncementType.INFO,
  })
  @IsEnum(AnnouncementType)
  type: AnnouncementType;

  @ApiPropertyOptional({
    enum: AnnouncementTarget,
    description: 'Target audience for the announcement',
    default: AnnouncementTarget.ALL,
    example: AnnouncementTarget.ALL,
  })
  @IsOptional()
  @IsEnum(AnnouncementTarget)
  target?: AnnouncementTarget;

  @ApiPropertyOptional({
    enum: [AnnouncementStatus.DRAFT, AnnouncementStatus.SCHEDULED, AnnouncementStatus.ACTIVE],
    description: 'Initial status of the announcement',
    default: AnnouncementStatus.DRAFT,
    example: AnnouncementStatus.SCHEDULED,
  })
  @IsOptional()
  @IsIn([AnnouncementStatus.DRAFT, AnnouncementStatus.SCHEDULED, AnnouncementStatus.ACTIVE])
  status?: AnnouncementStatus;

  @ApiPropertyOptional({
    description: 'Start date for the announcement',
    type: Date,
    default: 'now',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startedAt?: Date;

  @ApiPropertyOptional({
    description: 'Expiration date for the announcement',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiredAt?: Date;
}
