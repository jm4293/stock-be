import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities';
import { CreateUserDto } from '../../../type/interface';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(dto: Pick<CreateUserDto, 'nickname' | 'name' | 'age' | 'policy' | 'birthdate'>) {
    const { nickname, name, age, policy, birthdate } = dto;

    const user = this.userRepository.create({ nickname, name, age, policy, birthdate });

    return await this.userRepository.save(user);
  }
}
