import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { money } from '../common/mobile.utils';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize(line: {
    numericId: number;
    quantity: number;
    unitPrice: { toString(): string } | number;
    sizeId: number | null;
    sizeName: string | null;
    colorId: number | null;
    colorName: string | null;
    colorHex: string | null;
    dimensionId: number | null;
    dimensionName: string | null;
    product: { numericId: number; name: string };
  }) {
    return {
      id: line.numericId,
      product_id: line.product.numericId,
      product_name: line.product.name,
      quantity: line.quantity,
      size_id: line.sizeId
        ? [line.sizeId, line.sizeName || '']
        : [0, ''],
      color_id: line.colorId
        ? [line.colorId, line.colorName || '', line.colorHex || '']
        : [0, '', ''],
      dimension_id: line.dimensionId
        ? [line.dimensionId, line.dimensionName || '']
        : [0, ''],
      price: money(line.unitPrice),
    };
  }

  async list(userId: string | null) {
    if (!userId) {
      return { cart: [] };
    }
    const lines = await this.prisma.cartLine.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return { cart: lines.map((l) => this.serialize(l)) };
  }

  async upsert(userId: string, body: Record<string, unknown>) {
    const productNumericId = Number(body.product_id);
    const quantity = Number(body.quantity ?? 1);
    const sizeId = body.size_id ? Number(body.size_id) : null;
    const colorId = body.color_id ? Number(body.color_id) : null;
    const dimensionId = body.dimension_id ? Number(body.dimension_id) : null;

    const product = await this.prisma.product.findUnique({
      where: { numericId: productNumericId },
      include: { options: true },
    });
    if (!product) {
      return { success: false, message: 'Product not found', status: 404 };
    }

    const sizeOpt = sizeId
      ? product.options.find((o) => o.numericId === sizeId)
      : null;
    const colorOpt = colorId
      ? product.options.find((o) => o.numericId === colorId)
      : null;
    const dimOpt = dimensionId
      ? product.options.find((o) => o.numericId === dimensionId)
      : null;

    const existing = await this.prisma.cartLine.findFirst({
      where: {
        userId,
        productId: product.id,
        sizeId: sizeId || null,
        colorId: colorId || null,
        dimensionId: dimensionId || null,
      },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty <= 0) {
        await this.prisma.cartLine.delete({ where: { id: existing.id } });
      } else {
        await this.prisma.cartLine.update({
          where: { id: existing.id },
          data: { quantity: newQty },
        });
      }
    } else {
      if (quantity <= 0) {
        return { success: false, message: 'Invalid quantity', status: 400 };
      }
      const unitPrice =
        body.price != null ? Number(body.price) : Number(product.price);
      await this.prisma.cartLine.create({
        data: {
          userId,
          productId: product.id,
          quantity: Math.abs(quantity),
          sizeId,
          sizeName: sizeOpt?.name || null,
          colorId,
          colorName: colorOpt?.name || null,
          colorHex: colorOpt?.color || null,
          dimensionId,
          dimensionName: dimOpt?.name || null,
          unitPrice,
        },
      });
    }
    return { success: true, message: 'Cart updated' };
  }

  async remove(userId: string, cartId: unknown) {
    const line = await this.prisma.cartLine.findFirst({
      where: { numericId: Number(cartId), userId },
    });
    if (line) {
      await this.prisma.cartLine.delete({ where: { id: line.id } });
    }
    return { success: true, message: 'Item removed from cart' };
  }
}
