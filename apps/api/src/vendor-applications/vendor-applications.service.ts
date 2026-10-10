import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, VendorApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { normalizeMobile } from '../common/mobile.utils';
import { PrismaService } from '../prisma/prisma.service';
import { VendorsService } from '../vendors/vendors.service';
import {
  CreateVendorApplicationDto,
  ReviewVendorApplicationDto,
} from './dto/vendor-application.dto';

@Injectable()
export class VendorApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vendors: VendorsService,
  ) {}

  async create(dto: CreateVendorApplicationDto) {
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مسجل مسبقاً');
    }
    const pending = await this.prisma.vendorApplication.findFirst({
      where: { email, status: VendorApplicationStatus.PENDING },
    });
    if (pending) {
      throw new ConflictException('لديك طلب قيد المراجعة بالفعل');
    }

    return this.prisma.vendorApplication.create({
      data: {
        businessName: dto.businessName.trim(),
        contactName: dto.contactName.trim(),
        email,
        phone: normalizeMobile(dto.phone),
        category: dto.category,
        city: dto.city?.trim(),
        description: dto.description?.trim(),
        commercialRegister: dto.commercialRegister?.trim(),
      },
    });
  }

  list(status?: VendorApplicationStatus) {
    return this.prisma.vendorApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async review(id: string, dto: ReviewVendorApplicationDto) {
    const application = await this.prisma.vendorApplication.findUnique({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (application.status !== VendorApplicationStatus.PENDING) {
      throw new ConflictException('Application already reviewed');
    }

    const approve = dto.approve !== false;
    if (!approve) {
      return this.prisma.vendorApplication.update({
        where: { id },
        data: {
          status: VendorApplicationStatus.REJECTED,
          adminNotes: dto.adminNotes?.trim(),
          reviewedAt: new Date(),
        },
      });
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: application.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already has an account');
    }

    const tempPassword = crypto.randomBytes(6).toString('base64url');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: application.email,
          passwordHash,
          name: application.contactName,
          phone: application.phone,
          role: Role.VENDOR,
        },
      });
      const updated = await tx.vendorApplication.update({
        where: { id },
        data: {
          status: VendorApplicationStatus.APPROVED,
          adminNotes: dto.adminNotes?.trim(),
          reviewedAt: new Date(),
          userId: user.id,
        },
      });
      return { application: updated, tempPassword, userId: user.id };
    });

    await this.vendors.ensureProfileForUser(result.userId, {
      storeName: application.businessName,
      city: application.city || undefined,
      commercialRegister: application.commercialRegister || undefined,
      description: application.description || undefined,
    });

    return {
      success: true,
      message: 'تمت الموافقة وإنشاء حساب المورد',
      application: result.application,
      credentials: {
        email: application.email,
        temporaryPassword: result.tempPassword,
      },
    };
  }
}
