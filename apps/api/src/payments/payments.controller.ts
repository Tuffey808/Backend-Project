import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('api')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('payment_url')
  async paymentUrl(
    @Req() req: { user: { id: string } },
    @Body() body: Record<string, unknown>,
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    const result = await this.payments.paymentUrl(req.user.id, body);
    if ('status' in result && result.status) {
      res.status(result.status);
    }
    return result;
  }

  @Post('payment/tap/webhook')
  async webhook(
    @Body() body: Record<string, unknown>,
    @Headers('hashstring') hashstring: string | undefined,
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    const result = await this.payments.handleWebhook(body, hashstring);
    if ('status' in result && result.status) {
      res.status(result.status);
    }
    return result;
  }

  @Get('payment/tap/return/order/:orderId')
  returnOrder(@Param('orderId') orderId: string) {
    return this.payments.handleReturn(Number(orderId));
  }
}
