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
import { AdminService } from './admin.service';

@Controller('api')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/stats')
  stats() {
    return this.admin.stats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/vendors')
  vendors() {
    return this.admin.listVendors();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/products/pending')
  pendingProducts() {
    return this.admin.pendingProducts();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/products/:id/approval')
  approveProduct(
    @Param('id') id: string,
    @Body() body: { approve?: boolean },
  ) {
    return this.admin.approveProduct(id, body.approve !== false);
  }

  @UseGuards(JwtAuthGuard)
  @Get('account/summary')
  summary(@Req() req: { user: { id: string; role: Role } }) {
    return this.admin.customerSummary(req.user.id);
  }
}
