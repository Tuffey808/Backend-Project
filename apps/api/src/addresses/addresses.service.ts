import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeMobile } from '../common/mobile.utils';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  serialize(a: {
    numericId: number;
    name: string;
    street: string;
    street2: string | null;
    city: string;
    state: string | null;
    zip: string | null;
    mobile: string | null;
  }) {
    return {
      _id: String(a.numericId),
      street: a.street || '',
      street2: a.street2 || '',
      city: a.city || '',
      state: a.state || '',
      zip: a.zip || '',
      mobile: a.mobile || '',
      name: a.name || '',
    };
  }

  async list(userId: string) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return {
      success: true,
      message: 'OK',
      data: addresses.map((a) => this.serialize(a)),
    };
  }

  async remove(userId: string, partnerId: unknown) {
    const addr = await this.prisma.address.findFirst({
      where: { numericId: Number(partnerId), userId },
    });
    if (addr) {
      await this.prisma.address.delete({ where: { id: addr.id } });
    }
    return { success: true, message: 'Address deleted' };
  }

  async upsert(userId: string, body: Record<string, unknown>) {
    if (body.update_profile) {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: body.name != null ? String(body.name) : undefined,
          phone:
            body.phone != null ? normalizeMobile(body.phone) : undefined,
          email:
            body.email != null
              ? String(body.email).toLowerCase()
              : undefined,
          imageUrl:
            body.image_1920 && body.image_1920 !== false
              ? String(body.image_1920)
              : undefined,
          customer: {
            upsert: {
              create: {
                street: body.street != null ? String(body.street) : undefined,
                city: body.city != null ? String(body.city) : undefined,
                zip: body.zip != null ? String(body.zip) : undefined,
              },
              update: {
                street: body.street != null ? String(body.street) : undefined,
                city: body.city != null ? String(body.city) : undefined,
                zip: body.zip != null ? String(body.zip) : undefined,
              },
            },
          },
        },
      });
      return {
        success: true,
        message: 'Profile updated',
        profile_id: user.numericId,
      };
    }

    if (body.id) {
      const addr = await this.prisma.address.findFirst({
        where: { numericId: Number(body.id), userId },
      });
      if (!addr) {
        return { success: false, message: 'Address not found', status: 404 };
      }
      const updated = await this.prisma.address.update({
        where: { id: addr.id },
        data: {
          name: body.name != null ? String(body.name) : addr.name,
          street: body.street != null ? String(body.street) : addr.street,
          street2:
            body.street2 != null ? String(body.street2) : addr.street2,
          city: body.city != null ? String(body.city) : addr.city,
          zip: body.zip != null ? String(body.zip) : addr.zip,
          mobile:
            body.mobile != null
              ? normalizeMobile(body.mobile)
              : addr.mobile,
          state: body.state != null ? String(body.state) : addr.state,
        },
      });
      return {
        success: true,
        message: 'Address updated',
        address_id: updated.numericId,
      };
    }

    const created = await this.prisma.address.create({
      data: {
        userId,
        name: String(body.name || ''),
        street: String(body.street || ''),
        street2: body.street2 != null ? String(body.street2) : null,
        city: String(body.city || ''),
        zip: body.zip != null ? String(body.zip) : null,
        mobile: body.mobile != null ? normalizeMobile(body.mobile) : null,
        state: body.state != null ? String(body.state) : null,
        country: body.country != null ? String(body.country) : 'SA',
      },
    });
    return {
      success: true,
      message: 'Address created',
      address_id: created.numericId,
    };
  }
}
