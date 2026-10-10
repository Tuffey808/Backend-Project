import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { normalizeMobile, paginate } from '../common/mobile.utils';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, UpdateMeDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private tokenFor(user: { id: string; email: string; role: Role }) {
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private sign(user: { id: string; email: string; role: Role }) {
    return {
      accessToken: this.tokenFor(user),
      user,
    };
  }

  private publicUser<T extends { passwordHash?: string }>(user: T) {
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (exists) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        phone: dto.phone ? normalizeMobile(dto.phone) : undefined,
        role: Role.CUSTOMER,
        customer: { create: {} },
      },
      include: { customer: true },
    });
    return this.sign(this.publicUser(user) as never);
  }

  /** Portal email login → `{ accessToken, user }`. */
  async login(dto: LoginDto) {
    if (!dto.email) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { customer: true },
    });
    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.sign(this.publicUser(user) as never);
  }

  /**
   * Mobile login.
   * Returns JWT as `session_id` so RN keeps using Bearer session.
   */
  async mobileLogin(body: {
    mobile?: string;
    login?: string;
    email?: string;
    password?: string;
  }) {
    const mobileInput = (body.mobile || body.login || body.email || '').trim();
    const password = body.password || '';
    if (!mobileInput || !password) {
      return {
        success: false,
        message: 'Missing mobile or password',
      };
    }

    const login = normalizeMobile(mobileInput);
    const looksEmail = mobileInput.includes('@');

    const user = looksEmail
      ? await this.prisma.user.findUnique({
          where: { email: mobileInput.toLowerCase() },
          include: { customer: true },
        })
      : await this.prisma.user.findFirst({
          where: {
            OR: [
              { phone: login },
              { phone: mobileInput },
              { email: login },
            ],
          },
          include: { customer: true },
        });

    if (!user || !user.active) {
      return { success: false, message: 'Invalid credentials' };
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return { success: false, message: 'Invalid credentials' };
    }

    const sessionId = this.tokenFor(user);
    return {
      success: true,
      session_id: sessionId,
      uid: user.numericId,
      name: user.name,
      email: user.email || false,
      mobile: user.phone || login,
      partner_id: user.numericId,
      accessToken: sessionId,
      user: this.publicUser(user),
    };
  }

  async mobileRegister(body: Record<string, unknown>) {
    const fullName = String(body.full_name || '').trim();
    const emailRaw = String(body.email || '')
      .trim()
      .toLowerCase();
    const password = String(body.password || '');
    const confirm = String(body.confirm_password || '');
    const mobile = normalizeMobile(body.mobile_number || body.mobile || '');

    if (!fullName || !mobile || !password) {
      return {
        success: false,
        message: 'Missing required fields (name, mobile, password)',
        error: 'validation',
      };
    }
    if (password !== confirm) {
      return {
        success: false,
        message: 'Passwords do not match',
        error: 'password_mismatch',
      };
    }

    const byPhone = await this.prisma.user.findFirst({
      where: { phone: mobile },
    });
    if (byPhone) {
      return {
        success: false,
        message: 'Mobile number already registered',
        error: 'duplicate_mobile',
      };
    }

    const email = emailRaw || `user${mobile}@gmall.local`;
    const byEmail = await this.prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      return {
        success: false,
        message: 'Email already registered',
        error: 'duplicate_email',
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        name: fullName,
        phone: mobile,
        passwordHash,
        role: Role.CUSTOMER,
        customer: { create: {} },
      },
    });

    return {
      success: true,
      message: 'Registration successful',
      user_id: user.numericId,
      partner_id: user.numericId,
      mobile,
    };
  }

  async deleteUser(userId: string, requestedId: unknown) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }
    if (
      String(user.numericId) !== String(requestedId) &&
      String(user.id) !== String(requestedId)
    ) {
      return { success: false, message: 'Forbidden' };
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { active: false },
    });
    return { success: true, message: 'Account deactivated' };
  }

  async renewToken(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.active) {
      return { success: false, message: 'Unauthorized' };
    }
    const accessToken = this.tokenFor(user);
    return {
      success: true,
      message: 'Token valid',
      data: { accessToken },
      session_id: accessToken,
    };
  }

  async getCustomer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { customer: true },
    });
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }
    const c = user.customer;
    const record = {
      id: user.numericId,
      name: user.name || false,
      vat: c?.vat || false,
      email: user.email || false,
      phone: user.phone || false,
      mobile: user.phone || false,
      title: { id: false, name: false },
      street: c?.street || false,
      street2: c?.street2 || false,
      city: c?.city || false,
      state_id: {
        id: false,
        name: c?.state || false,
        code: false,
      },
      zip: c?.zip || false,
      country_id: {
        id: false,
        name: c?.country || false,
        code: c?.country || false,
      },
      child_ids: [],
      image_1920: user.imageUrl || false,
    };
    return paginate([record]);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { customer: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.publicUser(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        phone: dto.phone ? normalizeMobile(dto.phone) : undefined,
        customer: {
          upsert: {
            create: {
              street: dto.street,
              city: dto.city,
              state: dto.state,
              zip: dto.zip,
              country: dto.country,
            },
            update: {
              street: dto.street,
              city: dto.city,
              state: dto.state,
              zip: dto.zip,
              country: dto.country,
            },
          },
        },
      },
      include: { customer: true },
    });
    return this.publicUser(user);
  }
}
