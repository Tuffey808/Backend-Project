import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get('order')
  list(@Req() req: { user: { id: string } }) {
    return this.orders.list(req.user.id);
  }

  @Post('order')
  async create(
    @Req() req: { user: { id: string } },
    @Body() body: { partner_id?: number },
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    const result = await this.orders.createFromCart(
      req.user.id,
      body?.partner_id,
    );
    if ('status' in result && result.status) {
      res.status(result.status);
    }
    return result;
  }

  @Post('cancelorder')
  async cancel(
    @Req() req: { user: { id: string } },
    @Body() body: { sale_order_id?: number },
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    const result = await this.orders.cancel(req.user.id, body?.sale_order_id);
    if ('status' in result && result.status) {
      res.status(result.status);
    }
    return result;
  }

  @Post('finalorder')
  async finalOrder(
    @Req() req: { user: { id: string } },
    @Body() body: { sale_order_id?: number },
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    const result = await this.orders.confirm(req.user.id, body?.sale_order_id);
    if ('status' in result && result.status) {
      res.status(result.status);
    }
    return result;
  }

  @Post('discount')
  async discount(
    @Req() req: { user: { id: string } },
    @Body() body: { sale_order_id?: number; code?: string },
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    const result = await this.orders.applyDiscount(
      req.user.id,
      body?.sale_order_id,
      body?.code || '',
    );
    if ('status' in result && result.status) {
      res.status(result.status);
    }
    return result;
  }
}
