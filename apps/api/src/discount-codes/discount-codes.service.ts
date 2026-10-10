import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDiscountCodeDto,
  UpdateDiscountCodeDto,
} from './dto/discount-code.dto';

@Injectable()
export class DiscountCodesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const row = await this.prisma.discountCode.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Discount code not found');
    }
    return row;
  }

  create(dto: CreateDiscountCodeDto) {
    const code = dto.code.trim().toUpperCase();
    if (!code) {
      throw new BadRequestException('Code is required');
    }
    if (dto.percentOff == null && dto.amountOff == null) {
      throw new BadRequestException('Set percent off or amount off');
    }
    return this.prisma.discountCode.create({
      data: {
        code,
        percentOff:
          dto.percentOff != null && dto.percentOff > 0 ? dto.percentOff : null,
        amountOff:
          dto.amountOff != null && dto.amountOff > 0 ? dto.amountOff : null,
        active: dto.active ?? true,
        minOrderAmount: dto.minOrderAmount,
        maxUses: dto.maxUses,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async update(id: string, dto: UpdateDiscountCodeDto) {
    await this.get(id);
    const data: Record<string, unknown> = {};

    if (dto.code !== undefined) {
      data.code = dto.code.trim().toUpperCase();
    }
    if (dto.percentOff !== undefined) {
      data.percentOff = dto.percentOff > 0 ? dto.percentOff : null;
      if (dto.percentOff > 0) {
        data.amountOff = null;
      }
    }
    if (dto.amountOff !== undefined) {
      data.amountOff = dto.amountOff > 0 ? dto.amountOff : null;
      if (dto.amountOff > 0) {
        data.percentOff = null;
      }
    }
    if (dto.active !== undefined) {
      data.active = dto.active;
    }
    if (dto.minOrderAmount !== undefined) {
      data.minOrderAmount = dto.minOrderAmount;
    }
    if (dto.maxUses !== undefined) {
      data.maxUses = dto.maxUses;
    }
    if (dto.expiresAt !== undefined) {
      data.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }

    return this.prisma.discountCode.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.discountCode.delete({ where: { id } });
  }
}
