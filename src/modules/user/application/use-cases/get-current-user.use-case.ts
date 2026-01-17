import { Inject, Injectable } from '@nestjs/common';
import { AbilityFactory } from '@modules/authorization/application/factories/ability.factory';

// internal
import { REPOSITORY_TOKENS } from '@shared/constants/injection-tokens';

// relatives
import { UserException } from '../../domain/exceptions';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { UserResponseDto } from '../dtos/user.response.dto';
import { UserMapper } from '../../infrastructure/mappers/user.mapper';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw UserException.notFound();
    }
    
    const rules = this.abilityFactory.createRulesForUser(user);

    return UserMapper.toResponseDto(user, rules);
  }
}

