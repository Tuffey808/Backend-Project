import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role, VendorApplicationStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateVendorApplicationDto,
  ReviewVendorApplicationDto,
} from './dto/vendor-application.dto';
import { VendorApplicationsService } from './vendor-applications.service';

@Controller('api')
export class VendorApplicationsController {
  constructor(private readonly applications: VendorApplicationsService) {}

  @Post('vendor-applications')
  create(@Body() dto: CreateVendorApplicationDto) {
    return this.applications.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/vendor-applications')
  list(@Query('status') status?: VendorApplicationStatus) {
    return this.applications.list(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/vendor-applications/:id')
  review(@Param('id') id: string, @Body() dto: ReviewVendorApplicationDto) {
    return this.applications.review(id, dto);
  }
}
