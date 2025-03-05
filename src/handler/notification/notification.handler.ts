import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationHandler {
  async sendPushNotification(pushToken: string, message: admin.messaging.Message) {
    try {
      await admin.messaging().send({
        token: pushToken,
        notification: {
          title: message.notification?.title,
          body: message.notification?.body,
        },
      });
      console.log('Push notification sent successfully');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}
