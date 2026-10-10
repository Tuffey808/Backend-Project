import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        customer: true,
      },
    });
  }

  async get(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.CUSTOMER },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        customer: true,
        contracts: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Customer not found');
    }
    return user;
  }
}
