import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export type JwtPayload = { sub: string; email: string; role: string };

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return null;
  }
  let token = header.slice(7).trim();
  if (token.startsWith('session_id=')) {
    token = token.slice('session_id='.length);
  }
  return token || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractBearer]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-gmall-portal-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { customer: true },
    });
    if (!user || !user.active) {
      throw new UnauthorizedException();
    }
    const { passwordHash: _, ...safe } = user;
    return safe;
  }
}
