import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { productInclude, serializeProductForMobile } from './product.serializer';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private paginate<T>(result: T[], page = 1, pageSize = 50) {
    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.min(Math.max(page, 1), totalPages);
    const start = (current - 1) * pageSize;
    const slice = result.slice(start, start + pageSize);
    return {
      count: total,
      prev: current > 1 ? current - 1 : false,
      current,
      next: current < totalPages ? current + 1 : false,
      total_pages: totalPages,
      result: slice,
    };
  }

  async listRaw(user?: { id: string; role: Role }) {
    const where =
      user?.role === Role.ADMIN
        ? {}
        : user?.role === Role.VENDOR
          ? { ownerId: user.id }
          : { status: ProductStatus.PUBLISHED };
    return this.prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async list(user?: { id: string; role: Role }) {
    const rows = await this.listRaw(user);
    return rows.map(serializeProductForMobile);
  }

  async listForMobile(page = 1) {
    const rows = await this.prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
    return this.paginate(rows.map(serializeProductForMobile), page);
  }

  async searchForMobile(query: {
    product?: string;
    category?: string;
    vendor?: string;
    page?: number;
  }) {
    const productText = query.product?.trim();
    const categoryName = query.category?.trim();
    const vendorSlug = query.vendor?.trim();
    const rows = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        AND: [
          productText
            ? {
                OR: [
                  { name: { contains: productText, mode: 'insensitive' } },
                  { nameAr: { contains: productText, mode: 'insensitive' } },
                  { description: { contains: productText, mode: 'insensitive' } },
                ],
              }
            : {},
          categoryName
            ? {
                category: {
                  OR: [
                    { name: { contains: categoryName, mode: 'insensitive' } },
                    { nameAr: { contains: categoryName, mode: 'insensitive' } },
                  ],
                },
              }
            : {},
          vendorSlug
            ? {
                owner: {
                  vendorProfile: {
                    OR: [
                      { slug: vendorSlug },
                      { storeName: { contains: vendorSlug, mode: 'insensitive' } },
                    ],
                  },
                },
              }
            : {},
        ],
      },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
    return this.paginate(rows.map(serializeProductForMobile), query.page || 1);
  }

  async get(id: string, user?: { id: string; role: Role }) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id }, { numericId: Number.isFinite(Number(id)) ? Number(id) : -1 }],
      },
      include: productInclude,
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (
      product.status !== ProductStatus.PUBLISHED &&
      user?.role !== Role.ADMIN &&
      product.ownerId !== user?.id
    ) {
      throw new ForbiddenException();
    }
    return serializeProductForMobile(product);
  }

  async create(
    dto: CreateProductDto,
    ownerId?: string,
    role?: Role,
  ) {
    const { images, options, ...rest } = dto;
    // Vendors cannot self-publish — always PENDING
    const status =
      role === Role.VENDOR
        ? ProductStatus.PENDING
        : (dto.status ?? ProductStatus.DRAFT);
    const product = await this.prisma.product.create({
      data: {
        ...rest,
        ownerId,
        status,
        images: images?.length
          ? {
              create: images.map((img, index) => ({
                url: img.url,
                name: img.name,
                sortOrder: img.sortOrder ?? index,
              })),
            }
          : undefined,
        options: options?.length
          ? {
              create: options.map((opt, index) => ({
                kind: opt.kind,
                name: opt.name,
                nameAr: opt.nameAr,
                color: opt.color,
                sortOrder: opt.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      include: productInclude,
    });
    return serializeProductForMobile(product);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    user?: { id: string; role: Role },
  ) {
    const existing = await this.prisma.product.findFirst({
      where: {
        OR: [{ id }, { numericId: Number.isFinite(Number(id)) ? Number(id) : -1 }],
      },
    });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }
    if (user?.role === Role.VENDOR && existing.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    const { images, options, ...rest } = dto;
    // Vendors cannot publish themselves; edits go back to PENDING if published fields change
    if (user?.role === Role.VENDOR) {
      if (rest.status === ProductStatus.PUBLISHED) {
        rest.status = ProductStatus.PENDING;
      }
      if (
        existing.status === ProductStatus.PUBLISHED ||
        existing.status === ProductStatus.REJECTED
      ) {
        rest.status = ProductStatus.PENDING;
      }
    }

    if (images) {
      await this.prisma.productImage.deleteMany({ where: { productId: existing.id } });
    }
    if (options) {
      await this.prisma.productOption.deleteMany({ where: { productId: existing.id } });
    }

    const product = await this.prisma.product.update({
      where: { id: existing.id },
      data: {
        ...rest,
        images: images
          ? {
              create: images.map((img, index) => ({
                url: img.url,
                name: img.name,
                sortOrder: img.sortOrder ?? index,
              })),
            }
          : undefined,
        options: options
          ? {
              create: options.map((opt, index) => ({
                kind: opt.kind,
                name: opt.name,
                nameAr: opt.nameAr,
                color: opt.color,
                sortOrder: opt.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      include: productInclude,
    });
    return serializeProductForMobile(product);
  }

  async remove(id: string, user?: { id: string; role: Role }) {
    const existing = await this.prisma.product.findFirst({
      where: {
        OR: [{ id }, { numericId: Number.isFinite(Number(id)) ? Number(id) : -1 }],
      },
    });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }
    if (user?.role === Role.VENDOR && existing.ownerId !== user.id) {
      throw new ForbiddenException();
    }
    await this.prisma.product.delete({ where: { id: existing.id } });
    return { success: true };
  }
}
