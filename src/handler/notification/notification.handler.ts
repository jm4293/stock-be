import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationHandler {
  async sendPushNotification(params: { pushToken: string; title: string; message: string }) {
    const { pushToken, title, message } = params;

    try {
      await admin.messaging().send({
        token: pushToken,
        notification: { title, body: message },
      });
      console.log('Push notification sent successfully');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}
