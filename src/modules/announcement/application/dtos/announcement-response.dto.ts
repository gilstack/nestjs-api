import { ApiProperty } from '@nestjs/swagger';
import { Announcement } from '../../domain/entities/announcement.entity';
import { AnnouncementStatus, AnnouncementTarget, AnnouncementType } from '../../domain/enums/announcement.enums';

export class AnnouncementResponseDto {
  @ApiProperty({ example: 'cl1234567890' })
  id: string;

  @ApiProperty({ example: 'Maintenance warning' })
  content: string;

  @ApiProperty({ example: 'https://status.page', required: false })
  url?: string;

  @ApiProperty({ enum: AnnouncementType, example: AnnouncementType.WARNING })
  type: AnnouncementType;

  @ApiProperty({ enum: AnnouncementStatus, example: AnnouncementStatus.ACTIVE })
  status: AnnouncementStatus;

  @ApiProperty({ enum: AnnouncementTarget, example: AnnouncementTarget.ALL })
  target: AnnouncementTarget;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  startedAt: Date;

  @ApiProperty({ example: '2023-01-02T00:00:00Z', required: false })
  expiredAt?: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  updatedAt: Date;

  constructor(entity: Announcement) {
    this.id = entity.id;
    this.content = entity.content;
    this.url = entity.url;
    this.type = entity.type;
    this.status = entity.status;
    this.target = entity.target;
    this.startedAt = entity.startedAt;
    this.expiredAt = entity.expiredAt;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
