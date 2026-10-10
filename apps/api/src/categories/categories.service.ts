import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { serializeCategoryForMobile } from '../products/product.serializer';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForMobile() {
    const rows = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    const result = rows.map(serializeCategoryForMobile);
    return {
      count: result.length,
      prev: false,
      current: 1,
      next: false,
      total_pages: 1,
      result,
    };
  }

  list() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async get(id: string) {
    const existing = await this.prisma.category.findFirst({
      where: {
        OR: [{ id }, { numericId: Number.isFinite(Number(id)) ? Number(id) : -1 }],
      },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }
    return existing;
  }

  create(data: { name: string; nameAr?: string; imageUrl?: string }) {
    return this.prisma.category.create({ data });
  }

  async update(
    id: string,
    data: { name?: string; nameAr?: string; imageUrl?: string },
  ) {
    const existing = await this.prisma.category.findFirst({
      where: {
        OR: [{ id }, { numericId: Number.isFinite(Number(id)) ? Number(id) : -1 }],
      },
    });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }
    return this.prisma.category.update({ where: { id: existing.id }, data });
  }
}
