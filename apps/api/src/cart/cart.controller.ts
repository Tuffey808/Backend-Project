import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';
import { CartService } from './cart.service';

@Controller('api/cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  list(@Req() req: { user?: { id: string } }) {
    return this.cart.list(req.user?.id || null);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async upsert(
    @Req() req: { user: { id: string } },
    @Body() body: Record<string, unknown>,
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    const result = await this.cart.upsert(req.user.id, body);
    if ('status' in result && result.status) {
      res.status(result.status);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  remove(
    @Req() req: { user: { id: string } },
    @Body() body: { cart_id?: number },
  ) {
    return this.cart.remove(req.user.id, body?.cart_id);
  }
}
