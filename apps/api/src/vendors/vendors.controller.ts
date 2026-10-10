import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  AdminVendorActiveDto,
  AdminVendorCommissionDto,
  UpdateVendorProfileDto,
} from './dto/vendor.dto';
import { VendorsService } from './vendors.service';

@Controller()
export class VendorsController {
  constructor(private readonly vendors: VendorsService) {}

  @Get('api/vendors')
  listPublic() {
    return this.vendors.listPublic();
  }

  @Get('api/vendors/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.vendors.getBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Get('api/vendor/profile')
  getMine(@Req() req: { user: { id: string } }) {
    return this.vendors.getMine(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Patch('api/vendor/profile')
  updateMine(
    @Req() req: { user: { id: string } },
    @Body() dto: UpdateVendorProfileDto,
  ) {
    return this.vendors.updateMine(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('api/admin/vendors/:userId/active')
  setActive(
    @Param('userId') userId: string,
    @Body() dto: AdminVendorActiveDto,
  ) {
    return this.vendors.adminSetActive(userId, dto.active);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('api/admin/vendors/:userId/commission')
  setCommission(
    @Param('userId') userId: string,
    @Body() dto: AdminVendorCommissionDto,
  ) {
    return this.vendors.adminSetCommission(userId, dto.commissionPercent);
  }
}
