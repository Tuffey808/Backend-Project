import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerToken(
    userId: string,
    token: string,
    platform?: string,
  ) {
    return this.prisma.pushToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform },
    });
  }

  async removeToken(userId: string, token: string) {
    await this.prisma.pushToken.deleteMany({ where: { userId, token } });
    return { success: true };
  }

  listTokens(userId: string) {
    return this.prisma.pushToken.findMany({ where: { userId } });
  }

  /**
   * Send push via FCM legacy HTTP when FCM_SERVER_KEY is set.
   * Without the key, tokens are still stored and the call is a no-op success.
   */
  async notifyUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const tokens = await this.listTokens(userId);
    const serverKey = process.env.FCM_SERVER_KEY?.trim();

    if (!tokens.length) {
      return {
        success: true,
        delivered: false,
        queued: 0,
        title,
        body,
        message: 'No device tokens registered',
      };
    }

    if (!serverKey) {
      this.logger.warn(
        `FCM_SERVER_KEY missing — would notify ${tokens.length} device(s): ${title}`,
      );
      return {
        success: true,
        delivered: false,
        queued: tokens.length,
        title,
        body,
        message: 'Tokens stored; set FCM_SERVER_KEY to deliver',
      };
    }

    let sent = 0;
    const errors: string[] = [];
    for (const row of tokens) {
      try {
        const res = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            Authorization: `key=${serverKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: row.token,
            notification: { title, body },
            data: data || {},
            priority: 'high',
          }),
        });
        if (res.ok) {
          sent += 1;
        } else {
          const text = await res.text();
          errors.push(text.slice(0, 200));
          // Drop invalid tokens
          if (res.status === 404 || text.includes('NotRegistered')) {
            await this.prisma.pushToken.delete({ where: { id: row.id } }).catch(() => undefined);
          }
        }
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'send failed');
      }
    }

    return {
      success: sent > 0,
      delivered: sent > 0,
      queued: tokens.length,
      sent,
      title,
      body,
      errors: errors.slice(0, 3),
    };
  }

  notifyVendorsOfNewOrder(vendorIds: string[], orderNumber: string) {
    return Promise.all(
      vendorIds.map((id) =>
        this.notifyUser(
          id,
          'طلب جديد',
          `لديك طلب جديد ${orderNumber}`,
          { type: 'new_order', orderNumber },
        ),
      ),
    );
  }
}
