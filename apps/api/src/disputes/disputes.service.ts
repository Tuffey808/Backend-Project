import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DisputeStatus, Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(
    openedById: string,
    body: {
      subject: string;
      description: string;
      orderId?: string | number;
      vendorId?: string;
    },
  ) {
    let orderId: string | undefined;
    let vendorId = body.vendorId;

    if (body.orderId != null) {
      const order = await this.prisma.order.findFirst({
        where: {
          OR: [
            { id: String(body.orderId) },
            {
              numericId: Number.isFinite(Number(body.orderId))
                ? Number(body.orderId)
                : -1,
            },
          ],
        },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      orderId = order.id;
      vendorId = vendorId || order.vendorId || undefined;
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        openedById,
        orderId,
        vendorId,
        subject: body.subject.trim(),
        description: body.description.trim(),
      },
    });

    // Notify all admins
    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN, active: true },
      select: { id: true },
    });
    await Promise.all(
      admins.map((a) =>
        this.notifications.notifyUser(
          a.id,
          'نزاع جديد',
          dispute.subject,
          { type: 'dispute_open', disputeId: dispute.id },
        ),
      ),
    );

    return dispute;
  }

  list(user: { id: string; role: Role }) {
    if (user.role === Role.ADMIN) {
      return this.prisma.dispute.findMany({
        include: {
          openedBy: { select: { id: true, name: true, email: true } },
          vendor: { select: { id: true, name: true, email: true } },
          order: { select: { orderNumber: true, numericId: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    if (user.role === Role.VENDOR) {
      return this.prisma.dispute.findMany({
        where: { vendorId: user.id },
        include: {
          openedBy: { select: { id: true, name: true } },
          order: { select: { orderNumber: true, numericId: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.dispute.findMany({
      where: { openedById: user.id },
      include: {
        order: { select: { orderNumber: true, numericId: true } },
        vendor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolve(
    id: string,
    actor: { id: string; role: Role },
    body: { status: DisputeStatus; resolution?: string },
  ) {
    if (actor.role !== Role.ADMIN) {
      throw new ForbiddenException();
    }
    const dispute = await this.prisma.dispute.findUnique({ where: { id } });
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const updated = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: body.status,
        resolution: body.resolution?.trim(),
      },
    });

    await this.notifications.notifyUser(
      dispute.openedById,
      'تحديث النزاع',
      `حالة النزاع: ${body.status}`,
      { type: 'dispute_update', disputeId: id, status: body.status },
    );

    return updated;
  }
}
