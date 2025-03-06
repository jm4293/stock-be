import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { UserNotification } from '../../entities';
import { ResConfig } from '../../../config';

@Injectable()
export class UserNotificationRepository extends Repository<UserNotification> {
  constructor(manager: EntityManager) {
    super(UserNotification, manager);
  }

  async readNotification(params: { userSeq: number; userNotificationSeq: number }) {
    const { userSeq, userNotificationSeq } = params;

    const notification = await this.findOne({
      where: { user: { userSeq }, userNotificationSeq },
    });

    if (!notification) {
      throw ResConfig.Fail_400({ message: '알림이 존재하지 않습니다.' });
    }

    if (notification.isRead) {
      throw ResConfig.Fail_400({ message: '이미 읽은 알림입니다.' });
    }

    notification.isRead = true;

    await this.save(notification);
  }
}
