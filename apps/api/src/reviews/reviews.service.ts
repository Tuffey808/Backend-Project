import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewTargetType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    body: {
      targetType: ReviewTargetType;
      productId?: string;
      vendorId?: string;
      rating: number;
      comment?: string;
    },
  ) {
    const rating = Math.min(5, Math.max(1, Math.round(body.rating)));
    if (body.targetType === ReviewTargetType.PRODUCT) {
      if (!body.productId) {
        throw new BadRequestException('productId required');
      }
      const product = await this.prisma.product.findFirst({
        where: {
          OR: [
            { id: body.productId },
            {
              numericId: Number.isFinite(Number(body.productId))
                ? Number(body.productId)
                : -1,
            },
          ],
        },
      });
      if (!product) throw new NotFoundException('Product not found');
      return this.prisma.review.create({
        data: {
          userId,
          targetType: ReviewTargetType.PRODUCT,
          productId: product.id,
          vendorId: product.ownerId,
          rating,
          comment: body.comment?.trim(),
        },
      });
    }

    if (!body.vendorId) {
      throw new BadRequestException('vendorId required');
    }
    return this.prisma.review.create({
      data: {
        userId,
        targetType: ReviewTargetType.VENDOR,
        vendorId: body.vendorId,
        rating,
        comment: body.comment?.trim(),
      },
    });
  }

  listForProduct(productId: string) {
    return this.prisma.review.findMany({
      where: {
        OR: [
          { productId },
          {
            product: {
              numericId: Number.isFinite(Number(productId))
                ? Number(productId)
                : -1,
            },
          },
        ],
        targetType: ReviewTargetType.PRODUCT,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  listForVendor(vendorId: string) {
    return this.prisma.review.findMany({
      where: { vendorId },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, numericId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async summaryForProduct(productId: string) {
    const reviews = await this.listForProduct(productId);
    const avg =
      reviews.length === 0
        ? 0
        : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return { avgRating: Math.round(avg * 10) / 10, count: reviews.length, reviews };
  }
}
