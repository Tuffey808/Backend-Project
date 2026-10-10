import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrdersService } from './orders.service';

@Controller('api')
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/orders')
  listAll() {
    return this.orders.listAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/orders/:orderId/tracking')
  async addTracking(
    @Param('orderId') orderId: string,
    @Body() body: { status: string; description?: string },
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    const result = await this.orders.addTrackingEvent(Number(orderId), body);
    if ('status' in result && result.status) {
      res.status(result.status);
    }
    return result;
  }
}

@Controller('api')
@UseGuards(JwtAuthGuard)
export class OrderTrackingController {
  constructor(private readonly orders: OrdersService) {}

  @Get('order/tracking')
  tracking(
    @Req() req: { user: { id: string } },
    @Query('order_id') orderId?: string,
  ) {
    return this.orders.listTracking(req.user.id, orderId);
  }
}
