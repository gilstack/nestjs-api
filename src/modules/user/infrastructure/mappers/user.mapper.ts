import type { User } from '../../domain/entities/user.entity';
import type { UserResponseDto } from '../../application/dtos/user.response.dto';

export class UserMapper {
  static toResponseDto(user: User, rules: any[] = []): UserResponseDto {
    const emailAccount = user.accounts?.find((acc) => acc.provider === 'EMAIL');
    const email = emailAccount?.identifier || user.accounts?.[0]?.identifier || '';

    return {
      id: user.id,
      email,
      username: user.username,
      tag: user.tag,
      name: user.name,
      image: user.image,
      bio: user.bio,
      role: user.role,
      status: user.status,
      verifiedAt: user.verifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      rules,
    };
  }
}
