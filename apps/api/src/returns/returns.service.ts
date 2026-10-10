import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReturnStatus, Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(
    userId: string,
    body: { orderId: string | number; reason: string; vendorId?: string },
  ) {
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        OR: [
          { id: String(body.orderId) },
          {
            numericId: Number.isFinite(Number(body.orderId))
              ? Number(body.orderId)
              : -1,
          },
        ],
      },
      include: { childOrders: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    let vendorId = body.vendorId || order.vendorId || undefined;
    if (!vendorId && order.childOrders.length === 1) {
      vendorId = order.childOrders[0].vendorId || undefined;
    }

    const created = await this.prisma.returnRequest.create({
      data: {
        orderId: order.parentOrderId ? order.id : order.id,
        userId,
        vendorId,
        reason: body.reason.trim(),
      },
      include: {
        order: { select: { orderNumber: true, numericId: true } },
      },
    });

    if (vendorId) {
      await this.notifications.notifyUser(
        vendorId,
        'طلب إرجاع',
        `طلب إرجاع للطلب ${created.order.orderNumber}`,
        { type: 'return_request', returnId: created.id },
      );
    }

    return created;
  }

  listForUser(user: { id: string; role: Role }) {
    if (user.role === Role.ADMIN) {
      return this.prisma.returnRequest.findMany({
        include: {
          order: { select: { orderNumber: true, numericId: true } },
          user: { select: { id: true, name: true, email: true } },
          vendor: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    if (user.role === Role.VENDOR) {
      return this.prisma.returnRequest.findMany({
        where: { vendorId: user.id },
        include: {
          order: { select: { orderNumber: true, numericId: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.returnRequest.findMany({
      where: { userId: user.id },
      include: {
        order: { select: { orderNumber: true, numericId: true } },
        vendor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    id: string,
    actor: { id: string; role: Role },
    status: ReturnStatus,
    adminNotes?: string,
  ) {
    const row = await this.prisma.returnRequest.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Return request not found');
    }
    if (
      actor.role === Role.VENDOR &&
      row.vendorId !== actor.id
    ) {
      throw new ForbiddenException();
    }
    if (actor.role === Role.CUSTOMER) {
      throw new ForbiddenException();
    }

    const updated = await this.prisma.returnRequest.update({
      where: { id },
      data: {
        status,
        adminNotes:
          actor.role === Role.ADMIN ? adminNotes?.trim() : row.adminNotes,
      },
    });

    await this.notifications.notifyUser(
      row.userId,
      'تحديث الإرجاع',
      `حالة طلب الإرجاع: ${status}`,
      { type: 'return_update', returnId: id, status },
    );

    return updated;
  }
}
