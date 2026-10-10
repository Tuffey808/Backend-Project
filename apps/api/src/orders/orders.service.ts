import { BadRequestException, Injectable } from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  VendorFulfillmentStatus,
} from '@prisma/client';
import { AddressesService } from '../addresses/addresses.service';
import { money, taxOn } from '../common/mobile.utils';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly addresses: AddressesService,
    private readonly notifications: NotificationsService,
  ) {}

  serializeOrder(
    order: {
      id: string;
      numericId: number;
      orderNumber: string;
      amountTotal: { toString(): string } | number;
      amountTax: { toString(): string } | number;
      amountUntaxed: { toString(): string } | number;
      amountDiscount: { toString(): string } | number;
      platformCommission?: { toString(): string } | number;
      vendorEarnings?: { toString(): string } | number;
      status: OrderStatus;
      paymentStatus: PaymentStatus;
      fulfillmentStatus?: VendorFulfillmentStatus;
      invoiceUrl: string | null;
      createdAt: Date;
      discountCode: string | null;
      parentOrderId?: string | null;
      vendorId?: string | null;
      vendor?: { id: string; name: string; vendorProfile?: { storeName: string; slug: string } | null } | null;
      user: { name: string; email: string; numericId: number };
      address: {
        numericId: number;
        name: string;
        street: string;
        street2: string | null;
        city: string;
        state: string | null;
        zip: string | null;
        mobile: string | null;
      } | null;
      lines: Array<{
        id: string;
        title: string;
        titleAr: string | null;
        imageUrl: string | null;
        productNumericId: number | null;
        vendorId: string | null;
        quantity: number;
        unitPrice: { toString(): string } | number;
        size: string | null;
        color: string | null;
      }>;
      trackingEvents?: Array<{
        id: string;
        status: string;
        description: string | null;
        createdAt: Date;
      }>;
      childOrders?: Array<{
        id: string;
        numericId: number;
        orderNumber: string;
        vendorId: string | null;
        fulfillmentStatus: VendorFulfillmentStatus;
        status: OrderStatus;
        amountTotal: { toString(): string } | number;
        vendor?: { name: string; vendorProfile?: { storeName: string; slug: string } | null } | null;
      }>;
    },
  ) {
    const untaxed = money(order.amountUntaxed);
    const tax = money(order.amountTax);
    const total = money(order.amountTotal);
    const discount = money(order.amountDiscount);
    const undiscounted = money(untaxed + discount);

    return {
      userInfo: {
        name: order.user.name,
        email: order.user.email || '',
        address: order.address
          ? {
              ...this.addresses.serialize(order.address),
              email: order.user.email || '',
            }
          : {
              street: '',
              street2: '',
              city: '',
              state: '',
              zip: '',
              mobile: '',
              name: order.user.name,
              email: order.user.email || '',
              _id: String(order.user.numericId),
            },
      },
      _id: String(order.numericId),
      id: order.id,
      orderNumber: order.orderNumber,
      userID: String(order.user.numericId),
      price: total,
      total_tax: tax,
      amount_untaxed: untaxed,
      amount_undiscounted: undiscounted,
      amount_discount: discount,
      platform_commission: money(order.platformCommission ?? 0),
      vendor_earnings: money(order.vendorEarnings ?? 0),
      tax_totals: {
        amount_untaxed: untaxed,
        amount_total: total,
        formatted_amount_total: `${total} SAR`,
        formatted_amount_untaxed: `${untaxed} SAR`,
        groups_by_subtotal: {},
        subtotals: [{ name: 'Untaxed Amount', amount: untaxed, formatted_amount: `${untaxed} SAR` }],
        subtotals_order: ['Untaxed Amount'],
        display_tax_base: true,
      },
      status: order.status.toLowerCase(),
      fulfillmentStatus: order.fulfillmentStatus || VendorFulfillmentStatus.PENDING,
      paymentStatus:
        order.paymentStatus === PaymentStatus.PAID ||
        order.paymentStatus === PaymentStatus.COD,
      createdAt: order.createdAt.toISOString().replace('T', ' ').slice(0, 19),
      invoice_id: false,
      invoice_url: order.invoiceUrl || false,
      vendor: order.vendor
        ? {
            id: order.vendor.id,
            name: order.vendor.vendorProfile?.storeName || order.vendor.name,
            slug: order.vendor.vendorProfile?.slug || false,
          }
        : false,
      parentOrderId: order.parentOrderId || false,
      products: order.lines.map((line) => ({
        title: line.title,
        titleAr: line.titleAr || line.title,
        productNo: false,
        img: line.imageUrl || '',
        price: money(line.unitPrice),
        productID: String(line.productNumericId || ''),
        quantity: line.quantity,
        size: line.size || '',
        color: line.color || false,
        vendor_id: line.vendorId || false,
        _id: line.id,
      })),
      tracking: (order.trackingEvents || []).map((t) => ({
        id: t.id,
        status: t.status,
        description: t.description || '',
        createdAt: t.createdAt.toISOString().replace('T', ' ').slice(0, 19),
      })),
      subOrders: (order.childOrders || []).map((c) => ({
        id: c.id,
        _id: String(c.numericId),
        orderNumber: c.orderNumber,
        status: c.status.toLowerCase(),
        fulfillmentStatus: c.fulfillmentStatus,
        price: money(c.amountTotal),
        vendor: c.vendor
          ? {
              name: c.vendor.vendorProfile?.storeName || c.vendor.name,
              slug: c.vendor.vendorProfile?.slug || false,
            }
          : false,
      })),
    };
  }

  private include = {
    user: true,
    address: true,
    lines: true,
    vendor: { include: { vendorProfile: true } },
    trackingEvents: { orderBy: { createdAt: 'asc' as const } },
    childOrders: {
      include: {
        vendor: { include: { vendorProfile: true } },
        lines: true,
        trackingEvents: { orderBy: { createdAt: 'asc' as const } },
      },
    },
  } as const;

  async list(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId, parentOrderId: null },
      include: this.include,
      orderBy: { createdAt: 'desc' },
    });
    return {
      success: true,
      message: 'OK',
      salesOrders: orders.map((o) => this.serializeOrder(o)),
    };
  }

  private async nextOrderNumber(tx: Prisma.TransactionClient, prefix = 'SO') {
    const count = await tx.order.count();
    return `${prefix}${String(count + 1).padStart(5, '0')}`;
  }

  private async getCommissionPercent(
    tx: Prisma.TransactionClient,
    vendorId: string | null,
  ) {
    if (vendorId) {
      const profile = await tx.vendorProfile.findUnique({
        where: { userId: vendorId },
      });
      if (profile?.commissionPercent != null) {
        return Number(profile.commissionPercent);
      }
    }
    const settings = await tx.platformSettings.findUnique({
      where: { id: 'default' },
    });
    return Number(settings?.defaultCommissionPercent ?? 10);
  }

  async createFromCart(userId: string, partnerId: unknown) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, message: 'Unauthorized', status: 401 };
    }

    const address = await this.prisma.address.findFirst({
      where: {
        userId,
        OR: [{ numericId: Number(partnerId) }],
      },
    });
    if (!address && partnerId != null && Number(partnerId) !== user.numericId) {
      return { success: false, message: 'Invalid delivery address', status: 400 };
    }

    const cartLines = await this.prisma.cartLine.findMany({
      where: { userId },
      include: { product: true },
    });
    if (!cartLines.length) {
      return { success: false, message: 'Cart is empty', status: 400 };
    }

    for (const cl of cartLines) {
      if (cl.product.qtyAvailable < cl.quantity) {
        return {
          success: false,
          message: `Insufficient stock for ${cl.product.name}`,
          status: 400,
        };
      }
    }

    const byVendor = new Map<string, typeof cartLines>();
    for (const cl of cartLines) {
      const key = cl.product.ownerId || 'platform';
      const list = byVendor.get(key) || [];
      list.push(cl);
      byVendor.set(key, list);
    }

    const order = await this.prisma.$transaction(async (tx) => {
      let parentUntaxed = 0;
      const vendorGroups = [...byVendor.entries()];

      const parentNumber = await this.nextOrderNumber(tx, 'SO');
      const parent = await tx.order.create({
        data: {
          orderNumber: parentNumber,
          userId,
          addressId: address?.id,
          status: OrderStatus.DRAFT,
          paymentStatus: PaymentStatus.UNPAID,
          amountUntaxed: 0,
          amountTax: 0,
          amountDiscount: 0,
          amountTotal: 0,
        },
      });

      for (const [vendorKey, lines] of vendorGroups) {
        const vendorId = vendorKey === 'platform' ? null : vendorKey;
        let untaxed = 0;
        const lineCreates: Prisma.OrderLineCreateWithoutOrderInput[] = [];

        for (const cl of lines) {
          const unit = money(cl.unitPrice);
          untaxed += unit * cl.quantity;
          lineCreates.push({
            product: { connect: { id: cl.productId } },
            productNumericId: cl.product.numericId,
            vendorId,
            title: cl.product.name,
            titleAr: cl.product.nameAr,
            imageUrl: cl.product.imageUrl,
            quantity: cl.quantity,
            unitPrice: unit,
            size: cl.sizeName,
            color: cl.colorName,
          });

          const updated = await tx.product.updateMany({
            where: {
              id: cl.productId,
              qtyAvailable: { gte: cl.quantity },
            },
            data: { qtyAvailable: { decrement: cl.quantity } },
          });
          if (updated.count === 0) {
            throw new BadRequestException(
              `Insufficient stock for ${cl.product.name}`,
            );
          }
        }

        untaxed = money(untaxed);
        const tax = taxOn(untaxed);
        const total = money(untaxed + tax);
        const commissionPct = await this.getCommissionPercent(tx, vendorId);
        const commission = money((untaxed * commissionPct) / 100);
        const earnings = money(Math.max(0, untaxed - commission));
        parentUntaxed += untaxed;

        const childNumber = await this.nextOrderNumber(tx, 'SV');
        const child = await tx.order.create({
          data: {
            orderNumber: childNumber,
            userId,
            addressId: address?.id,
            parentOrderId: parent.id,
            vendorId,
            status: OrderStatus.DRAFT,
            paymentStatus: PaymentStatus.UNPAID,
            fulfillmentStatus: VendorFulfillmentStatus.PENDING,
            amountUntaxed: untaxed,
            amountTax: tax,
            amountDiscount: 0,
            amountTotal: total,
            platformCommission: commission,
            vendorEarnings: earnings,
            lines: { create: lineCreates },
          },
        });

        await tx.orderTracking.create({
          data: {
            orderId: child.id,
            status: 'placed',
            description: 'Order placed with vendor',
          },
        });
      }

      const parentTax = taxOn(parentUntaxed);
      const parentTotal = money(parentUntaxed + parentTax);
      await tx.order.update({
        where: { id: parent.id },
        data: {
          amountUntaxed: money(parentUntaxed),
          amountTax: parentTax,
          amountTotal: parentTotal,
        },
      });

      await tx.cartLine.deleteMany({ where: { userId } });

      await tx.orderTracking.create({
        data: {
          orderId: parent.id,
          status: 'placed',
          description: 'Order placed',
        },
      });

      return tx.order.findUniqueOrThrow({
        where: { id: parent.id },
        include: this.include,
      });
    });

    const vendorIds = [
      ...new Set(
        (order.childOrders || [])
          .map((c) => c.vendorId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    void this.notifications.notifyVendorsOfNewOrder(
      vendorIds,
      order.orderNumber,
    );

    const serialized = this.serializeOrder(order);
    return {
      success: true,
      message: 'Order created',
      sale_id: order.numericId,
      data: [serialized],
    };
  }

  async cancel(userId: string, saleOrderId: unknown) {
    const order = await this.prisma.order.findFirst({
      where: { numericId: Number(saleOrderId), userId },
      include: { lines: true, childOrders: { include: { lines: true } } },
    });
    if (!order) {
      return { success: false, message: 'Order not found', status: 404 };
    }
    if (
      order.status !== OrderStatus.DRAFT &&
      order.status !== OrderStatus.SENT
    ) {
      return {
        success: false,
        message: 'Order cannot be cancelled in current state',
        status: 400,
      };
    }

    await this.prisma.$transaction(async (tx) => {
      const restoreLines = [
        ...order.lines,
        ...order.childOrders.flatMap((c) => c.lines),
      ];
      for (const line of restoreLines) {
        if (line.productId) {
          await tx.product.update({
            where: { id: line.productId },
            data: { qtyAvailable: { increment: line.quantity } },
          });
        }
      }
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCEL,
          fulfillmentStatus: VendorFulfillmentStatus.CANCELLED,
        },
      });
      await tx.order.updateMany({
        where: { parentOrderId: order.id },
        data: {
          status: OrderStatus.CANCEL,
          fulfillmentStatus: VendorFulfillmentStatus.CANCELLED,
        },
      });
    });

    return {
      success: true,
      message: 'Order cancelled',
      order_id: order.numericId,
    };
  }

  async confirm(userId: string, saleOrderId: unknown) {
    const order = await this.prisma.order.findFirst({
      where: { numericId: Number(saleOrderId), userId },
    });
    if (!order) {
      return { success: false, message: 'Order not found', status: 404 };
    }
    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.SALE },
    });
    await this.prisma.order.updateMany({
      where: { parentOrderId: order.id },
      data: { status: OrderStatus.SALE },
    });
    return {
      success: true,
      message: 'Order confirmed',
      sale_id: order.numericId,
    };
  }

  async applyDiscount(userId: string, saleOrderId: unknown, codeRaw: string) {
    const code = (codeRaw || '').trim();
    if (!code) {
      return {
        success: false,
        message: 'Promo code is required',
        data: [],
      };
    }

    const order = await this.prisma.order.findFirst({
      where: { numericId: Number(saleOrderId), userId, parentOrderId: null },
      include: this.include,
    });
    if (!order) {
      return { success: false, message: 'Order not found', status: 404 };
    }

    const promo = await this.prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!promo || !promo.active) {
      return { success: false, message: 'Invalid promo code', data: [] };
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return { success: false, message: 'Promo code expired', data: [] };
    }
    if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
      return { success: false, message: 'Promo code usage limit reached', data: [] };
    }

    const base = money(order.amountUntaxed) + money(order.amountDiscount);
    if (promo.minOrderAmount != null && base < Number(promo.minOrderAmount)) {
      return {
        success: false,
        message: `Minimum order amount is ${promo.minOrderAmount}`,
        data: [],
      };
    }

    let discount = 0;
    if (promo.percentOff != null) {
      discount = money((base * Number(promo.percentOff)) / 100);
    } else if (promo.amountOff != null) {
      discount = money(Number(promo.amountOff));
    }
    discount = Math.min(discount, base);
    const untaxed = money(base - discount);
    const tax = taxOn(untaxed);
    const total = money(untaxed + tax);

    const updated = await this.prisma.$transaction(async (tx) => {
      const parent = await tx.order.update({
        where: { id: order.id },
        data: {
          discountCode: code.toUpperCase(),
          amountDiscount: discount,
          amountUntaxed: untaxed,
          amountTax: tax,
          amountTotal: total,
        },
        include: this.include,
      });
      await tx.discountCode.update({
        where: { id: promo.id },
        data: { usedCount: { increment: 1 } },
      });
      return parent;
    });

    return {
      success: true,
      message: 'Promo code applied',
      data: [this.serializeOrder(updated)],
    };
  }

  async findOwned(userId: string, saleId: unknown) {
    return this.prisma.order.findFirst({
      where: { numericId: Number(saleId), userId },
      include: this.include,
    });
  }

  async syncPaymentToChildren(
    orderId: string,
    data: { paymentStatus: PaymentStatus; status: OrderStatus; orderType?: string },
  ) {
    await this.prisma.order.update({
      where: { id: orderId },
      data,
    });
    await this.prisma.order.updateMany({
      where: { parentOrderId: orderId },
      data: {
        paymentStatus: data.paymentStatus,
        status: data.status,
        orderType: data.orderType,
      },
    });

    // Create payout ledger entries for paid vendor child orders
    if (
      data.paymentStatus === PaymentStatus.PAID ||
      data.paymentStatus === PaymentStatus.COD
    ) {
      const children = await this.prisma.order.findMany({
        where: { parentOrderId: orderId, vendorId: { not: null } },
      });
      for (const child of children) {
        await this.prisma.vendorPayoutEntry.upsert({
          where: { orderId: child.id },
          create: {
            orderId: child.id,
            vendorId: child.vendorId!,
            amount: child.vendorEarnings,
            commission: child.platformCommission,
          },
          update: {
            amount: child.vendorEarnings,
            commission: child.platformCommission,
          },
        });
      }
    }
  }

  async recalculateTotals(
    orderId: string,
    opts: { discountCode?: string; amountDiscount?: number } = {},
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { lines: true },
    });
    if (!order) return null;
    let untaxed = order.lines.reduce(
      (s, l) => s + money(l.unitPrice) * l.quantity,
      0,
    );
    untaxed = money(untaxed);
    const discount = money(opts.amountDiscount ?? Number(order.amountDiscount));
    const net = money(Math.max(0, untaxed - discount));
    const tax = taxOn(net);
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        amountUntaxed: net,
        amountDiscount: discount,
        amountTax: tax,
        amountTotal: money(net + tax),
        discountCode: opts.discountCode ?? order.discountCode,
      },
      include: this.include,
    });
  }

  async listAllAdmin() {
    const orders = await this.prisma.order.findMany({
      where: { parentOrderId: null },
      include: this.include,
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.serializeOrder(o));
  }

  async getAdminDetail(orderIdOrNumeric: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { id: orderIdOrNumeric },
          {
            numericId: Number.isFinite(Number(orderIdOrNumeric))
              ? Number(orderIdOrNumeric)
              : -1,
          },
        ],
      },
      include: this.include,
    });
    if (!order) return null;
    return this.serializeOrder(order);
  }

  async listForVendor(vendorId: string) {
    const orders = await this.prisma.order.findMany({
      where: { vendorId, parentOrderId: { not: null } },
      include: this.include,
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.serializeOrder(o));
  }

  async updateFulfillment(
    vendorId: string,
    orderNumericId: number,
    fulfillmentStatus: VendorFulfillmentStatus,
    description?: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { numericId: orderNumericId, vendorId },
    });
    if (!order) {
      return { success: false, message: 'Order not found', status: 404 };
    }

    const statusMap: Partial<Record<VendorFulfillmentStatus, OrderStatus>> = {
      ACCEPTED: OrderStatus.SENT,
      PROCESSING: OrderStatus.SALE,
      SHIPPED: OrderStatus.SALE,
      DELIVERED: OrderStatus.SALE,
      CANCELLED: OrderStatus.CANCEL,
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          fulfillmentStatus,
          status: statusMap[fulfillmentStatus] ?? order.status,
        },
      });
      await tx.orderTracking.create({
        data: {
          orderId: order.id,
          status: fulfillmentStatus.toLowerCase(),
          description: description || `Status: ${fulfillmentStatus}`,
        },
      });
      if (order.parentOrderId) {
        await tx.orderTracking.create({
          data: {
            orderId: order.parentOrderId,
            status: fulfillmentStatus.toLowerCase(),
            description: description || `Vendor update: ${fulfillmentStatus}`,
          },
        });
      }
    });

    if (
      fulfillmentStatus === VendorFulfillmentStatus.SHIPPED ||
      fulfillmentStatus === VendorFulfillmentStatus.DELIVERED
    ) {
      void this.notifications.notifyUser(
        order.userId,
        fulfillmentStatus === VendorFulfillmentStatus.SHIPPED
          ? 'تم شحن طلبك'
          : 'تم توصيل طلبك',
        `الطلب ${order.orderNumber}: ${fulfillmentStatus}`,
        {
          type: 'order_fulfillment',
          orderNumber: order.orderNumber,
          status: fulfillmentStatus,
        },
      );
    }

    return { success: true, message: 'Fulfillment updated' };
  }

  async addTrackingEvent(
    orderNumericId: number,
    body: { status: string; description?: string },
  ) {
    const order = await this.prisma.order.findUnique({
      where: { numericId: orderNumericId },
    });
    if (!order) {
      return { success: false, message: 'Order not found', status: 404 };
    }
    await this.prisma.orderTracking.create({
      data: {
        orderId: order.id,
        status: body.status,
        description: body.description,
      },
    });
    const statusMap: Record<string, OrderStatus> = {
      placed: OrderStatus.DRAFT,
      sent: OrderStatus.SENT,
      processing: OrderStatus.SALE,
      sale: OrderStatus.SALE,
      shipped: OrderStatus.SALE,
      delivered: OrderStatus.SALE,
      cancel: OrderStatus.CANCEL,
      cancelled: OrderStatus.CANCEL,
    };
    const mapped = statusMap[body.status.toLowerCase()];
    if (mapped) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: mapped },
      });
    }
    const fulfillMap: Record<string, VendorFulfillmentStatus> = {
      accepted: VendorFulfillmentStatus.ACCEPTED,
      processing: VendorFulfillmentStatus.PROCESSING,
      shipped: VendorFulfillmentStatus.SHIPPED,
      delivered: VendorFulfillmentStatus.DELIVERED,
      cancelled: VendorFulfillmentStatus.CANCELLED,
      cancel: VendorFulfillmentStatus.CANCELLED,
    };
    const fulfill = fulfillMap[body.status.toLowerCase()];
    if (fulfill) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { fulfillmentStatus: fulfill },
      });
    }
    return { success: true, message: 'Tracking updated' };
  }

  async listTracking(userId: string, orderId?: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        ...(orderId ? { numericId: Number(orderId) } : {}),
      },
      include: { trackingEvents: { orderBy: { createdAt: 'desc' } } },
    });
    const tracking = orders.flatMap((o) =>
      o.trackingEvents.map((t) => ({
        id: t.id,
        order_id: o.numericId,
        status: t.status,
        description: t.description || '',
        createdAt: t.createdAt.toISOString(),
      })),
    );
    return { success: true, tracking };
  }
}
