import { ApiProperty } from '@nestjs/swagger';
import type { UserStatus, UserRole } from '../../domain/enums';

export class UserResponseDto {
  @ApiProperty({ description: 'Unique user identifier' })
  id: string;

  @ApiProperty({ description: 'User username' })
  username: string;

  @ApiProperty({ description: 'User tag' })
  tag: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User display name', nullable: true })
  name: string | null;

  @ApiProperty({ description: 'User profile image URL', nullable: true })
  image: string | null;

  @ApiProperty({ description: 'User biography', nullable: true })
  bio: string | null;

  @ApiProperty({ description: 'User role' })
  role: UserRole;

  @ApiProperty({ description: 'User status' })
  status: UserStatus;

  @ApiProperty({ description: 'Account verification date', nullable: true })
  verifiedAt: Date | null;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
