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
import { AddressesService } from './addresses.service';

@Controller('api/address')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}

  @Get()
  list(@Req() req: { user: { id: string } }) {
    return this.addresses.list(req.user.id);
  }

  @Post()
  async upsert(
    @Req() req: { user: { id: string } },
    @Body() body: Record<string, unknown>,
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    const result = await this.addresses.upsert(req.user.id, body);
    if ('status' in result && result.status) {
      res.status(result.status);
    }
    return result;
  }

  @Delete()
  remove(
    @Req() req: { user: { id: string } },
    @Body() body: { partner_id?: number },
  ) {
    return this.addresses.remove(req.user.id, body?.partner_id);
  }
}
