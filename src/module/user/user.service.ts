import { Injectable } from '@nestjs/common';
import {
  UserAccountRepository,
  UserNotificationRepository,
  UserPushTokenRepository,
  UserRepository,
} from '../../database/repository';
import { Request } from 'express';
import { ReadUserNotificationDto, RegisterUserPushTokenDto } from '../../type/dto';
import { ResConfig } from '../../config';

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

    const userPushToken = await this.userPushTokenRepository.findOne({ where: { user: { userSeq } } });

    if (userPushToken) {
      userPushToken.pushToken = pushToken;
      userPushToken.deviceNo = String(platform);

      await this.userPushTokenRepository.save(userPushToken);
    } else {
      await this.userPushTokenRepository.save({ user, pushToken, deviceNo: String(platform) });
    }
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
      .orderBy('userNotification.createdAt', 'DESC')
      .skip((pageParam - 1) * LIMIT)
      .take(LIMIT);

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

    const notification = await this.userNotificationRepository.findOne({
      where: { user: { userSeq }, userNotificationSeq },
    });

    if (!notification) {
      throw ResConfig.Fail_400({ message: '알림이 존재하지 않습니다.' });
    }

    notification.isRead = true;

    await this.userNotificationRepository.save(notification);
  }

  async readAllNotification(req: Request) {
    const { userSeq } = req.user;

    await this.userRepository.findUserByUserSeq(userSeq);

    await this.userNotificationRepository.update({ user: { userSeq }, isRead: false }, { isRead: true });
  }

  async deleteNotification(params: { userNotificationSeq: number; req: Request }) {
    const { userNotificationSeq, req } = params;
    const { userSeq } = req.user;

    await this.userRepository.findUserByUserSeq(userSeq);

    await this.userNotificationRepository.update({ userNotificationSeq }, { isDeleted: true, deletedAt: new Date() });
  }
}
