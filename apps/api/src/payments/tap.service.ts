import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { money } from '../common/mobile.utils';

const TAP_CHARGES_URL = 'https://api.tap.company/v2/charges/';

@Injectable()
export class TapService {
  private readonly logger = new Logger(TapService.name);

  private config() {
    const useSandbox = (process.env.TAP_USE_SANDBOX || 'true') === 'true';
    const secretKey = useSandbox
      ? process.env.TAP_SANDBOX_SECRET_KEY || ''
      : process.env.TAP_PRODUCTION_SECRET_KEY || '';
    return {
      useSandbox,
      secretKey,
      merchantId: process.env.TAP_MERCHANT_ID || '',
      publicBaseUrl: (
        process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3001}`
      ).replace(/\/$/, ''),
    };
  }

  async createCharge(input: {
    amount: number;
    currency: string;
    orderNumericId: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    redirectUrl: string;
    webhookUrl: string;
  }) {
    const cfg = this.config();
    if (!cfg.secretKey) {
      return {
        error:
          'Tap secret key is not configured (TAP_SANDBOX_SECRET_KEY / TAP_PRODUCTION_SECRET_KEY)',
      };
    }

    const nameParts = (input.customerName || 'Customer').split(' ');
    const phoneDigits = String(input.customerPhone || '500000000').replace(
      /\D/g,
      '',
    );
    const phoneNumber = phoneDigits.startsWith('0')
      ? phoneDigits.slice(1)
      : phoneDigits;

    const payload: Record<string, unknown> = {
      amount: money(input.amount),
      currency: (input.currency || 'SAR').toUpperCase(),
      customer_initiated: true,
      threeDSecure: true,
      save_card: false,
      description: `G-mall Order ${input.orderNumber}`,
      statement_descriptor: 'G-mall',
      metadata: {
        sale_order_id: String(input.orderNumericId),
        order_name: input.orderNumber,
      },
      reference: {
        transaction: String(input.orderNumericId),
        order: input.orderNumber,
      },
      receipt: {
        email: Boolean(input.customerEmail),
        sms: false,
      },
      customer: {
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' ') || '-',
        email: input.customerEmail || 'customer@gmall.local',
        phone: {
          country_code: '966',
          number: phoneNumber || '500000000',
        },
      },
      source: { id: 'src_all' },
      redirect: { url: input.redirectUrl },
      post: { url: input.webhookUrl },
    };
    if (cfg.merchantId) {
      payload.merchant = { id: cfg.merchantId };
    }

    try {
      const res = await fetch(TAP_CHARGES_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.secretKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        this.logger.error(`Tap HTTP ${res.status}: ${JSON.stringify(data)}`);
        const message =
          (data.message as string) ||
          JSON.stringify(data.errors || data) ||
          'Tap charge failed';
        return { error: message };
      }
      const transaction = (data.transaction || {}) as Record<string, unknown>;
      const redirect = (data.redirect || {}) as Record<string, unknown>;
      const paymentUrl =
        (transaction.url as string) || (redirect.url as string) || null;
      return {
        chargeId: data.id as string,
        paymentUrl,
        raw: data,
        status: data.status as string,
      };
    } catch (err) {
      this.logger.error(err);
      return { error: err instanceof Error ? err.message : String(err) };
    }
  }

  verifyWebhookHash(
    payload: Record<string, unknown>,
    postedHash: string | undefined,
  ): boolean {
    const cfg = this.config();
    if (!cfg.secretKey || !postedHash) {
      return false;
    }
    const currency = String(payload.currency || 'SAR').toUpperCase();
    const decimals = ['BHD', 'KWD', 'OMR', 'JOD'].includes(currency) ? 3 : 2;
    const amount = Number(payload.amount || 0).toFixed(decimals);
    const reference = (payload.reference || {}) as Record<string, unknown>;
    const transaction = (payload.transaction || {}) as Record<string, unknown>;
    const toHash =
      `x_id${payload.id || ''}` +
      `x_amount${amount}` +
      `x_currency${currency}` +
      `x_gateway_reference${reference.gateway || ''}` +
      `x_payment_reference${reference.payment || ''}` +
      `x_status${payload.status || ''}` +
      `x_created${transaction.created || ''}`;
    const computed = crypto
      .createHmac('sha256', cfg.secretKey)
      .update(toHash)
      .digest('hex');
    if (computed.length !== postedHash.length) {
      return false;
    }
    try {
      return crypto.timingSafeEqual(
        Buffer.from(computed),
        Buffer.from(postedHash),
      );
    } catch {
      return false;
    }
  }

  isSuccessStatus(status?: string) {
    return ['CAPTURED', 'AUTHORIZED', 'PAID'].includes(
      (status || '').toUpperCase(),
    );
  }

  publicUrls(orderNumericId: number) {
    const base = this.config().publicBaseUrl;
    return {
      redirectUrl: `${base}/api/payment/tap/return/order/${orderNumericId}`,
      webhookUrl: `${base}/api/payment/tap/webhook`,
    };
  }
}
