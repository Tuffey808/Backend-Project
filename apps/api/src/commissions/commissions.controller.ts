import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PayoutStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CommissionsService } from './commissions.service';

@Controller('api')
export class CommissionsController {
  constructor(private readonly commissions: CommissionsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/finance')
  finance() {
    return this.commissions.adminFinanceOverview();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/commission-settings')
  getSettings() {
    return this.commissions.getSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/commission-settings')
  updateSettings(@Body() body: { defaultCommissionPercent: number }) {
    return this.commissions.updateSettings(
      Number(body.defaultCommissionPercent),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/payouts')
  listPayouts() {
    return this.commissions.listPayouts();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/payouts')
  createPayout(@Body() body: { vendorId: string; note?: string }) {
    return this.commissions.createPayoutForVendor(body.vendorId, body.note);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/payouts/:id')
  updatePayout(
    @Param('id') id: string,
    @Body() body: { status: PayoutStatus },
  ) {
    return this.commissions.updatePayoutStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Get('vendor/earnings')
  myEarnings(@Req() req: { user: { id: string } }) {
    return this.commissions.vendorEarningsSummary(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Get('vendor/payouts')
  myPayouts(@Req() req: { user: { id: string } }) {
    return this.commissions.listPayouts(req.user.id);
  }
}
