import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  private mask(cardNumber: string) {
    const digits = String(cardNumber || '').replace(/\D/g, '');
    const last4 = digits.slice(-4);
    return `**** **** **** ${last4}`;
  }

  async list(userId: string) {
    const cards = await this.prisma.savedCard.findMany({ where: { userId } });
    return {
      success: true,
      message: 'OK',
      data: cards.map((c) => ({
        user_id: String(c.userId),
        card_id: String(c.numericId),
        cvv: '',
        expiry: c.expiry || '',
        card_number: c.cardNumber,
        card_type: c.cardType || '',
      })),
    };
  }

  async create(userId: string, body: Record<string, unknown>) {
    const masked = this.mask(String(body.card_number || ''));
    const card = await this.prisma.savedCard.create({
      data: {
        userId,
        cardNumber: masked,
        cardType: body.card_type != null ? String(body.card_type) : null,
        expiry: body.expiry != null ? String(body.expiry) : null,
      },
    });
    return {
      success: true,
      message: 'Card saved',
      card_id: card.numericId,
    };
  }

  async remove(userId: string, cardId: unknown) {
    const card = await this.prisma.savedCard.findFirst({
      where: { numericId: Number(cardId), userId },
    });
    if (card) {
      await this.prisma.savedCard.delete({ where: { id: card.id } });
    }
    return { success: true, message: 'Card deleted' };
  }
}
