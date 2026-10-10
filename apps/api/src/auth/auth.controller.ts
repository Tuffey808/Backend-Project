import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UpdateMeDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Portal register */
  @Post('auth/register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  /**
   * Shared login:
   * - Portal: `{ email, password }` → `{ accessToken, user }`
   * - Mobile: `{ mobile|login, password }` → `{ success, session_id, ... }`
   */
  @Post('auth/login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: { status: (code: number) => unknown }) {
    const mobileHint = dto.mobile || dto.login;
    const isMobile =
      Boolean(mobileHint) &&
      (!dto.email || !String(dto.email).includes('@'));

    if (isMobile || (dto.mobile && !dto.email)) {
      const result = await this.auth.mobileLogin(dto);
      if (!result.success) {
        res.status(401);
      }
      return result;
    }

    return this.auth.login(dto);
  }

  /** Mobile register */
  @Post('register')
  @HttpCode(200)
  async mobileRegister(
    @Body() body: Record<string, unknown>,
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    const result = await this.auth.mobileRegister(body);
    if (!result.success) {
      const code =
        result.error === 'duplicate_mobile' || result.error === 'duplicate_email'
          ? 409
          : 400;
      res.status(code);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/renew-token')
  renewToken(@Req() req: { user: { id: string } }) {
    return this.auth.renewToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('deleteuser')
  async deleteUser(
    @Req() req: { user: { id: string } },
    @Body() body: { id?: string | number },
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    const result = await this.auth.deleteUser(req.user.id, body?.id);
    if (!result.success) {
      res.status(result.message === 'Forbidden' ? 403 : 401);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('getCustomer')
  getCustomer(@Req() req: { user: { id: string } }) {
    return this.auth.getCustomer(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/me')
  me(@Req() req: { user: { id: string } }) {
    return this.auth.me(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('auth/me')
  updateMe(@Req() req: { user: { id: string } }, @Body() dto: UpdateMeDto) {
    return this.auth.updateMe(req.user.id, dto);
  }
}
