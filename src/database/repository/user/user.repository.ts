import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../../entities';
import { CreateUserEmailDto } from '../../../type/dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(manager: EntityManager) {
    super(User, manager);
  }

  async createUser(dto: Pick<CreateUserEmailDto, 'nickname' | 'name' | 'policy' | 'birthdate' | 'thumbnail'>) {
    const { nickname, name, policy, birthdate, thumbnail } = dto;

    const user = this.create({ nickname, name, policy, birthdate, thumbnail });

    return await this.save(user);
  }
}
