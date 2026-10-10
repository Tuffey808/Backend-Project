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
import { ReturnStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReturnsService } from './returns.service';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  constructor(private readonly returns: ReturnsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post('returns')
  create(
    @Req() req: { user: { id: string } },
    @Body() body: { orderId: string | number; reason: string; vendorId?: string },
  ) {
    return this.returns.create(req.user.id, body);
  }

  @Get('returns')
  list(@Req() req: { user: { id: string; role: Role } }) {
    return this.returns.listForUser(req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VENDOR)
  @Patch('returns/:id')
  update(
    @Param('id') id: string,
    @Req() req: { user: { id: string; role: Role } },
    @Body() body: { status: ReturnStatus; adminNotes?: string },
  ) {
    return this.returns.updateStatus(
      id,
      req.user,
      body.status,
      body.adminNotes,
    );
  }
}
