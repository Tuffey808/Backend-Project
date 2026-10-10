import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('register')
  register(
    @Req() req: { user: { id: string } },
    @Body() body: { token: string; platform?: string },
  ) {
    return this.notifications.registerToken(
      req.user.id,
      body.token,
      body.platform,
    );
  }

  @Delete('register')
  remove(
    @Req() req: { user: { id: string } },
    @Body() body: { token: string },
  ) {
    return this.notifications.removeToken(req.user.id, body.token);
  }

  @Get('tokens')
  tokens(@Req() req: { user: { id: string } }) {
    return this.notifications.listTokens(req.user.id);
  }
}
