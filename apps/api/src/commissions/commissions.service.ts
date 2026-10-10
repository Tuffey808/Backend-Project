import { Injectable, NotFoundException } from '@nestjs/common';
import { PayoutStatus } from '@prisma/client';
import { money } from '../common/mobile.utils';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    return this.prisma.platformSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', defaultCommissionPercent: 10 },
      update: {},
    });
  }

  async updateSettings(defaultCommissionPercent: number) {
    return this.prisma.platformSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', defaultCommissionPercent },
      update: { defaultCommissionPercent },
    });
  }

  async vendorEarningsSummary(vendorId: string) {
    const entries = await this.prisma.vendorPayoutEntry.findMany({
      where: { vendorId },
      include: {
        order: {
          select: {
            orderNumber: true,
            numericId: true,
            amountTotal: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const unpaid = entries.filter((e) => !e.payoutId);
    const totalEarned = money(
      entries.reduce((s, e) => s + Number(e.amount), 0),
    );
    const totalCommission = money(
      entries.reduce((s, e) => s + Number(e.commission), 0),
    );
    const pendingPayout = money(
      unpaid.reduce((s, e) => s + Number(e.amount), 0),
    );
    return {
      totalEarned,
      totalCommission,
      pendingPayout,
      entries,
    };
  }

  async listPayouts(vendorId?: string) {
    return this.prisma.vendorPayout.findMany({
      where: vendorId ? { vendorId } : undefined,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            vendorProfile: true,
          },
        },
        entries: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPayoutForVendor(vendorId: string, note?: string) {
    const unpaid = await this.prisma.vendorPayoutEntry.findMany({
      where: { vendorId, payoutId: null },
    });
    if (!unpaid.length) {
      throw new NotFoundException('No unpaid earnings for this vendor');
    }
    const amount = money(unpaid.reduce((s, e) => s + Number(e.amount), 0));
    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.vendorPayout.create({
        data: {
          vendorId,
          amount,
          status: PayoutStatus.PENDING,
          note,
          periodStart: unpaid[unpaid.length - 1]?.createdAt,
          periodEnd: unpaid[0]?.createdAt,
        },
      });
      await tx.vendorPayoutEntry.updateMany({
        where: { id: { in: unpaid.map((e) => e.id) } },
        data: { payoutId: payout.id },
      });
      return tx.vendorPayout.findUniqueOrThrow({
        where: { id: payout.id },
        include: { entries: true },
      });
    });
  }

  async updatePayoutStatus(id: string, status: PayoutStatus) {
    const payout = await this.prisma.vendorPayout.findUnique({ where: { id } });
    if (!payout) {
      throw new NotFoundException('Payout not found');
    }
    return this.prisma.vendorPayout.update({
      where: { id },
      data: {
        status,
        paidAt: status === PayoutStatus.PAID ? new Date() : payout.paidAt,
      },
      include: { entries: true, vendor: true },
    });
  }

  async adminFinanceOverview() {
    const [settings, entries, payouts, gmv] = await Promise.all([
      this.getSettings(),
      this.prisma.vendorPayoutEntry.aggregate({
        _sum: { amount: true, commission: true },
        _count: true,
      }),
      this.prisma.vendorPayout.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.order.aggregate({
        where: { parentOrderId: null },
        _sum: { amountTotal: true },
        _count: true,
      }),
    ]);
    return {
      settings,
      gmv: money(gmv._sum.amountTotal || 0),
      orderCount: gmv._count,
      totalVendorEarnings: money(entries._sum.amount || 0),
      totalCommission: money(entries._sum.commission || 0),
      payoutsByStatus: payouts,
    };
  }
}
