import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductStatus, Role, VendorApplicationStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { productInclude, serializeProductForMobile } from '../products/product.serializer';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async stats() {
    const [
      customers,
      vendors,
      products,
      pendingProducts,
      publishedProducts,
      orders,
      contracts,
      vendorApplications,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
      this.prisma.user.count({ where: { role: Role.VENDOR } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: ProductStatus.PENDING } }),
      this.prisma.product.count({ where: { status: ProductStatus.PUBLISHED } }),
      this.prisma.order.count(),
      this.prisma.contract.count(),
      this.prisma.vendorApplication.count({
        where: { status: VendorApplicationStatus.PENDING },
      }),
    ]);
    return {
      customers,
      vendors,
      products,
      pendingProducts,
      publishedProducts,
      orders,
      contracts,
      vendorApplications,
    };
  }

  listVendors() {
    return this.prisma.user.findMany({
      where: { role: Role.VENDOR },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        numericId: true,
        email: true,
        name: true,
        phone: true,
        active: true,
        createdAt: true,
        vendorProfile: true,
        _count: { select: { products: true, vendorOrders: true } },
      },
    });
  }

  async pendingProducts() {
    const rows = await this.prisma.product.findMany({
      where: { status: ProductStatus.PENDING },
      include: {
        ...productInclude,
        owner: {
          select: {
            id: true,
            numericId: true,
            name: true,
            email: true,
            vendorProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((p) => ({
      ...serializeProductForMobile(p),
      owner: p.owner,
    }));
  }

  async approveProduct(id: string, approve: boolean) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id }, { numericId: Number.isFinite(Number(id)) ? Number(id) : -1 }],
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.prisma.product.update({
      where: { id: product.id },
      data: {
        status: approve ? ProductStatus.PUBLISHED : ProductStatus.REJECTED,
      },
    });
    if (product.ownerId) {
      void this.notifications.notifyUser(
        product.ownerId,
        approve ? 'تمت الموافقة على المنتج' : 'تم رفض المنتج',
        product.name,
        {
          type: 'product_approval',
          productId: product.id,
          status: approve ? 'PUBLISHED' : 'REJECTED',
        },
      );
    }
    return {
      success: true,
      message: approve ? 'Product approved' : 'Product rejected',
      status: approve ? ProductStatus.PUBLISHED : ProductStatus.REJECTED,
    };
  }

  customerSummary(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        customer: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
            favorites: true,
          },
        },
        contracts: {
          select: { id: true, title: true, status: true, startDate: true, endDate: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }
}
