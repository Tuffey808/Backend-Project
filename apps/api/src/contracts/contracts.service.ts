import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: { id: string; role: Role }) {
    if (user.role === Role.ADMIN) {
      return this.prisma.contract.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          vendor: { select: { id: true, name: true, email: true } },
        },
      });
    }
    if (user.role === Role.VENDOR) {
      return this.prisma.contract.findMany({
        where: { vendorId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          vendor: { select: { id: true, name: true, email: true } },
        },
      });
    }
    return this.prisma.contract.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string, user: { id: string; role: Role }) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        vendor: { select: { id: true, name: true, email: true } },
      },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }
    if (
      user.role !== Role.ADMIN &&
      contract.customerId !== user.id &&
      contract.vendorId !== user.id
    ) {
      throw new ForbiddenException();
    }
    return contract;
  }

  create(dto: CreateContractDto) {
    return this.prisma.contract.create({
      data: {
        title: dto.title,
        titleAr: dto.titleAr,
        status: dto.status,
        terms: dto.terms,
        customerId: dto.customerId,
        vendorId: dto.vendorId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateContractDto,
    user?: { id: string; role: Role },
  ) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (user && user.role !== Role.ADMIN) {
      if (contract.customerId !== user.id) {
        throw new ForbiddenException();
      }
      return this.prisma.contract.update({
        where: { id },
        data: {
          titleAr: dto.titleAr,
          terms: dto.terms,
        },
      });
    }

    return this.prisma.contract.update({
      where: { id },
      data: {
        title: dto.title,
        titleAr: dto.titleAr,
        status: dto.status,
        terms: dto.terms,
        customerId: dto.customerId,
        vendorId: dto.vendorId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.contract.findUniqueOrThrow({ where: { id } });
    return this.prisma.contract.delete({ where: { id } });
  }
}
