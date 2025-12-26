import { ApiProperty } from '@nestjs/swagger';

class AuthUserDto {
  @ApiProperty({ description: 'Unique user identifier', example: 'clxyz123abc' })
  id: string;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Unique username', example: 'johndoe' })
  username: string;

  @ApiProperty({ description: 'Unique user tag', example: '1234' })
  tag: string;

  @ApiProperty({ description: 'User display name', example: 'John Doe', nullable: true })
  name: string | null;

  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({ description: 'User role', example: 'USER' })
  role: string;

  @ApiProperty({ description: 'User account status', example: 'ACTIVE' })
  status: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Authenticated user information', type: AuthUserDto })
  user: AuthUserDto;
}
