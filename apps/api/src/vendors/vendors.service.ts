import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { productInclude, serializeProductForMobile } from '../products/product.serializer';
import { UpdateVendorProfileDto } from './dto/vendor.dto';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || `store-${Date.now()}`;
}

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureProfileForUser(
    userId: string,
    opts: {
      storeName: string;
      storeNameAr?: string;
      city?: string;
      commercialRegister?: string;
      description?: string;
    },
  ) {
    const existing = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    let slug = slugify(opts.storeName);
    const clash = await this.prisma.vendorProfile.findUnique({ where: { slug } });
    if (clash) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    return this.prisma.vendorProfile.create({
      data: {
        userId,
        storeName: opts.storeName,
        storeNameAr: opts.storeNameAr,
        slug,
        city: opts.city,
        commercialRegister: opts.commercialRegister,
        description: opts.description,
      },
    });
  }

  serializePublic(profile: {
    id: string;
    storeName: string;
    storeNameAr: string | null;
    slug: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    descriptionAr: string | null;
    city: string | null;
    shippingPolicy: string | null;
    returnPolicy: string | null;
    featured: boolean;
    active: boolean;
    userId: string;
    user?: { id: string; name: string; numericId: number } | null;
    _count?: { products?: number };
    avgRating?: number;
    reviewCount?: number;
  }) {
    return {
      id: profile.id,
      userId: profile.userId,
      storeName: profile.storeName,
      storeNameAr: profile.storeNameAr,
      slug: profile.slug,
      logoUrl: profile.logoUrl,
      bannerUrl: profile.bannerUrl,
      description: profile.description,
      descriptionAr: profile.descriptionAr,
      city: profile.city,
      shippingPolicy: profile.shippingPolicy,
      returnPolicy: profile.returnPolicy,
      featured: profile.featured,
      active: profile.active,
      ownerNumericId: profile.user?.numericId,
      productCount: profile._count?.products,
      avgRating: profile.avgRating ?? 0,
      reviewCount: profile.reviewCount ?? 0,
    };
  }

  async listPublic() {
    const profiles = await this.prisma.vendorProfile.findMany({
      where: { active: true },
      include: {
        user: { select: { id: true, name: true, numericId: true } },
      },
      orderBy: [{ featured: 'desc' }, { storeName: 'asc' }],
    });

    const withCounts = await Promise.all(
      profiles.map(async (p) => {
        const [productCount, reviews] = await Promise.all([
          this.prisma.product.count({
            where: {
              ownerId: p.userId,
              status: ProductStatus.PUBLISHED,
            },
          }),
          this.prisma.review.aggregate({
            where: { vendorId: p.userId, targetType: 'VENDOR' },
            _avg: { rating: true },
            _count: true,
          }),
        ]);
        return this.serializePublic({
          ...p,
          _count: { products: productCount },
          avgRating: Number(reviews._avg.rating || 0),
          reviewCount: reviews._count,
        });
      }),
    );
    return withCounts;
  }

  async getBySlug(slug: string) {
    const profile = await this.prisma.vendorProfile.findUnique({
      where: { slug },
      include: {
        user: { select: { id: true, name: true, numericId: true } },
      },
    });
    if (!profile || !profile.active) {
      throw new NotFoundException('Store not found');
    }
    const [products, reviews] = await Promise.all([
      this.prisma.product.findMany({
        where: { ownerId: profile.userId, status: ProductStatus.PUBLISHED },
        include: productInclude,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.aggregate({
        where: { vendorId: profile.userId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);
    return {
      store: this.serializePublic({
        ...profile,
        _count: { products: products.length },
        avgRating: Number(reviews._avg.rating || 0),
        reviewCount: reviews._count,
      }),
      products: products.map(serializeProductForMobile),
    };
  }

  async getMine(userId: string) {
    const profile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.role !== Role.VENDOR) {
        throw new NotFoundException('Vendor profile not found');
      }
      return this.ensureProfileForUser(userId, {
        storeName: user.name,
      });
    }
    return profile;
  }

  async updateMine(userId: string, dto: UpdateVendorProfileDto) {
    await this.getMine(userId);
    if (dto.slug) {
      const clash = await this.prisma.vendorProfile.findFirst({
        where: { slug: dto.slug, NOT: { userId } },
      });
      if (clash) {
        throw new ForbiddenException('Slug already taken');
      }
    }
    return this.prisma.vendorProfile.update({
      where: { userId },
      data: {
        storeName: dto.storeName,
        storeNameAr: dto.storeNameAr,
        slug: dto.slug ? slugify(dto.slug) : undefined,
        logoUrl: dto.logoUrl,
        bannerUrl: dto.bannerUrl,
        description: dto.description,
        descriptionAr: dto.descriptionAr,
        city: dto.city,
        commercialRegister: dto.commercialRegister,
        shippingPolicy: dto.shippingPolicy,
        returnPolicy: dto.returnPolicy,
        bankIban: dto.bankIban,
        bankName: dto.bankName,
      },
    });
  }

  async adminSetActive(userId: string, active: boolean) {
    const profile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Vendor profile not found');
    }
    const [updatedProfile, user] = await this.prisma.$transaction([
      this.prisma.vendorProfile.update({
        where: { userId },
        data: { active },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { active },
      }),
    ]);
    return { profile: updatedProfile, user };
  }

  async adminSetCommission(userId: string, commissionPercent: number) {
    const profile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Vendor profile not found');
    }
    return this.prisma.vendorProfile.update({
      where: { userId },
      data: { commissionPercent },
    });
  }

  async listAdmin() {
    const vendors = await this.prisma.user.findMany({
      where: { role: Role.VENDOR },
      include: {
        vendorProfile: true,
        _count: { select: { products: true, vendorOrders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return vendors.map((v) => ({
      id: v.id,
      name: v.name,
      email: v.email,
      phone: v.phone,
      active: v.active,
      createdAt: v.createdAt,
      productCount: v._count.products,
      orderCount: v._count.vendorOrders,
      profile: v.vendorProfile,
    }));
  }
}
