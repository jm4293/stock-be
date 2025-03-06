import { Injectable } from '@nestjs/common';
import {
  UserAccountRepository,
  UserNotificationRepository,
  UserPushTokenRepository,
  UserRepository,
} from '../../database/repository';
import { Request } from 'express';
import { ReadUserNotificationDto, RegisterUserPushTokenDto } from '../../type/dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAccountRepository: UserAccountRepository,
    private readonly userPushTokenRepository: UserPushTokenRepository,
    private readonly userNotificationRepository: UserNotificationRepository,
  ) {}

  async getMyInfo(req: Request) {
    const { userSeq, userAccountType } = req.user;

    const userAccount = await this.userAccountRepository.findOne({
      where: { user: { userSeq }, userAccountType },
      relations: ['user'],
    });

    if (!userAccount) {
      throw new Error('사용자 계정이 존재하지 않습니다.');
    }

    const { email, user } = userAccount;
    const { nickname, name, thumbnail } = user;

    return { email, nickname, name, thumbnail, userAccountType };
  }

  async registerPushToken(params: { dto: RegisterUserPushTokenDto; req: Request }) {
    const { dto, req } = params;
    const { pushToken } = dto;

    const { userSeq } = req.user;
    const { 'sec-ch-ua-platform': platform } = req.headers;

    const user = await this.userRepository.findUserByUserSeq(userSeq);

    await this.userPushTokenRepository.upsert(
      { user, pushToken, deviceNo: String(platform) },
      { conflictPaths: ['user'] },
    );
  }

  async getNotificationList(params: { pageParam: number; req: Request }) {
    const { pageParam, req } = params;
    const { userSeq } = req.user;

    const LIMIT = 5;

    const queryBuilder = this.userNotificationRepository
      .createQueryBuilder('userNotification')
      .leftJoinAndSelect('userNotification.user', 'user')
      .where('userNotification.user = :userSeq', { userSeq })
      .andWhere('userNotification.isDeleted = false')
      .orderBy('userNotification.createdAt', 'DESC');

    const [notifications, total] = await queryBuilder.getManyAndCount();

    const hasNextPage = pageParam * LIMIT < total;
    const nextPage = hasNextPage ? pageParam + 1 : null;

    return { notifications, total, nextPage };
  }

  async readNotification(params: { dto: ReadUserNotificationDto; req: Request }) {
    const { dto, req } = params;

    const { userNotificationSeq } = dto;
    const { userSeq } = req.user;

    await this.userRepository.findUserByUserSeq(userSeq);

    await this.userNotificationRepository.readNotification({ userSeq, userNotificationSeq });
  }

  async deleteNotification(params: { dto: ReadUserNotificationDto; req: Request }) {
    const { dto, req } = params;

    const { userNotificationSeq } = dto;
    const { userSeq } = req.user;

    await this.userRepository.findUserByUserSeq(userSeq);

    await this.userNotificationRepository.update({ userNotificationSeq }, { isDeleted: true, deletedAt: new Date() });
  }
}
