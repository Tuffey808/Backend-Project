import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Role, VendorFulfillmentStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrdersService } from './orders.service';

@Controller('api')
export class VendorOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Get('vendor/orders')
  list(@Req() req: { user: { id: string } }) {
    return this.orders.listForVendor(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Patch('vendor/orders/:orderId/fulfillment')
  async updateFulfillment(
    @Req() req: { user: { id: string } },
    @Param('orderId') orderId: string,
    @Body()
    body: { status: VendorFulfillmentStatus; description?: string },
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    const result = await this.orders.updateFulfillment(
      req.user.id,
      Number(orderId),
      body.status,
      body.description,
    );
    if ('status' in result && typeof result.status === 'number') {
      res.status(result.status);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/orders/:orderId')
  detail(@Param('orderId') orderId: string) {
    return this.orders.getAdminDetail(orderId);
  }
}
