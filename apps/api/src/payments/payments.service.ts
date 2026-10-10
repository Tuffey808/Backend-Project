import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { money } from '../common/mobile.utils';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { TapService } from './tap.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
    private readonly tap: TapService,
  ) {}

  async paymentUrl(userId: string, body: Record<string, unknown>) {
    // Token confirmation from Tap WebView / SDK
    if (body.token) {
      const saleId = body.sale_id || body.sale_order_id;
      const order = await this.orders.findOwned(userId, saleId);
      if (!order) {
        return { success: false, message: 'Order not found', status: 404 };
      }
      await this.orders.syncPaymentToChildren(order.id, {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.SALE,
      });
      await this.prisma.tapCharge.create({
        data: {
          orderId: order.id,
          tapChargeId: String(body.token),
          status: 'TOKEN_CONFIRMED',
          amount: order.amountTotal,
          currency: order.currency,
        },
      });
      return {
        success: true,
        message: 'Payment confirmed',
        sale_id: order.numericId,
        invoice_ids: 0,
        invoice_data: {},
      };
    }

    const saleId = body.sale_id;
    const orderType = String(body.order_type || 'prepaid');
    const discountCode = String(body.discount_code || '').trim();

    let order = await this.orders.findOwned(userId, saleId);
    if (!order) {
      return { success: false, message: 'Order not found', status: 404 };
    }

    if (discountCode) {
      const applied = await this.orders.applyDiscount(
        userId,
        saleId,
        discountCode,
      );
      if (!applied.success) {
        return {
          success: false,
          message: applied.message || 'Invalid promo code',
          status: 400,
        };
      }
      order = await this.orders.findOwned(userId, saleId);
      if (!order) {
        return { success: false, message: 'Order not found', status: 404 };
      }
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: { orderType },
    });

    if (orderType === 'cod') {
      await this.orders.syncPaymentToChildren(order.id, {
        status: OrderStatus.SALE,
        paymentStatus: PaymentStatus.COD,
        orderType,
      });
      return {
        success: true,
        message: 'Cash on delivery order placed',
        sale_id: order.numericId,
        invoice_ids: 0,
        invoice_data: {
          customer: {},
          invoice_lines: [],
          total_untaxed: money(order.amountUntaxed),
          total_taxed: money(order.amountTotal),
          payment_url: '',
        },
      };
    }

    const urls = this.tap.publicUrls(order.numericId);
    const charge = await this.tap.createCharge({
      amount: Number(order.amountTotal),
      currency: order.currency,
      orderNumericId: order.numericId,
      orderNumber: order.orderNumber,
      customerName: order.user.name,
      customerEmail: order.user.email,
      customerPhone: order.user.phone || order.address?.mobile,
      redirectUrl: urls.redirectUrl,
      webhookUrl: urls.webhookUrl,
    });

    if (!charge.paymentUrl) {
      return {
        success: false,
        message: charge.error || 'Could not create payment URL',
        status: 502,
      };
    }

    await this.prisma.tapCharge.create({
      data: {
        orderId: order.id,
        tapChargeId: charge.chargeId,
        status: charge.status || 'INITIATED',
        paymentUrl: charge.paymentUrl,
        amount: order.amountTotal,
        currency: order.currency,
        rawResponse: charge.raw as object,
      },
    });
    await this.prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: PaymentStatus.PENDING },
    });

    const partner = order.user;
    const addr = order.address;
    return {
      success: true,
      message: 'Payment URL generated',
      sale_id: order.numericId,
      invoice_ids: 0,
      invoice_data: {
        customer: {
          id: partner.numericId,
          name: partner.name,
          email: partner.email || '',
          phone: partner.phone || '',
          street: addr?.street || '',
          street2: addr?.street2 || '',
          city: addr?.city || '',
          zip: addr?.zip || '',
          country_id: false,
          country_name: addr?.country || 'SA',
        },
        invoice_lines: order.lines.map((line) => ({
          product: line.title,
          quantity: line.quantity,
          price_unit: money(line.unitPrice),
          subtotal: money(Number(line.unitPrice) * line.quantity),
          tax: 0,
        })),
        total_untaxed: money(order.amountUntaxed),
        total_taxed: money(order.amountTotal),
        payment_url: charge.paymentUrl,
      },
    };
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    hashstring: string | undefined,
  ) {
    if (hashstring && !this.tap.verifyWebhookHash(payload, hashstring)) {
      return { success: false, message: 'Invalid hash', status: 401 };
    }
    const status = String(payload.status || '');
    const chargeId = String(payload.id || '');
    const reference = (payload.reference || {}) as Record<string, unknown>;
    const saleOrderId = Number(
      (payload.metadata as Record<string, unknown>)?.sale_order_id ||
        reference.transaction ||
        0,
    );

    const charge = await this.prisma.tapCharge.findFirst({
      where: {
        OR: [
          { tapChargeId: chargeId },
          { order: { numericId: saleOrderId } },
        ],
      },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });

    if (charge) {
      await this.prisma.tapCharge.update({
        where: { id: charge.id },
        data: {
          status,
          tapChargeId: chargeId || charge.tapChargeId,
          rawResponse: payload as object,
        },
      });
      if (this.tap.isSuccessStatus(status)) {
        await this.orders.syncPaymentToChildren(charge.orderId, {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.SALE,
        });
      } else if (['FAILED', 'DECLINED', 'CANCELLED'].includes(status.toUpperCase())) {
        await this.orders.syncPaymentToChildren(charge.orderId, {
          paymentStatus: PaymentStatus.FAILED,
          status: charge.order.status,
        });
      }
    }

    return { success: true };
  }

  async handleReturn(orderNumericId: number) {
    const order = await this.prisma.order.findUnique({
      where: { numericId: orderNumericId },
    });
    if (!order) {
      return { success: false, message: 'Order not found' };
    }
    return {
      success: true,
      sale_id: order.numericId,
      paymentStatus: order.paymentStatus,
      status: order.status,
      message:
        order.paymentStatus === PaymentStatus.PAID
          ? 'Payment successful'
          : 'Payment pending — waiting for webhook confirmation',
    };
  }
}
