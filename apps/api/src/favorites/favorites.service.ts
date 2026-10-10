import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const favs = await this.prisma.favorite.findMany({
      where: { userId },
      include: { product: true },
    });
    return {
      code: 200,
      success: true,
      message: 'OK',
      data: favs.map((f) => ({
        id: f.id,
        product_id: f.product.numericId,
      })),
    };
  }

  async add(userId: string, productId: unknown) {
    const product = await this.prisma.product.findUnique({
      where: { numericId: Number(productId) },
    });
    if (!product) {
      return { success: false, message: 'Product not found', status: 404 };
    }
    await this.prisma.favorite.upsert({
      where: {
        userId_productId: { userId, productId: product.id },
      },
      create: { userId, productId: product.id },
      update: {},
    });
    return { success: true, message: 'Added to favorites' };
  }

  async sync(userId: string, productIds: unknown[]) {
    const keepNumeric = new Set(
      (productIds || []).map((p) => Number(p)).filter((n) => !Number.isNaN(n)),
    );
    const products = await this.prisma.product.findMany({
      where: { numericId: { in: [...keepNumeric] } },
    });
    const keepIds = new Set(products.map((p) => p.id));
    const all = await this.prisma.favorite.findMany({ where: { userId } });
    for (const fav of all) {
      if (!keepIds.has(fav.productId)) {
        await this.prisma.favorite.delete({ where: { id: fav.id } });
      }
    }
    for (const p of products) {
      await this.prisma.favorite.upsert({
        where: { userId_productId: { userId, productId: p.id } },
        create: { userId, productId: p.id },
        update: {},
      });
    }
    return { success: true, message: 'Favorites updated' };
  }

  async remove(userId: string, favId: string) {
    const fav = await this.prisma.favorite.findFirst({
      where: { id: favId, userId },
    });
    if (fav) {
      await this.prisma.favorite.delete({ where: { id: fav.id } });
    }
    return { success: true, message: 'Favorite removed' };
  }
}
