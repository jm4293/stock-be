import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities';
import { CreateUserEmailDto, UpdateUserDto } from '../../../type/interface';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(dto: Pick<CreateUserEmailDto, 'nickname' | 'name' | 'policy' | 'birthdate' | 'thumbnail'>) {
    const { nickname, name, policy, birthdate, thumbnail } = dto;

    const user = this.userRepository.create({ nickname, name, policy, birthdate, thumbnail });

    return await this.userRepository.save(user);
  }

  async findUserByUserSeq(userSeq: number) {
    return await this.userRepository.findOne({ where: { userSeq } });
  }

  async updateUserByUserSeq(params: UpdateUserDto) {
    const { userSeq, nickname, name, birthdate, thumbnail } = params;

    return await this.userRepository.update({ userSeq }, { nickname, name, birthdate, thumbnail });
  }
}
