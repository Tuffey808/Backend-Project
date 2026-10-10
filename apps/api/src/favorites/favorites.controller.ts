import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@Controller('api/favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  list(@Req() req: { user: { id: string } }) {
    return this.favorites.list(req.user.id);
  }

  @Post()
  async upsert(
    @Req() req: { user: { id: string } },
    @Body() body: { product_id?: number; products?: number[] },
    @Res({ passthrough: true }) res: { status: (code: number) => unknown },
  ) {
    if (body.product_id != null) {
      const result = await this.favorites.add(req.user.id, body.product_id);
      if ('status' in result && result.status) {
        res.status(result.status);
      }
      return result;
    }
    if (body.products != null) {
      return this.favorites.sync(req.user.id, body.products);
    }
    res.status(400);
    return { success: false, message: 'Invalid request' };
  }

  @Delete(':favId')
  remove(
    @Req() req: { user: { id: string } },
    @Param('favId') favId: string,
  ) {
    return this.favorites.remove(req.user.id, favId);
  }
}
