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
import { DisputeStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DisputesService } from './disputes.service';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputes: DisputesService) {}

  @Post('disputes')
  create(
    @Req() req: { user: { id: string } },
    @Body()
    body: {
      subject: string;
      description: string;
      orderId?: string | number;
      vendorId?: string;
    },
  ) {
    return this.disputes.create(req.user.id, body);
  }

  @Get('disputes')
  list(@Req() req: { user: { id: string; role: Role } }) {
    return this.disputes.list(req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('disputes/:id')
  resolve(
    @Param('id') id: string,
    @Req() req: { user: { id: string; role: Role } },
    @Body() body: { status: DisputeStatus; resolution?: string },
  ) {
    return this.disputes.resolve(id, req.user, body);
  }
}
