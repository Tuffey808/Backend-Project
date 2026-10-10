import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CardsService } from './cards.service';

@Controller('api/card')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Get()
  list(@Req() req: { user: { id: string } }) {
    return this.cards.list(req.user.id);
  }

  @Post()
  create(
    @Req() req: { user: { id: string } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.cards.create(req.user.id, body);
  }

  @Delete()
  remove(
    @Req() req: { user: { id: string } },
    @Body() body: { card_id?: number; product_id?: number },
  ) {
    return this.cards.remove(req.user.id, body?.card_id ?? body?.product_id);
  }
}
