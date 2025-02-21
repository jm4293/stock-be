import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../database/repository';
import { CreateUserDto } from '../../type/interface/dto';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(createUserDto: CreateUserDto) {
    await this.userRepository.createUser(createUserDto);
  }
}
